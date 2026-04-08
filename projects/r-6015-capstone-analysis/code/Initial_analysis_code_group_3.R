data <- read.csv("C:/Users/JunhuiHuTEST/Desktop/6015/capstone/U.S._Chronic_Disease_Indicators.csv")

#install.packages("readxl")
#install.packages("dplyr")
#install.packages("ggplot2")
#install.packages("car")     
#install.packages("emmeans")

library(readxl)
library(dplyr)
library(ggplot2)
library(car)
library(emmeans)

############################################################################################
# Q1 
#  Is there a statistically significant difference in the incidence 
#  and mortality rates of invasive cancer across different genders, U.S. states, and years? 
############################################################################################

###########  invasive cancer incidence###################
incidence_df <- subset(
  data,
  Question == "Invasive cancer (all sites combined), incidence" &
    DataValueType == "Age-adjusted Rate" &
    Stratification1 %in% c("Male", "Female") &
    !is.na(DataValue)
)

# remove null value
incidence_df <- incidence_df[!is.na(incidence_df$DataValue), ]
# remove null cloumn
incidence_df <- incidence_df[, colSums(is.na(incidence_df)) < nrow(incidence_df)]


## EDA 
table(incidence_df$Question)
table(incidence_df$Stratification1)
summary(incidence_df$DataValue)
# geneder boxplot
boxplot(DataValue ~ Stratification1 + Question, data = incidence_df,
        main = "Invasive Cancer Incidence & Mortality by Gender",
        xlab = "Gender & Type", ylab = "Age-adjusted Rate")

##
# separate High/Low Risk by Median
median_rate <- median(incidence_df$DataValue, na.rm = TRUE)
incidence_df$RiskLevel <- ifelse(incidence_df$DataValue >= median_rate, "High", "Low")

## separate in two region east and west
west_states <- c("CA", "OR", "WA", "NV", "ID", "MT", "WY", "CO", "UT", "AZ", "NM", "AK", "HI")
incidence_df$Region <- ifelse(incidence_df$LocationAbbr %in% west_states, "West", "East")
table(incidence_df$Region)

# Gender vs Risk Level
table_gender_risk <- table(incidence_df$Stratification1, incidence_df$RiskLevel)
print("Contingency table: Gender vs Risk Level")
print(table_gender_risk)

cat("\nChi-square test: Gender vs Risk Level\n")
print(chisq.test(table_gender_risk))

# State vs Risk Level
#table_state_risk <- table(incidence_df$LocationAbbr, incidence_df$RiskLevel)
#print("Contingency table: State vs Risk Level")
#print(table_state_risk)

#cat("\nChi-square test: State vs Risk Level\n")
#print(chisq.test(table_state_risk))

# Region vs RiskLevel
table_region_risk <- table(incidence_df$Region, incidence_df$RiskLevel)
print("Contingency table: Region vs Risk Level")
print(table_region_risk)

cat("\nChi-square test: Region vs Risk Level\n")
print(chisq.test(table_region_risk))

# Year vs Risk Level
table_year_risk <- table(incidence_df$YearStart, incidence_df$RiskLevel)
print("Contingency table: Year vs Risk Level")
print(table_year_risk)

cat("\nChi-square test: Year vs Risk Level\n")
print(chisq.test(table_year_risk))

###########  invasive cancer mortality###################

# 
mortality_df <- subset(
  data,
  Question == "Invasive cancer (all sites combined) mortality among all people, underlying cause" &
    DataValueType == "Age-adjusted Rate" &
    Stratification1 %in% c("Male", "Female") &
    !is.na(DataValue)
)

# remove null value
mortality_df <- mortality_df[, colSums(is.na(mortality_df)) < nrow(mortality_df)]

# High/Low Risk by Median
median_mortality <- median(mortality_df$DataValue, na.rm = TRUE)
mortality_df$RiskLevel <- ifelse(mortality_df$DataValue >= median_mortality, "High", "Low")

# east and west
west_states <- c("CA", "OR", "WA", "NV", "ID", "MT", "WY", "CO", "UT", "AZ", "NM", "AK", "HI")
mortality_df$Region <- ifelse(mortality_df$LocationAbbr %in% west_states, "West", "East")

