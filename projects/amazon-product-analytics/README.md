# Amazon Product Analytics

This project analyzes Amazon product and review data to understand product characteristics, customer feedback patterns, and classification signals across mixed numeric, categorical, and text fields.

## What The Project Is About

- Domain: e-commerce product analytics
- Goal: turn messy product listings and review attributes into structured features for EDA, classification, and sentiment analysis
- Main deliverables: notebook analysis, reusable preprocessing code, multiple model scripts, final report, and presentation

## Data Cleaning And Preparation

The raw product file needed substantial cleaning before it was usable for modeling:

- removed rows missing key product identifiers such as `uniq_id`
- dropped columns with excessive missingness when they were unlikely to support reliable analysis
- cleaned `price` by stripping currency symbols and commas, then converted it to numeric
- parsed text-based ratings such as `x out of 5` into numeric review scores
- converted review-count fields into numeric values for downstream modeling
- split the raw Amazon category string into separate structured category columns
- filled missing categorical values with placeholders such as `Unknown` where needed for model input
- filled missing numeric values with medians or means depending on the model workflow
- filled missing text fields before sentiment or text-feature steps
- removed extreme price outliers with an IQR rule so a small number of unusual listings would not dominate the analysis

These cleaning steps make the dataset easier to interpret because they separate raw web-style strings into business-friendly features such as product type, normalized price, review volume, and category group.

## Analysis And Modeling

- exploratory analysis through the main notebook and EDA script
- logistic regression for classification
- naive Bayes and random forest comparison workflows
- sentiment-oriented text analysis using review-related fields
- feature scaling and encoding tailored to each model family

## Project Contents

- `code/new_amazon_analysis.ipynb`: main notebook
- `code/data_preprocessing.py`: reusable cleaning and feature engineering logic
- `code/eda.py`: exploratory plots and summaries
- `code/logistic_regression_model.py`: logistic regression workflow
- `code/naive_bayes_model.py`: naive Bayes workflow
- `code/random_forest_model.py`: random forest workflow
- `code/sentiment_analysis.py`: sentiment analysis workflow
- `code/Amazon_Products.csv`: dataset snapshot used in the project
- `reports/Capstone_Report_final_group1.pdf`: final report
- `reports/6140 capstone Amazon product group1.pptx`: presentation deck

## Why This Project Is Useful To Review

This folder is a good example of how I handle messy real-world tabular data: I start by cleaning identifiers, prices, categories, and review fields, then move into structured modeling and interpretation.
