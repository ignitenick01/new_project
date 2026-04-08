# logistic_regression_model.py
import pandas as pd
import numpy as np
import re
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import matplotlib.pyplot as plt

def train_logistic_regression(mod_df):
    """
    Train a logistic regression model for classifying products based on whether
    the number of reviews is above the median.
    """

    df = mod_df.copy()
    # Remove unnecessary columns
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
    
    # Encode categorical variables
    categorical_cols = df.select_dtypes(include=["object"]).columns
    label_encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le
    
    df = df.fillna(df.mean())
    
    # Define target and features
    target_column = 'number_of_reviews'
    X = df.drop(columns=[target_column], errors="ignore")
    y = df[target_column]
    
    # Convert target to binary: 1 if above median, else 0
    y = (y > y.median()).astype(int)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    model = LogisticRegression()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    conf_matrix = confusion_matrix(y_test, y_pred)
    class_report = classification_report(y_test, y_pred)
    
    print(f"Logistic Regression Accuracy: {accuracy:.2f}")
    print("Confusion Matrix:")
    print(conf_matrix)
    print("Classification Report:")
    print(class_report)
    
    plt.figure(figsize=(6, 5))
    plt.imshow(conf_matrix, cmap="Blues", interpolation="nearest")
    plt.colorbar()
    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")
    plt.title("Logistic Regression Confusion Matrix")
    plt.show()
    
    return model