# Gender vs Risk Level
table_gender_risk_m <- table(mortality_df$Stratification1, mortality_df$RiskLevel)
print("Contingency table: Gender vs Risk Level")
print(table_gender_risk_m)

cat("\nChi-square test: Gender vs Risk Level\n")
print(chisq.test(table_gender_risk_m))

# Region vs Risk Level
table_region_risk_m <- table(mortality_df$Region, mortality_df$RiskLevel)
print("Contingency table: Region vs Risk Level")
print(table_region_risk_m)

cat("\nChi-square test: Region vs Risk Level\n")
print(chisq.test(table_region_risk_m))

# bar chart
boxplot(DataValue ~ Stratification1, data=mortality_df,
        main="Invasive Cancer Mortality by Gender",
        xlab="Gender", ylab="Age-adjusted Mortality Rate")

barplot(table_gender_risk_m, beside=TRUE, legend=TRUE,
        main="High vs Low Mortality Risk by Gender", xlab="Gender", ylab="Count")

barplot(table_region_risk_m, beside=TRUE, legend=TRUE,
        main="High vs Low Mortality Risk by Region", xlab="Region", ylab="Count")




######################################################################################
# Q2 
# Is there a significant association between race and the risk level (high vs. low) of 
# age-adjusted mortality for colorectal cancer among U.S. adults?  
######################################################################################

colorectal_df <- subset(
  data,
  Question == "Colon and rectum (colorectal) cancer mortality among all people, underlying cause" &
    DataValueType == "Age-adjusted Rate" &
    StratificationCategory1 == "Race/Ethnicity" &
    !is.na(DataValue)
)
# how many rows and distributation
cat("rows: ", nrow(colorectal_df), "\n")
table(colorectal_df$Stratification1)

#  separate High/Low Risk by Median
median_colorectal <- median(colorectal_df$DataValue, na.rm = TRUE)
colorectal_df$RiskLevel <- ifelse(colorectal_df$DataValue >= median_colorectal, "High", "Low")

# Race/Ethnicity vs Risk Level
table_race_risk_colorectal <- table(colorectal_df$Stratification1, colorectal_df$RiskLevel)
cat("Contingency table: Race/Ethnicity vs Risk Level\n")
print(table_race_risk_colorectal)

cat("\nChi-square test: Race/Ethnicity vs Risk Level\n")
print(chisq.test(table_race_risk_colorectal))

df_plot <- as.data.frame(table(colorectal_df$Stratification1, colorectal_df$RiskLevel))
colnames(df_plot) <- c("RaceEthnicity", "RiskLevel", "Count")

# ggplot bar chart High vs Low Risk of Colorectal Cancer Mortality by Race/Ethnicity
ggplot(df_plot, aes(x = RiskLevel, y = Count, fill = RaceEthnicity)) +
  geom_bar(stat = "identity", position = position_dodge()) +
  labs(
    title = "High vs Low Risk of Colorectal Cancer Mortality by Race/Ethnicity",
    x = "Risk Level", y = "Count", fill = "Race/Ethnicity"
  ) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title = element_text(hjust = 0.5, face = "bold"),
    axis.text.x = element_text(angle = 0, vjust = 0.5),
    legend.position = "right"
  )

prop.table(table_race_risk_colorectal, margin = 1)

########################################################
# Q3 Impact of State and Ethnicity on Cancer Incidence
########################################################

df<- data

df$LationDesc <- as.factor(df$LocationDesc)
df$Ethnicity <- as.factor(df$Stratification1)
df$Question <- as.factor(df$Question)

df_filtered <- df %>%
  filter(Question == "Invasive cancer (all sites combined), incidence", DataValueUnit == "per 100,000")
df_clean <- df_filtered %>%
  filter(DataValue != 0)

model <- aov(DataValue ~ LocationDesc + Ethnicity + LocationDesc:Ethnicity, data = df_clean)
summary(model)
shapiro.test(resid(model))
plot(model)

