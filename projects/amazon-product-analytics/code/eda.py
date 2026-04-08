# eda.py
import matplotlib.pyplot as plt
import seaborn as sns

def plot_price_distribution(df, price_column="price_new"):
    plt.figure(figsize=(8, 5))
    sns.histplot(df[price_column].dropna(), bins=50, kde=True)
    plt.xlabel("Price (£)")
    plt.ylabel("Count")
    plt.title("Distribution of Product Prices")
    plt.show()

def plot_review_distribution(df, rating_column="average_review_rating_clean"):
    plt.figure(figsize=(8, 5))
    sns.histplot(df[rating_column].dropna(), bins=20, kde=True)
    plt.xlabel("Average Review Rating")
    plt.ylabel("Count")
    plt.title("Distribution of Review Ratings")
    plt.show()

def plot_manufacturer_counts(df):
    # Calculate counts and average ratings by manufacturer
    manufacturer_counts = df['manufacturer'].value_counts().reset_index()
    manufacturer_counts.columns = ['manufacturer', 'count']
    average_ratings = df.groupby('manufacturer')['average_review_rating_clean'].mean().reset_index()
    manufacturer_summary = manufacturer_counts.merge(average_ratings, on='manufacturer')
    top_manufacturers = manufacturer_summary.sort_values(by='count', ascending=False).head(10)
    
    plt.figure(figsize=(12, 8))
    ax = sns.barplot(x='manufacturer', y='count', data=top_manufacturers, color='purple')
    ax.set_xticklabels(ax.get_xticklabels(), rotation=45, horizontalalignment='right')
    plt.title('Popular Manufacturers')
    plt.xlabel('Manufacturer')
    plt.ylabel('Count')
    plt.show()
    
def plot_category_counts(df):
    # Combine subcategory columns to form a composite category
    df['combined_category'] = df['sub_category_1'].astype(str) + ' - ' + df['sub_category_3'].astype(str)
    top_categories = df['combined_category'].value_counts().nlargest(10)
    plt.figure(figsize=(10, 6))
    sns.barplot(x=top_categories.values, y=top_categories.index, palette="viridis")
    plt.xlabel("Number of Products")
    plt.ylabel("Category")
    plt.title("Top 10 Categories by Number of Products")
    plt.show()

def plot_price_vs_rating(df, rating_column="average_review_rating_clean", price_column="price_new"):
    plt.figure(figsize=(8, 5))
    sns.regplot(x=rating_column, y=price_column, data=df, scatter_kws={'alpha': 0.5})
    plt.xlabel("Average Review Rating")
    plt.ylabel("Price (£)")
    plt.title("Price vs. Average Review Rating")
    plt.show()

def plot_correlation_matrix(df, columns=["price_new", "number_of_reviews", "average_review_rating_clean"]):
    corr_matrix = df[columns].corr()
    plt.figure(figsize=(6, 4))
    sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', fmt=".2f")
    plt.title("Correlation Matrix")
    plt.show()