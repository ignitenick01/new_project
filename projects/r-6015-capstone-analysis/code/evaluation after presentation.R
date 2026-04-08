data <- read.csv("C:/Users/JunhuiHuTEST/Desktop/6015/capstone/U.S._Chronic_Disease_Indicators.csv")


# 1. only Cancer topic Age-adjusted Rate
cancer_df <- subset(
  data,
  Topic == "Cancer" &
    DataValueType == "Age-adjusted Rate" &
    !is.na(DataValue)
)

cat("data size: ", nrow(cancer_df), "\n")

# Gender
cancer_gender <- subset(cancer_df, StratificationCategory1 == "Sex" & !is.na(Stratification1))
median_cancer_gender <- median(cancer_gender$DataValue, na.rm = TRUE)
cancer_gender$RiskLevel <- ifelse(cancer_gender$DataValue >= median_cancer_gender, "High", "Low")
table_gender_risk <- table(cancer_gender$Stratification1, cancer_gender$RiskLevel)
cat("\nContingency table: Gender vs Risk Level (All Cancer)\n")
print(table_gender_risk)
cat("\nChi-square test: Gender vs Risk Level (All Cancer)\n")
print(chisq.test(table_gender_risk))

# Race/Ethnicity
cancer_race <- subset(cancer_df, StratificationCategory1 == "Race/Ethnicity" & !is.na(Stratification1))
median_cancer_race <- median(cancer_race$DataValue, na.rm = TRUE)
cancer_race$RiskLevel <- ifelse(cancer_race$DataValue >= median_cancer_race, "High", "Low")
table_race_risk <- table(cancer_race$Stratification1, cancer_race$RiskLevel)
cat("\nContingency table: Race/Ethnicity vs Risk Level (All Cancer)\n")
print(table_race_risk)
cat("\nChi-square test: Race/Ethnicity vs Risk Level (All Cancer)\n")
print(chisq.test(table_race_risk))

# Region
west_states <- c("CA", "OR", "WA", "NV", "ID", "MT", "WY", "CO", "UT", "AZ", "NM", "AK", "HI")
cancer_region <- cancer_df[!is.na(cancer_df$LocationAbbr), ] 
cancer_region$Region <- ifelse(cancer_region$LocationAbbr %in% west_states, "West", "East")

median_cancer_region <- median(cancer_region$DataValue, na.rm = TRUE)
cancer_region$RiskLevel <- ifelse(cancer_region$DataValue >= median_cancer_region, "High", "Low")

table_region_risk <- table(cancer_region$Region, cancer_region$RiskLevel)
cat("\nContingency table: Region vs Risk Level (All Cancer)\n")
print(table_region_risk)
cat("\nChi-square test: Region vs Risk Level (All Cancer)\n")
print(chisq.test(table_region_risk))
