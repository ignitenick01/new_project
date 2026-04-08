library(ggplot2)
library(dplyr)
library(tidyr)
library(readr)
library(ggpubr)
df <- read.csv("C:/Users/JunhuiHuTEST/Desktop/ALY6010/finalproject/heart_attack_dataset.csv")

# Convert categorical variable to factors
df <- df %>% 
  mutate(
    Outcome = as.factor(Outcome),
    Gender = as.factor(Gender),
    Smoker = as.factor(Smoker),
    Diabetes = as.factor(Diabetes),
    Hypertension = as.factor(Hypertension),
    FamilyHistory = as.factor(FamilyHistory)
  )



# hypothesis test 1 Smoking vs Cholesterol Levels
smoker_cholesterol_test <- t.test(
  df$Cholesterol[df$Smoker == 1],
  df$Cholesterol[df$Smoker == 0],
  alternative = "two.sided",
  var.equal = FALSE
)
print(smoker_cholesterol_test)

t1_value <- smoker_cholesterol_test$statistic


# T1 95% Confidence Interval
x <- seq(-3, 3, length=100)
y <- dnorm(x, mean=0, sd=1)
df_norm <- data.frame(x, y)
ci_lower <- -1.96
ci_upper <- 1.96

t1_figure<- ggplot(df_norm, aes(x, y)) +
  geom_line(size=1) +
  geom_area(data=subset(df_norm, x < ci_lower), aes(y=y), fill="orange", alpha=0.5) +
  geom_area(data=subset(df_norm, x > ci_upper), aes(y=y), fill="orange", alpha=0.5) +
  geom_vline(xintercept = c(0,t1_value), color="blue", linetype="solid", size=1) +
  annotate("text", x = t1_value, y = 0, label = round(t1_value, 2), vjust = 1.5, color = "blue", size = 4) +
  labs(title="95% Confidence Interval on Normal Distribution with Test Values") +
  theme_minimal()
print(t1_figure)


# hypothesis test 2 Blood Pressure vs Heart Attack 
bp_test <- t.test(
  df$BloodPressure[df$Outcome == "Heart Attack"],
  df$BloodPressure[df$Outcome == "No Heart Attack"],
  alternative = "two.sided",
  var.equal = FALSE
)
print(bp_test)

t2_value <- bp_test$statistic

# T2 95% Confidence Interval
x <- seq(-3, 3, length=100)
y <- dnorm(x, mean=0, sd=1)
df_norm <- data.frame(x, y)
ci_lower <- -1.96
ci_upper <- 1.96

t2_figure<- ggplot(df_norm, aes(x, y)) +
  geom_line(size=1) +
  geom_area(data=subset(df_norm, x < ci_lower), aes(y=y), fill="orange", alpha=0.5) +
  geom_area(data=subset(df_norm, x > ci_upper), aes(y=y), fill="orange", alpha=0.5) +
  geom_vline(xintercept = c(0,t2_value), color="blue", linetype="solid", size=1) +
  annotate("text", x = t2_value, y = 0, label = round(t2_value, 2), vjust = 1.5, color = "blue", size = 4) +
  labs(title="95% Confidence Interval on Normal Distribution with Test Values") +
  theme_minimal()
print(t2_figure)

# Confidence Intervals for Blood Pressure
bp_conf_intervals <- df %>% 
  group_by(Outcome) %>% 
  summarise(
    Mean_BP = mean(BloodPressure, na.rm = TRUE),
    CI_Lower = mean(BloodPressure, na.rm = TRUE) - qt(0.975, df = n() - 1) * sd(BloodPressure, na.rm = TRUE) / sqrt(n()),
    CI_Upper = mean(BloodPressure, na.rm = TRUE) + qt(0.975, df = n() - 1) * sd(BloodPressure, na.rm = TRUE) / sqrt(n())
  )
print(bp_conf_intervals)


# hypothesis test 3 Gender vs Heart Attack Risk (Chi-square test)
gender_heart_attack_table <- table(df$Gender, df$Outcome)
gender_chisq_test <- chisq.test(gender_heart_attack_table)
print(gender_chisq_test)

chi_value <- gender_chisq_test$statistic


# T3 95% Confidence Interval
x <- seq(-3, 3, length=100)
y <- dnorm(x, mean=0, sd=1)
df_norm <- data.frame(x, y)
ci_lower <- -1.96
ci_upper <- 1.96

t3_figure<- ggplot(df_norm, aes(x, y)) +
  geom_line(size=1) +
  geom_area(data=subset(df_norm, x < ci_lower), aes(y=y), fill="orange", alpha=0.5) +
  geom_area(data=subset(df_norm, x > ci_upper), aes(y=y), fill="orange", alpha=0.5) +
  geom_vline(xintercept = c(0,chi_value), color="blue", linetype="solid", size=1) +
  annotate("text", x = chi_value, y = 0, label = round(chi_value, 2), vjust = 1.5, color = "blue", size = 4) +
  labs(title="95% Confidence Interval on Normal Distribution with Test Values") +
  theme_minimal()
print(t3_figure)


