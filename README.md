# Junhui (Nick) Hu Project Portfolio

This repository is a curated data science and machine learning portfolio built to support my resume. It combines graduate capstones, applied modeling work, and one extracurricular automation project, with an emphasis on how raw data was cleaned, validated, and turned into analysis-ready datasets.

## What This Portfolio Shows

- Healthcare, insurance, retail, and public-health analytics projects
- Python, R, SQL-style tabular workflows, and notebook-based modeling
- Data cleaning decisions such as missing-value handling, feature standardization, duplicate removal, categorical recoding, and outlier checks
- End-to-end project communication through notebooks, scripts, reports, and presentation decks

## Featured Projects

### Healthcare and Risk Modeling

These projects are the closest match to the modeling and analytics themes on my resume.

- `projects/jupyter-aly6040-data-mining-capstone/`
  - Predicts diabetic patient readmission from hospital encounter data.
  - Cleaning highlights: replaced `?` placeholders with missing values, removed duplicate encounters, dropped high-missing columns such as `weight`, `payer_code`, and `medical_specialty`, removed low-information drug fields, recoded age bands and the readmission target, and checked utilization variables for outliers before modeling.
- `projects/insurance-risk-prediction/`
  - Compares traditional machine learning and neural-network approaches for insurance risk prediction.
  - Cleaning highlights: converted `-1` placeholders to missing values, imputed continuous variables with medians, treated binary and categorical variables separately, dropped identifier fields, standardized numeric inputs, and built a modeling matrix ready for algorithm comparison.
- `projects/car-insurance-risk-modeling/`
  - Builds predictive models on a car insurance dataset to estimate customer risk.
  - Cleaning highlights: removed the ID field, reviewed numeric distributions and IQR-based outliers, imputed missing `CREDIT_SCORE` and `ANNUAL_MILEAGE` values with medians, one-hot encoded categorical variables, and scaled numeric features before model fitting.

### Consumer and Retail Analytics

- `projects/amazon-product-analytics/`
  - Analyzes Amazon product catalog and review data using EDA, classification, and sentiment workflows.
  - Cleaning highlights: removed rows missing key product identifiers, stripped currency symbols and commas from prices, converted text ratings and review counts to numeric fields, split hierarchical category strings into structured category columns, filled missing text/categorical values, and removed price outliers with IQR rules.
- `projects/jupyter-aly6110-retail-eda-dashboard/`
  - Explores retail ordering behavior and supports dashboard reporting.
  - Cleaning highlights: merged product, aisle, department, and order tables, summarized missingness across merged data, filled `days_since_prior_order` with a sentinel value, replaced missing aisle and department labels with `Unknown`, and prepared grouped features for dashboard analysis and dimensionality reduction.

### Statistical Analysis and Public Health

- `projects/population-health-statistical-analysis/`
  - R-based statistical analysis portfolio focused on population health, heart attack risk, and survey-style public datasets.
  - Cleaning highlights: standardized column names, converted categorical fields to factors, created analysis buckets for education, urbanization, and cholesterol levels, cleaned string-based work-experience fields, and reshaped data for summary statistics, hypothesis testing, and regression.
- `projects/r-6015-capstone-analysis/`
  - R capstone centered on chronic disease indicators and subgroup comparisons.
  - Cleaning highlights: filtered the public-health dataset to relevant questions and stratifications, kept age-adjusted rate records, removed rows missing outcome values, dropped fully null columns, created region labels from states, and derived median-based risk groups for downstream tests.
- `projects/jupyter-aly6080-exploratory-analysis/`
  - Exploratory analysis and project-framing materials for an individual proposal.
  - Cleaning highlights: resolved missing count-style variables such as journal-index approximations, profiled fields before analysis, and used notebook exploration to shape the final analytical question.

## Extracurricular Project

- `extracurricular/life-time-class-sniper/`
  - A browser userscript hobby project that automates a class-booking workflow.
  - Included to show practical scripting, DOM automation, and real-world problem solving outside course assignments.

## How To Read This Repo

If you only have a few minutes, start with:

1. `projects/jupyter-aly6040-data-mining-capstone/`
2. `projects/insurance-risk-prediction/`
3. `projects/population-health-statistical-analysis/`
4. `projects/amazon-product-analytics/`

Each project README now answers four quick questions:

- What problem the project is solving
- What kind of data it uses
- How the data was cleaned and prepared
- What analysis or modeling methods were applied next

## Repository Structure

```text
projects/
  amazon-product-analytics/
  car-insurance-risk-modeling/
  insurance-risk-prediction/
  jupyter-aly6040-data-mining-capstone/
  jupyter-aly6080-exploratory-analysis/
  jupyter-aly6110-retail-eda-dashboard/
  population-health-statistical-analysis/
  r-6015-capstone-analysis/

extracurricular/
  life-time-class-sniper/
```
