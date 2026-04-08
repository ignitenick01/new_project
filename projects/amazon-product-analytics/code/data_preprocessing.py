# data_preprocessing.py
import numpy as np
import pandas as pd
import re

def load_amazon_data(filepath="Amazon_Products.csv"):
    """
    Load the Amazon products CSV into a DataFrame.
    """
    df = pd.read_csv(filepath, low_memory=False)
    return df

def drop_columns_with_missing_data(df, perc=70.0):
    """
    Drop columns that have perc% or more missing values.
    """
    # Calculate the minimum number of non-NA values required
    min_count = int(((100 - perc) / 100) * df.shape[0] + 1)
    df_dropped = df.dropna(axis=1, thresh=min_count)
    return df_dropped

def clean_mod_df(df):
    """
    Clean and preprocess the DataFrame for further analysis.
    This function:
      - Drops rows missing 'uniq_id'
      - Removes unwanted entries in 'uniq_id'
      - Extracts a new column 'item_type'
      - Cleans the price string into a numeric column 'price_new'
      - Extracts numeric values from stock and review rating columns
      - Splits the category string into several subcategory columns
      - Converts columns to appropriate numeric types
      - Removes price outliers using the IQR method
    """
    # Drop rows missing unique ID
    df.dropna(subset=['uniq_id'], inplace=True)
    
    # Remove unwanted entry – here we remove rows where 'uniq_id' equals "}"
    df = df[df['uniq_id'] != "}"]
    
    # Create new column for item type (new/used)
    df["item_type"] = df['number_available_in_stock'].str.extract(r"(new|used)", flags=re.IGNORECASE)
    
    # Clean the price column:
    # Remove the pound symbol and commas, then convert to numeric.
    df["price_new"] = (df["price"]
                       .str.split(" ", expand=True)[0]
                       .str.replace("£", "", regex=False)
                       .str.replace(",", "", regex=False))
    
    # Extract numeric value from 'number_available_in_stock'
    df["number_available_in_stock"] = (df["number_available_in_stock"]
                                        .astype(str)
                                        .str.extract("(\d+)")
                                        .astype(float))
    
    # Extract average review rating (the part before " out of ")
    df["average_review_rating_clean"] = df["average_review_rating"].str.split(" out of ", expand=True)[0]
    
    # Split the main category string into subcategories
    split_df = df["amazon_category_and_sub_category"].str.split(">", expand=True)
    df["main_category"] = split_df.get(0)
    df["sub_category_1"] = split_df.get(1)
    df["sub_category_2"] = split_df.get(2)
    df["sub_category_3"] = split_df.get(3)
    
    # Convert price and review rating columns to numeric
    df["price_new"] = pd.to_numeric(df["price_new"], errors='coerce')
    df["average_review_rating_clean"] = pd.to_numeric(df["average_review_rating_clean"], errors='coerce')
    
    # Clean number_of_reviews: remove commas and convert to numeric
    df["number_of_reviews"] = (df["number_of_reviews"]
                               .str.replace(",", "", regex=False))
    df["number_of_reviews"] = pd.to_numeric(df["number_of_reviews"], errors='coerce')
    
    # Convert number_of_answered_questions to float
    df["number_of_answered_questions"] = df["number_of_answered_questions"].astype(float)
    
    # Drop unused columns
    df.drop(["price", "average_review_rating", "amazon_category_and_sub_category"], axis=1, inplace=True)
    
    # Remove price outliers using the IQR method
    Q1 = df['price_new'].quantile(0.25)
    Q3 = df['price_new'].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    df = df[(df['price_new'] >= lower_bound) & (df['price_new'] <= upper_bound)]
    
    return df

def clean_df_for_logistic(df):
    """
    Clean the original DataFrame for the logistic regression section.
    Drops unnamed and irrelevant columns, and cleans the price column.
    """
    # Remove unnamed columns and drop irrelevant ones
    df = df.loc[:, ~df.columns.str.contains('Unnamed')]
    drop_cols = ["uniq_id", "product_name", "manufacturer", "amazon_category_and_sub_category", "description"]
    df = df.drop(columns=drop_cols, errors="ignore")
    
    def clean_price(value):
        if isinstance(value, str):
            value = value.replace('£', '').replace(',', '').strip()
            match = re.findall(r"(\d+\.\d+)", value)
            if len(match) == 2:
                low, high = map(float, match)
                return (low + high) / 2
            elif len(match) == 1:
                return float(match[0])
        return np.nan
    
    df["price"] = df["price"].apply(clean_price)
    df = df.dropna(subset=["price"])
    
    return df

def clean_price_for_correlation(value):
    """
    A standalone helper to clean price strings (used in correlation analysis).
    """
    if isinstance(value, str):
        value = value.replace('£', '').replace(',', '').strip()
        match = re.findall(r"(\d+\.\d+)", value)
        if len(match) == 2:
            low, high = map(float, match)
            return (low + high) / 2
        elif len(match) == 1:
            return float(match[0])
    return np.nan