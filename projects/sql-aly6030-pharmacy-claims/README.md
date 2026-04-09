# ALY6030 SQL Final Project: Pharmacy Claims Warehouse

This project builds a small pharmacy claims warehouse in SQL, starting from a flat prescription dataset and reorganizing it into dimension and fact tables for analysis.

## What The Project Is About

- Domain: data warehousing and SQL
- Goal: redesign prescription-fill data into a cleaner analytical schema, enforce keys and data types, and answer business questions with SQL
- Main deliverables: SQL script, source and dimensionalized data files, final write-up, and ERD

## Data Cleaning And Preparation

The data-preparation work in this project is centered on warehouse design rather than notebook modeling:

- started from a flat pharmacy claims dataset and split it into dimension tables and a fact table
- converted date fields such as `fill_date` and `member_birth_date` to proper SQL `DATE` types
- enforced `NOT NULL` constraints on key fields that should always be present
- defined primary keys for patient, drug, drug form, and brand/generic lookup tables
- created a surrogate `fill_id` key for the fact table and set it to auto-increment
- added foreign key relationships from the fact table back to the patient and drug dimensions
- normalized drug form and brand/generic information into separate supporting dimensions

These steps make the raw prescription data easier to query because the model separates descriptive attributes from fill events and clarifies how patients, drugs, and prescription transactions relate to one another.

## SQL Analysis Tasks

The final SQL script includes example analytical queries such as:

- counting prescriptions by drug name
- comparing prescription volume, member counts, copay, and insurance-paid totals by age group
- retrieving each member's most recent prescription fill with window functions

## Project Contents

- `code/Junhui_Hu_Final_Project.sql`: final SQL script
- `data/ALY 6030 Final Project Data Set.csv`: original flat dataset
- `data/ALY 6030 Final Project Data Set.xlsx`: original flat dataset in spreadsheet form
- `data/dim_brand_generic.csv`: brand/generic lookup table
- `data/dim_drug.csv`: drug dimension
- `data/dim_drug_form.csv`: drug form dimension
- `data/dim_patient.csv`: patient dimension
- `data/fact_fill_prescription.csv`: prescription fill fact table
- `reports/Junhui_Hu_Final_Project.docx`: final written submission
- `reports/Junhui_Hu_Final_Project_ERD.pdf`: schema diagram
- `reports/ALY 6030 Final Project Assignment.docx`: assignment prompt

## Design Note

In the final write-up, I note that the schema ended up closer to a snowflake design than a fully denormalized star schema because some descriptive drug attributes were broken into their own supporting dimensions.
