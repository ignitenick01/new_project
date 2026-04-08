library(dplyr)
library(ggplot2)
library(readr)
df <- read_csv("C:/Users/JunhuiHuTEST/Desktop/ALY6010/finalproject/project2/Global Health Statistics.csv")

##replace space in the name
names(df) <- make.names(names(df))

##############################################EDA##############################################

###########disease summary
#top10 diseases
top_diseases <- df %>%
  count(Disease.Name, sort = TRUE) %>%
  top_n(10, n)

#average Prevalence,Mortality,Recovery
disease_summary <- df %>%
  group_by(Disease.Name) %>%
  summarise(
    Prevalence.Rate = mean(Prevalence.Rate....),
    Mortality.Rate = mean(Mortality.Rate....),
    Recovery.Rate = mean(Recovery.Rate....)
  ) %>%
  arrange(desc(Mortality.Rate)) %>%
  slice(1:10)

############ country summary
country_summary <- df %>%
  group_by(Country) %>%
  summarise(
    Recovery.Rate = mean(Recovery.Rate....),
    Mortality.Rate = mean(Mortality.Rate....),
    Doctors.per.1000 = mean(Doctors.per.1000),
    Beds.per.1000 = mean(Hospital.Beds.per.1000),
    DALYs = mean(DALYs)
  )

#recoverrate and doctors
ggplot(country_summary, aes(x = Doctors.per.1000, y = Recovery.Rate)) +
  geom_point(color = "blue", size = 3) +
  geom_smooth(method = "lm", se = FALSE, color = "orange") +
  labs(title = "Doctors per 1000 vs Recovery Rate",
       x = "Doctors per 1000", y = "Recovery Rate (%)") +
  theme_minimal()
#dalys vs beds
ggplot(country_summary, aes(x = Beds.per.1000, y = DALYs)) +
geom_point(color = "blue", size = 3) +
  geom_smooth(method = "lm", se = FALSE, color = "orange") +
  labs(title = "Hospital Beds per 1000 vs DALYs",
       x = "Hospital Beds per 1000", y = "DALYs") +
  theme_minimal()


###########society economy, education vs recovery

# education group  and recovery 
grouped_data <- df %>%
  mutate(Education.Group = cut(Education.Index, breaks = seq(0.4, 0.9, by = 0.05))) %>%
  group_by(Education.Group) %>%
  summarise(Avg.Recovery = mean(Recovery.Rate....))

ggplot(grouped_data, aes(x = Education.Group, y = Avg.Recovery, group = 1)) +
  geom_line(color = "blue", size = 1.2) +
  geom_point(size = 2) +
  labs(title = "Grouped Education Index vs Average Recovery Rate",
       x = "Education Index Group", y = "Average Recovery Rate (%)") +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

############ Mortality Rate by Urbanization Level
df <- df %>%
  mutate(Urbanization.Group = cut(Urbanization.Rate...., breaks = seq(20, 90, by = 10)))

ggplot(df, aes(x = Urbanization.Group, y = Mortality.Rate....)) +
  geom_boxplot(fill = "blue") +
  labs(title = "Mortality Rate by Urbanization Level",
       x = "Urbanization Rate Group", y = "Mortality Rate (%)") +
  theme_minimal()


#########################################Hypothesis Testing############################

#Q1 Does per capita income affect disease cost?
#Q2 Does Urbanization Rate influence Mortality Rate?
#Q3 Does Doctors per 1000 influence recovery rate?

#Q1 
cor.test(df$Per.Capita.Income..USD., df$DALYs)
Q1 <- lm(DALYs ~ Per.Capita.Income..USD., data = df)
summary(Q1)

# multiple regression for Q1
model_m1 <- lm(DALYs ~ Per.Capita.Income..USD. + Education.Index + Healthcare.Access...., data = df)
summary(model_m1)

#Q2
cor.test(df$Urbanization.Rate...., df$Mortality.Rate....)
Q2 <- lm(Mortality.Rate.... ~ Urbanization.Rate...., data = df)
summary(Q2)

#Q3
cor.test(df$Doctors.per.1000, df$Recovery.Rate....)
Q3 <- lm(Recovery.Rate.... ~ Doctors.per.1000, data = df)
summary(Q3)


