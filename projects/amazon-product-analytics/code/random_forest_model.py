# random_forest_model.py
import numpy as np
import pandas as pd
import re
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

def price_category(price):
    if price < 10:
        return "Low"
    elif 10 <= price <= 30:
        return "Medium"
    else:
        return "High"

def train_random_forest(mod_df):
    """
    Train a Random Forest classifier using stratified 5-fold cross-validation
    to predict the product price category.
    """
    df = mod_df.copy()
    df = df.dropna(subset=['price_new'])
    df['price_category'] = df['price_new'].apply(price_category)
    
    features = ['manufacturer', 'number_available_in_stock', 'number_of_reviews',
                'number_of_answered_questions', 'main_category', 'sub_category_1', 'item_type']
    
    # Encode categorical features
    label_encoders = {}
    for col in ['manufacturer', 'main_category', 'sub_category_1', 'item_type']:
        df[col] = df[col].fillna('Unknown')
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le
    
    # Fill missing numerical values with median
    for col in ['number_available_in_stock', 'number_of_reviews', 'number_of_answered_questions']:
        df[col] = df[col].fillna(df[col].median())
    
    # Process text data from customer questions/answers
    df['customer_questions_and_answers'] = df['customer_questions_and_answers'].fillna("No Questions")
    df['num_questions'] = df['customer_questions_and_answers'].apply(lambda x: len(re.findall(r'//', x)) + 1)
    df['text_length'] = df['customer_questions_and_answers'].apply(lambda x: len(x.split()))
    df['avg_word_length'] = df['customer_questions_and_answers'].apply(lambda x: np.mean([len(word) for word in x.split()]) if x.split() else 0)
    df['unique_word_ratio'] = df['customer_questions_and_answers'].apply(lambda x: len(set(x.split())) / len(x.split()) if len(x.split()) > 0 else 0)
    
    scaler = MinMaxScaler()
    X_numeric_scaled = scaler.fit_transform(df[features + ['num_questions', 'text_length', 'avg_word_length', 'unique_word_ratio']])
    
    df['product_description'] = df['product_description'].fillna("")
    df['combined_text'] = df['product_name'] + " " + df['product_description'] + " " + df['customer_questions_and_answers']
    vectorizer = TfidfVectorizer(max_features=2000, ngram_range=(1,3))
    X_text = vectorizer.fit_transform(df['combined_text']).toarray()
    
    X_combined = np.hstack((X_numeric_scaled, X_text))
    y = df['price_category']
    
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X_combined, y)
    
    kf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    accuracy_scores = []
    conf_matrices = []
    
    for train_index, test_index in kf.split(X_resampled, y_resampled):
        X_train, X_test = X_resampled[train_index], X_resampled[test_index]
        y_train, y_test = y_resampled.iloc[train_index], y_resampled.iloc[test_index]
        
        rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
        rf_model.fit(X_train, y_train)
        y_pred = rf_model.predict(X_test)
        accuracy_scores.append(accuracy_score(y_test, y_pred))
        conf_matrices.append(confusion_matrix(y_test, y_pred))
    
    print("Random Forest Cross-Validation Accuracy Scores:", accuracy_scores)
    print("Mean Accuracy:", np.mean(accuracy_scores))
    print("Standard Deviation:", np.std(accuracy_scores))
    
    mean_conf_matrix = np.mean(conf_matrices, axis=0)
    plt.figure(figsize=(6, 5))
    sns.heatmap(mean_conf_matrix, annot=True, fmt=".1f", cmap="Blues",
                xticklabels=['Low', 'Medium', 'High'], yticklabels=['Low', 'Medium', 'High'])
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.title("Average Confusion Matrix Across Folds")
    plt.show()
    
    return rf_model