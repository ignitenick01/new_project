# Car Insurance Risk Modeling

This project builds predictive models on a car insurance dataset to estimate customer risk and compare how well different modeling approaches separate likely outcomes.

## What The Project Is About

- Domain: insurance risk analytics
- Goal: prepare customer-level policy data for supervised learning and evaluate classification performance
- Main deliverables: Jupyter notebook analysis and final written report

## Data Cleaning And Preparation

The notebook includes a practical tabular cleaning workflow before modeling:

- removed the record identifier column because it does not carry predictive meaning
- profiled numeric fields with histograms and boxplots to understand skew and unusual values
- summarized potential outliers with IQR-based checks
- imputed missing `CREDIT_SCORE` values with the median
- imputed missing `ANNUAL_MILEAGE` values with the median
- converted categorical variables into model-ready dummy variables or one-hot encoded columns
- standardized numeric fields before fitting models that are sensitive to scale

These steps help turn a mixed customer-policy dataset into a stable training table where missing numeric fields, inconsistent category handling, and scale differences do not distort model behavior.

## Analysis And Modeling

- exploratory analysis of variable distributions
- logistic regression baseline
- tree-based model comparison including random forest and gradient boosting
- performance interpretation in notebook and report form

## Project Contents

- `code/ALY6020_FinalExamCode_JunhuiHu.ipynb`: main notebook
- `code/car_insurance (1) (1).csv`: dataset used for the project
- `reports/ALY6020_Module 6 Final Exam_JunhuiHu.pdf`: final report

## Why This Project Is Useful To Review

This project is a clean example of core predictive analytics work: inspect the data, fix missing values, encode mixed variable types correctly, scale where appropriate, and compare multiple classifiers on the same business problem.
