# ALY6080 Exploratory Analysis Project

This folder contains exploratory notebooks and proposal materials used to frame an analytical problem, examine data quality, and shape a final project direction.

## What The Project Is About

- Domain: exploratory analytics and project design
- Goal: investigate candidate variables, assess data readiness, and translate early analysis into a scoped project proposal
- Main deliverables: exploratory notebooks and final individual proposal report

## Data Cleaning And Preparation

The notebooks focus on early-stage data understanding rather than final production modeling, but they still include important cleanup decisions:

- profiled variables before analysis to understand completeness and interpretability
- filled missing count-style fields such as journal index approximations with `0` when absence should be treated as no observed count
- reviewed field definitions and notebook outputs to separate useful features from weaker candidates
- used exploratory cleaning to shape the eventual project question and analysis plan

These steps matter because proposal-stage work is often where bad assumptions first get caught. The notebook documents how raw fields were reviewed and simplified before drawing conclusions.

## Analysis Focus

- exploratory notebook analysis
- early feature review and project framing
- proposal development based on observed data quality and signal

## Project Contents

- `code/EDA.ipynb`
- `code/new_EDA.ipynb`
- `code/new_individual_proposal.ipynb`
- `reports/Final_Individual Project Proposal_JunhuiHu.pdf`

## Why This Project Is Useful To Review

This folder shows the front end of an analytics workflow: before modeling starts, I first clarify what the data means, what needs cleaning, and whether the planned question is actually supportable.