leveneTest(DataValue ~ Ethnicity, data = df_cleaned)
emmeans(model, pairwise ~ Ethnicity)

ggplot(df_filtered, aes(x = Ethnicity, y = DataValue)) +
  geom_boxplot() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1)) +
  labs(title = "Invasive Cancer Incidence by Group", x = "Group", y = "Incidence Rate")







#####################Q1 visualization###############

# Gender vs Risk Level

table_gender_risk <- table(incidence_df$Stratification1, incidence_df$RiskLevel)
res1 <- chisq.test(table_gender_risk)

chi_val <- as.numeric(res1$statistic)
df_val <- as.numeric(res1$parameter)
alpha <- 0.05
critical_val <- qchisq(1 - alpha, df_val)
x_vals <- seq(0, chi_val + 10, length.out = 500)
y_vals <- dchisq(x_vals, df = df_val)


plot(x_vals, y_vals, type = "l", lwd = 2, col = "black",
     xlab = expression(chi^2 ~ "Value"), ylab = "Density",
     main = "Chi-Square Test: Gender vs Risk Level (Incidence)")


x_fill <- x_vals[x_vals >= critical_val]
y_fill <- y_vals[x_vals >= critical_val]
polygon(c(critical_val, x_fill), c(0, y_fill), col = rgb(1, 0.5, 0, 0.3), border = NA)


abline(v = critical_val, col = "orange", lwd = 2, lty = 2)
text(critical_val, max(y_vals) * 0.8,
     labels = paste0("Critical = ", round(critical_val, 2)),
     pos = 4, col = "orange")

abline(v = chi_val, col = "red", lwd = 2)
text(chi_val, max(y_vals) * 0.6,
     labels = paste0("Chi² = ", round(chi_val, 2)),
     pos = 4, col = "red")


# Region vs Risk Level
table_region_risk <- table(incidence_df$Region, incidence_df$RiskLevel)

res2 <- chisq.test(table_region_risk)
chi_val <- as.numeric(res2$statistic)
df_val <- as.numeric(res2$parameter)
critical_val <- qchisq(0.95, df_val)


x_vals <- seq(0, chi_val + 10, length.out = 500)
y_vals <- dchisq(x_vals, df_val)
plot(x_vals, y_vals, type = "l", lwd = 2, col = "black",
     xlab = expression(chi^2 ~ "Value"), ylab = "Density",
     main = "Chi-Square Test: Region vs Risk Level (Incidence)")
polygon(c(critical_val, x_vals[x_vals >= critical_val]), c(0, y_vals[x_vals >= critical_val]),
        col = rgb(1, 0.5, 0, 0.3), border = NA)
abline(v = critical_val, col = "orange", lwd = 2, lty = 2)
text(critical_val, max(y_vals) * 0.8, paste0("Critical = ", round(critical_val, 2)), pos = 4, col = "orange")
abline(v = chi_val, col = "red", lwd = 2)
text(chi_val, max(y_vals) * 0.6, paste0("Chi² = ", round(chi_val, 2)), pos = 4, col = "red")


# Year vs Risk Level
table_year_risk <- table(incidence_df$YearStart, incidence_df$RiskLevel)
res3 <- chisq.test(table_year_risk)
chi_val <- as.numeric(res3$statistic)
df_val <- as.numeric(res3$parameter)
critical_val <- qchisq(0.95, df_val)

x_vals <- seq(0, chi_val + 10, length.out = 500)
y_vals <- dchisq(x_vals, df_val)
plot(x_vals, y_vals, type = "l", lwd = 2, col = "black",
     main = "Chi-Square Test: Year vs Risk Level (Incidence)",
     xlab = expression(chi^2 ~ "Value"), ylab = "Density")
polygon(c(critical_val, x_vals[x_vals >= critical_val]), c(0, y_vals[x_vals >= critical_val]),
        col = rgb(1, 0.5, 0, 0.3), border = NA)
abline(v = critical_val, col = "orange", lwd = 2, lty = 2)
text(critical_val, max(y_vals) * 0.8, paste0("Critical = ", round(critical_val, 2)), pos = 4, col = "orange")
abline(v = chi_val, col = "red", lwd = 2)
text(chi_val, max(y_vals) * 0.6, paste0("Chi² = ", round(chi_val, 2)), pos = 4, col = "red")


