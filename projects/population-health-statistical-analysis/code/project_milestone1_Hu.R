library(ggplot2)
library(dplyr)
library(tidyr)
library(readr)
library(ggpubr)

df <- read.csv("C:/Users/JunhuiHuTEST/Desktop/ALY6010/finalproject/heart_attack_dataset.csv")
str(df)
summary(df)

# Convert categorical variables to factors
df <- df %>% 
  mutate(
    Outcome = as.factor(Outcome),
    Gender = as.factor(Gender),
    Smoker = as.factor(Smoker),
    Diabetes = as.factor(Diabetes),
    Hypertension = as.factor(Hypertension),
    FamilyHistory = as.factor(FamilyHistory)
  )

# Visualize numerical variables
num_cols <- c("Age", "Cholesterol", "BloodPressure", "HeartRate", "BMI", "MaxHeartRate", "ST_Depression")

df %>% 
  pivot_longer(cols = all_of(num_cols), names_to = "Variable", values_to = "Value") %>% 
  ggplot(aes(x = Value)) +
  geom_histogram(bins = 50, fill = "blue", color = "black", alpha = 0.7) +
  facet_wrap(~ Variable, scales = "free") +
  theme_minimal() +
  ggtitle("Histograms of Key Numerical Variables")

# Boxplots for numerical variables by Outcome
df %>% 
  pivot_longer(cols = all_of(num_cols), names_to = "Variable", values_to = "Value") %>% 
  ggplot(aes(x = Outcome, y = Value, fill = Outcome)) +
  geom_boxplot(alpha = 0.7) +
  facet_wrap(~ Variable, scales = "free") +
  theme_minimal() +
  ggtitle("Boxplots of Key Numerical Variables by Outcome")

# T-tests for key numerical variables
t_test_results <- df %>% 
  group_by(Outcome) %>% 
  summarise(across(all_of(num_cols), list(mean = mean, sd = sd), .names = "{col}_{fn}"))

print(t_test_results)

# Confidence Intervals 
confidence_intervals <- df %>% 
  group_by(Outcome) %>% 
  summarise(across(all_of(num_cols), 
                   list(CI_Lower = ~ qt(0.025, df = n() - 1) * sd(.) / sqrt(n()) + mean(.),
                        CI_Upper = ~ qt(0.975, df = n() - 1) * sd(.) / sqrt(n()) + mean(.)),
                   .names = "{col}_{fn}"))

print(confidence_intervals)

# Cross-tabulation of Smoking and Cholesterol Level
cross_tab <- df %>% 
  mutate(Cholesterol_Level = case_when(
    Cholesterol < 200 ~ "Normal",
    Cholesterol >= 200 & Cholesterol < 240 ~ "Borderline High",
    Cholesterol >= 240 ~ "High"
  )) %>% 
  count(Smoker, Cholesterol_Level) %>% 
  pivot_wider(names_from = Cholesterol_Level, values_from = n, values_fill = 0)

print(cross_tab)

# Perform a t-test for cholesterol levels between heart attack and no heart attack groups
t_test_cholesterol <- t.test(df$Cholesterol[df$Outcome == "Heart Attack"],
                             df$Cholesterol[df$Outcome == "No Heart Attack"],
                             alternative = "two.sided",
                             var.equal = FALSE)

print(t_test_cholesterol)
