# ALY6110 Retail EDA And Dashboard Project

This project explores retail order behavior and builds dashboard-ready summaries from a multi-table grocery and product dataset.

## What The Project Is About

- Domain: retail and customer order analytics
- Goal: combine product metadata and order history into a single analytical view for EDA, dimensionality reduction, and dashboard reporting
- Main deliverables: final notebook, written report, and dashboard screenshots

## Data Cleaning And Preparation

The main notebook works across several related tables, so the cleaning process focuses on data integration as much as field cleanup:

- merged product, aisle, and department reference tables into a richer product table
- joined product-level data with order-level data to create one analysis-ready dataset
- summarized missingness after merges to identify which fields needed treatment
- filled `days_since_prior_order` with `-1` as a sentinel for missing timing information
- replaced missing `aisle` and `department` labels with `Unknown`
- prepared grouped user and order summaries for downstream analysis and dashboard views
- used cleaned inputs for PCA-oriented exploration, which required explicit missing-value handling before matrix-based methods

These steps help the reader understand the data at a glance: the project starts from separate retail tables, then produces a unified dataset where product categories, ordering cadence, and customer behavior can be analyzed together.

## Analysis And Reporting

- retail exploratory analysis
- grouped order-behavior summaries
- dashboard communication of key patterns
- notebook-based final project workflow

## Project Contents

- `code/6110_finalproject.ipynb`
- `reports/Final Project EDA_Group2_10192025.pdf`
- `reports/Dashboard_Group2_10142025.pdf`
- `reports/dashboard_screenshot.PNG`
- `reports/dashboard_screenshot2.PNG`

## Note On Data Files

The original raw dataset used in the course folder is large, so this repository keeps the notebook and reporting artifacts rather than the full raw source files.
