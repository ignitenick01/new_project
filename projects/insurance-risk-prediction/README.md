# Insurance Risk Prediction

This project compares traditional machine learning models and neural-network-style approaches for insurance risk prediction using a structured tabular dataset.

## What The Project Is About

- Domain: insurance and risk scoring
- Goal: evaluate how different model families perform once messy raw fields are converted into a consistent modeling dataset
- Main deliverables: final notebook, demo notebook, project brief, written report, and presentation deck

## Data Cleaning And Preparation

The notebooks focus heavily on turning placeholder-coded raw data into model-ready features:

- replaced `-1` values with missing values when they represented unavailable information
- separated the target variable from predictors and removed the record ID field
- imputed missing continuous variables with medians
- handled binary and categorical variables with separate preprocessing rules rather than forcing one generic treatment
- dropped high-missing fields when they added more noise than signal
- retained some categorical unknown states intentionally when they represented a meaningful "not observed" category
- standardized numeric variables with `StandardScaler`
- assembled a final feature matrix for model comparison across classical ML and neural approaches

These choices matter because risk datasets often encode missingness in non-obvious ways. By explicitly converting placeholders, segmenting variable types, and scaling numeric features, the project produces a cleaner and more interpretable training dataset.

## Analysis And Modeling

- classical risk-prediction baselines such as logistic regression
- neural-network-oriented comparison workflow
- model evaluation through notebook experimentation, report writing, and presentation materials

## Project Contents

- `code/eai6010_final.ipynb`: main final notebook
- `code/eai6010_final_demo.ipynb`: smaller demo notebook
- `reports/Project Description.pdf`: original project brief
- `reports/Final Project - EAI 6010 Week 6.pdf`: final written report
- `reports/Evaluating Traditional and Neural Network Models for Risk Prediction.pptx`: presentation deck

## Why This Project Is Useful To Review

This folder shows how I clean and structure tabular risk data before comparing models. The preprocessing logic is as important as the algorithms because placeholder values, missing fields, and mixed feature types strongly affect downstream performance.
