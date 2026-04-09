# Population Health Statistical Analysis

This folder groups together R-based statistical analysis work that aligns most directly with the population health and statistical modeling themes on my resume.

## What The Project Is About

- Domain: population health, socio-economic indicators, heart attack risk, and public dataset analysis
- Goal: clean public-health style datasets and apply statistical testing, correlation analysis, and regression for interpretation
- Main deliverables: multiple R scripts, milestone reports, and presentation materials

## Data Cleaning And Preparation

Across the scripts in this folder, the data-cleaning work includes several concrete examples:

- standardized messy column names with `make.names()` so variables could be referenced consistently in R
- converted categorical health fields such as outcome, gender, smoker status, diabetes, hypertension, and family history into factors
- grouped and summarized data at the disease and country level for population-health comparisons
- created derived buckets for variables such as `Education.Index`, `Urbanization.Rate`, and cholesterol level ranges
- cleaned string-based work-experience values with text replacement before aggregation in survey-style analysis
- reshaped numeric fields into long format for histograms and boxplots
- prepared cleaner analysis tables for correlation tests, regression, and comparison testing

These cleaning decisions are important because public-health and survey datasets often mix raw strings, coded categories, and continuous indicators. The scripts document how those raw fields were turned into analysis-ready variables with clear statistical meaning.

## Analysis And Methods

- hypothesis testing
- correlation analysis
- linear regression
- grouped summary statistics
- R-based exploratory analysis and interpretation

## Project Contents

- `code/project_milestone1_Hu.R`: milestone analysis script
- `code/project_milestone2_Hu.R`: follow-up milestone analysis script
- `code/project_final_Hu.R`: final R analysis script
- `code/w1_R Script_Hu.R`: early statistical analysis script
- `code/w3_R_Script_Hu.R`: hypothesis testing script
- `code/w4_Report_Hu.R`: additional report script
- `reports/project_milestone1_Hu.pdf`: milestone report
- `reports/project_milestone2_Hu.pdf`: second milestone report
- `reports/ALY6010_M4_2025WinterB_Comparison Tests.pdf`: comparison testing report
- `reports/EDA slides_final_Hu.pptx`: presentation slides

## Why This Project Is Useful To Review

This folder is a strong example of my R workflow: I clean and recode fields first, create interpretable derived variables, then use statistical tests and regression to answer applied health questions.