#Gender vs Risk Level (Mortality)
table_gender_risk_m <- table(mortality_df$Stratification1, mortality_df$RiskLevel)
res4 <- chisq.test(table_gender_risk_m)
chi_val <- as.numeric(res4$statistic)
df_val <- as.numeric(res4$parameter)
critical_val <- qchisq(0.95, df_val)

x_vals <- seq(0, chi_val + 10, length.out = 500)
y_vals <- dchisq(x_vals, df_val)
plot(x_vals, y_vals, type = "l", lwd = 2, col = "black",
     main = "Chi-Square Test: Gender vs Risk Level (Mortality)",
     xlab = expression(chi^2 ~ "Value"), ylab = "Density")
polygon(c(critical_val, x_vals[x_vals >= critical_val]), c(0, y_vals[x_vals >= critical_val]),
        col = rgb(1, 0.5, 0, 0.3), border = NA)
abline(v = critical_val, col = "orange", lwd = 2, lty = 2)
text(critical_val, max(y_vals) * 0.8, paste0("Critical = ", round(critical_val, 2)), pos = 4, col = "orange")
abline(v = chi_val, col = "red", lwd = 2)
text(chi_val, max(y_vals) * 0.6, paste0("Chi² = ", round(chi_val, 2)), pos = 4, col = "red")


# Region vs Risk Level (Mortality)
table_region_risk_m <- table(mortality_df$Region, mortality_df$RiskLevel)
res5 <- chisq.test(table_region_risk_m)
chi_val <- as.numeric(res5$statistic)
df_val <- as.numeric(res5$parameter)
critical_val <- qchisq(0.95, df_val)

x_vals <- seq(0, chi_val + 10, length.out = 500)
y_vals <- dchisq(x_vals, df_val)
plot(x_vals, y_vals, type = "l", lwd = 2, col = "black",
     main = "Chi-Square Test: Region vs Risk Level (Mortality)",
     xlab = expression(chi^2 ~ "Value"), ylab = "Density")
polygon(c(critical_val, x_vals[x_vals >= critical_val]), c(0, y_vals[x_vals >= critical_val]),
        col = rgb(1, 0.5, 0, 0.3), border = NA)
abline(v = critical_val, col = "orange", lwd = 2, lty = 2)
text(critical_val, max(y_vals) * 0.8, paste0("Critical = ", round(critical_val, 2)), pos = 4, col = "orange")
abline(v = chi_val, col = "red", lwd = 2)
text(chi_val, max(y_vals) * 0.6, paste0("Chi² = ", round(chi_val, 2)), pos = 4, col = "red")


#Race vs Risk Level (Colorectal Mortality)
table_race_risk_colorectal <- table(colorectal_df$Stratification1, colorectal_df$RiskLevel)
res6 <- chisq.test(table_race_risk_colorectal)
chi_val <- as.numeric(res6$statistic)
df_val <- as.numeric(res6$parameter)
critical_val <- qchisq(0.95, df_val)

x_vals <- seq(0, chi_val + 10, length.out = 500)
y_vals <- dchisq(x_vals, df_val)
plot(x_vals, y_vals, type = "l", lwd = 2, col = "black",
     main = "Chi-Square Test: Race vs Risk Level (Colorectal Mortality)",
     xlab = expression(chi^2 ~ "Value"), ylab = "Density")
polygon(c(critical_val, x_vals[x_vals >= critical_val]), c(0, y_vals[x_vals >= critical_val]),
        col = rgb(1, 0.5, 0, 0.3), border = NA)
abline(v = critical_val, col = "orange", lwd = 2, lty = 2)
text(critical_val, max(y_vals) * 0.8, paste0("Critical = ", round(critical_val, 2)), pos = 4, col = "orange")
abline(v = chi_val, col = "red", lwd = 2)
text(chi_val, max(y_vals) * 0.6, paste0("Chi² = ", round(chi_val, 2)), pos = 4, col = "red")
