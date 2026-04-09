# ALY6015 Capstone Analysis

This R-based capstone analyzes chronic disease indicators and subgroup patterns using public-health data prepared for comparative statistical testing.

## What The Project Is About

- Domain: chronic disease and public-health analytics
- Goal: clean CDC-style indicator data, define comparable subgroups, and evaluate differences across gender, race, and region
- Main deliverables: R scripts, proposal, final report draft, and presentation deck

## Data Cleaning And Preparation

The scripts show a focused workflow for preparing a large public-health dataset for testing:

- filtered the source data to specific chronic disease questions relevant to the project
- kept only records where `DataValueType` was `Age-adjusted Rate` so comparisons would be on a consistent basis
- selected relevant stratification categories such as male and female subgroup views
- removed rows with missing `DataValue`
- dropped columns that were fully null and added no analytical value
- created median-based high-risk and low-risk outcome groups for comparative testing
- derived `Region` labels such as East and West from state abbreviations
- prepared cleaned subgroup tables for chi-square style comparisons and related statistical analysis

These steps are what make the final results interpretable. Without filtering to comparable rate definitions and removing incomplete records, subgroup differences would be much harder to trust.

## Analysis And Methods

- subgroup comparison in R
- chi-square oriented analysis
- ANOVA-style evaluation and follow-up interpretation
- proposal-to-report capstone workflow

## Project Contents

- `code/Initial_analysis_code_group_3.R`
- `code/evaluation after presentation.R`
- `reports/6015_Group3_Proposal.pdf`
- `reports/6015_Group3_FinalReport_Draft.pdf`
- `reports/ALY6015_GroupAssignment_PPTSlides.pptx`

## Why This Project Is Useful To Review

This project highlights a common analytics pattern in health data: narrow the dataset to valid comparable records, define clean subgroup labels, and then run interpretable statistical tests.
