# ALY6070 BI Dashboard Projects

This folder collects two dashboard-focused course projects built for ALY6070: a midterm project on Washington, D.C. traffic crashes and a final project on 2023 NYPD arrest patterns in New York City.

## What The Project Is About

- Domain: business intelligence, dashboard design, and visual analytics
- Goal: turn public datasets into interactive dashboards that answer specific decision-oriented questions
- Tools represented here: Tableau, Qlik, PDF dashboard exports, and presentation materials

## Midterm: DC Traffic Crash Dashboard

The midterm project analyzes traffic crash patterns in Washington, D.C. with a focus on crash hotspots, severity, vehicle mix, and monthly trends.

### Data Preparation Highlights

- used geographic coordinates to map crash density across the city
- created calculated fields from the original data structure for filters such as `year_date`, `day_night`, `Impaired`, and `Speeding_Involved`
- organized severity, vehicle-type, and street-level fields into dashboard-ready dimensions
- structured the views so users could move between spatial patterns, time trends, and severity breakdowns

### Deliverables Included

- Tableau packaged workbook for the dashboard build
- Qlik write-up and exported dashboard files
- Qlik screenshot used for visual reference in the portfolio

## Final: NYC Arrest Dashboard

The final project explores 2023 NYPD arrest data to compare borough-level arrest volume, offense patterns, arrest rates adjusted by population, demographic differences, and time trends.

### Data Preparation Highlights

- used 2023 NYPD arrest data as the primary source
- added borough population data so arrest counts could be normalized into rates rather than viewed as raw totals only
- created calculated fields for above/below-average comparisons and per-capita interpretation
- structured the dashboard around specific research questions so each view answered one clear analytical question

### Deliverables Included

- Tableau packaged workbook
- final report and presentation deck
- supporting borough population spreadsheet used for normalization

## File Structure

- `midterm/`: D.C. traffic crash Tableau/Qlik materials
- `final/`: NYC arrest Tableau materials and presentation assets

## Repository Note

Some original raw data files from the course folders were very large, so this repository keeps the showcase-friendly dashboard artifacts, exports, and supporting documents instead of every raw source file.
