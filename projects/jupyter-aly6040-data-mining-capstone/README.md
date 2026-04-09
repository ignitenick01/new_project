# ALY6040 Data Mining Capstone: Predicting Hospital Readmission Risk

This capstone predicts diabetic patient readmission using hospital encounter data and a multi-stage notebook workflow for cleaning, feature engineering, and classification.

## What The Project Is About

- Domain: healthcare analytics and readmission modeling
- Goal: identify patterns associated with 30-day readmission risk from patient encounter records
- Main deliverables: weekly notebook builds, final report, and capstone presentation

## Data Cleaning And Preparation

This is one of the strongest data-cleaning examples in the portfolio because the raw hospital data required several structured cleanup steps:

- removed duplicate records using `encounter_id` so the same encounter would not be counted twice
- replaced `?` placeholder strings with proper missing values
- calculated missing-value rates by column to guide feature retention decisions
- dropped heavily missing columns such as `weight`, `payer_code`, and `medical_specialty`
- removed low-information medication fields with almost no variation
- dropped identifier fields such as `encounter_id` and `patient_nbr` before modeling
- cleaned age-band text by stripping brackets and parentheses for easier interpretation
- recoded the `readmitted` outcome into a binary target for classification
- reviewed utilization variables such as hospital stay length, lab procedures, and inpatient or emergency counts for outliers
- engineered additional features such as visit-history indicators and emergency-use flags
- removed duplicate columns in the final feature table before model training

These steps turn a hospital EHR-style dataset into a much more interpretable modeling table. Instead of raw placeholders and sparse administrative fields, the final dataset focuses on usable clinical and utilization signals.

## Analysis And Modeling

- exploratory analysis across the weekly notebooks
- feature engineering for healthcare utilization patterns
- classification workflow for binary readmission prediction
- final reporting and presentation of findings

## Project Contents

- `code/ALY6040_group3_W1_EDA-2.ipynb`
- `code/ALY6040_group3_W2_part1.ipynb`
- `code/ALY6040_group3_W2_part2.ipynb`
- `code/ALY6040_group3_W3.ipynb`
- `reports/ALY6040_Final_report_group3.pdf`
- `reports/ALY6040 capstone group3.pptx`

## Why This Project Is Useful To Review

If you want to see how I approach messy healthcare data, start here. The project shows how I move from missing-value auditing and duplicate cleanup to feature engineering and predictive modeling.
