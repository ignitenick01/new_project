# naive_bayes_model.py
import numpy as np
import pandas as pd
import re
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from imblearn.over_sampling import SMOTE
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score, roc_curve
import seaborn as sns
import matplotlib.pyplot as plt

def price_category(price):
    if price < 10:
        return "Low"
    elif 10 <= price <= 30:
        return "Medium"
    else:
        return "High"

def train_naive_bayes(mod_df):
    """
    Train a Multinomial Naïve Bayes classifier to predict a product's price category.
    Incorporates both numerical features and text features extracted via TF-IDF.
    """
    df = mod_df.copy()
    df = df.dropna(subset=['price_new'])
    df['price_category'] = df['price_new'].apply(price_category)
    
    features = ['manufacturer', 'number_available_in_stock', 'number_of_reviews',
                'number_of_answered_questions', 'main_category', 'sub_category_1', 'item_type']
    
    # Encode categorical variables
    label_encoders = {}
    for col in ['manufacturer', 'main_category', 'sub_category_1', 'item_type']:
        df[col] = df[col].fillna('Unknown')
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le
    
    # Fill missing numerical values with median
    for col in ['number_available_in_stock', 'number_of_reviews', 'number_of_answered_questions']:
        df[col] = df[col].fillna(df[col].median())
    
    # Process text column for customer questions/answers
    df['customer_questions_and_answers'] = df['customer_questions_and_answers'].fillna("No Questions")
    df['num_questions'] = df['customer_questions_and_answers'].apply(lambda x: len(re.findall(r'//', x)) + 1)
    df['text_length'] = df['customer_questions_and_answers'].apply(lambda x: len(x.split()))
    df['avg_word_length'] = df['customer_questions_and_answers'].apply(lambda x: np.mean([len(word) for word in x.split()]) if x.split() else 0)
    df['unique_word_ratio'] = df['customer_questions_and_answers'].apply(lambda x: len(set(x.split())) / len(x.split()) if len(x.split()) > 0 else 0)
    
    scaler = MinMaxScaler()
    X_numeric_scaled = scaler.fit_transform(df[features + ['num_questions', 'text_length', 'avg_word_length', 'unique_word_ratio']])
    
    df['product_name'] = df['product_name'].fillna("")
    df['product_description'] = df['product_description'].fillna("")
    df['combined_text'] = df['product_name'] + " " + df['product_description'] + " " + df['customer_questions_and_answers']
    
    vectorizer = TfidfVectorizer(max_features=1500, ngram_range=(1,3))
    X_text = vectorizer.fit_transform(df['combined_text']).toarray()
    
    X_combined = np.hstack((X_numeric_scaled, X_text))
    y = df['price_category']
    
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X_combined, y)
    
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.2, random_state=42)
    
    nb_model = MultinomialNB()
    nb_model.fit(X_train, y_train)
    y_pred = nb_model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    print("Naïve Bayes Model Accuracy:", accuracy)
    print("Classification Report:\n", classification_report(y_test, y_pred))
    
    conf_matrix = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(6, 5))
    sns.heatmap(conf_matrix, annot=True, fmt='d', cmap="Blues", 
                xticklabels=nb_model.classes_, yticklabels=nb_model.classes_)
    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")
    plt.title("Naïve Bayes Confusion Matrix")
    plt.show()
    
    # ROC Curve
    y_prob = nb_model.predict_proba(X_test)
    y_test_bin = pd.get_dummies(y_test)
    plt.figure(figsize=(8, 6))
    for i, label in enumerate(nb_model.classes_):
        fpr, tpr, _ = roc_curve(y_test_bin.iloc[:, i], y_prob[:, i])
        auc = roc_auc_score(y_test_bin.iloc[:, i], y_prob[:, i])
        plt.plot(fpr, tpr, label=f'Class {label} (AUC = {auc:.2f})')
    plt.plot([0, 1], [0, 1], 'k--')
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve")
    plt.legend()
    plt.show()
    
    return nb_model