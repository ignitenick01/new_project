# sentiment_analysis.py
import pandas as pd
import numpy as np
import re
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from imblearn.over_sampling import SMOTE
from sklearn.linear_model import LinearRegression
from xgboost import XGBClassifier
from scipy.sparse import hstack

def perform_sentiment_analysis(df):
    """
    Perform sentiment analysis on product descriptions.
    - Computes sentiment scores using VADER.
    - Preprocesses text (using TF-IDF) and numerical features.
    - Trains SVM and XGBoost classifiers for sentiment prediction.
    - Trains a Linear Regression model to predict the sentiment score.
    """
    # Create a review column and compute sentiment scores
    df['Review'] = df['product_description'].astype(str)
    analyzer = SentimentIntensityAnalyzer()
    df['Sentiment_Score'] = df['Review'].apply(lambda review: analyzer.polarity_scores(review)['compound'])
    df['Sentiment'] = df['Sentiment_Score'].apply(lambda score: 1 if score >= 0 else 0)
    
    # Text preprocessing
    stop_words = set(stopwords.words("english"))
    lemmatizer = WordNetLemmatizer()
    
    def preprocess_text(text):
        text = re.sub(r'\W', ' ', text.lower())
        words = text.split()
        words = [lemmatizer.lemmatize(w) for w in words if w not in stop_words or w in ['not', 'never']]
        return " ".join(words)
    
    df["Clean_Review"] = df["Review"].apply(preprocess_text)
    
    vectorizer = TfidfVectorizer(ngram_range=(1,2), max_features=5000)
    X_text = vectorizer.fit_transform(df["Clean_Review"])
    
    # Ensure numerical features exist
    for col in ['price', 'rating', 'review_length']:
        if col not in df.columns:
            df[col] = 0
            print(f"Column '{col}' not found. Setting default value 0.")
    
    df['price'] = df['price'].str.replace('£', '').str.replace(',', '')
    df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(0)
    X_numeric = df[['price', 'rating', 'review_length']].fillna(0)
    X_numeric_np = X_numeric.to_numpy().astype(np.float64)
    
    # Combine text and numeric features
    X = hstack((X_text, X_numeric_np))
    y = df["Sentiment"]
    
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X, y)
    
    X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.2, random_state=42)
    
    # Train SVM model
    svm_model = SVC(kernel="rbf", class_weight="balanced")
    svm_model.fit(X_train, y_train)
    y_pred = svm_model.predict(X_test)
    print("SVM Model Accuracy:", accuracy_score(y_test, y_pred))
    print(classification_report(y_test, y_pred))
    
    # Train XGBoost model
    xgb_model = XGBClassifier(use_label_encoder=False, eval_metric="logloss")
    xgb_model.fit(X_train, y_train)
    y_pred_xgb = xgb_model.predict(X_test)
    print("XGBoost Model Accuracy:", accuracy_score(y_test, y_pred_xgb))
    print(classification_report(y_test, y_pred_xgb))
    
    # Linear Regression for sentiment score prediction
    X_reg = df[['price', 'rating', 'review_length']].fillna(0)
    y_reg = df['Sentiment_Score']
    X_train_reg, X_test_reg, y_train_reg, y_test_reg = train_test_split(X_reg, y_reg, test_size=0.2, random_state=42)
    reg_model = LinearRegression()
    reg_model.fit(X_train_reg, y_train_reg)
    y_pred_reg = reg_model.predict(X_test_reg)
    
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    print("Linear Regression - Mean Absolute Error:", mean_absolute_error(y_test_reg, y_pred_reg))
    print("Linear Regression - Mean Squared Error:", mean_squared_error(y_test_reg, y_pred_reg))
    print("Linear Regression - R2 Score:", r2_score(y_test_reg, y_pred_reg))
    
    return svm_model, xgb_model, reg_model