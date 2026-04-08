df <- read.csv("C:/Users/JunhuiHuTEST/Desktop/ALY6010/week1/Ask A Manager Salary Survey 2021 (Responses).csv")
View(df)
summary(df)

library(ggplot2)
library(dplyr)
library(readr)
library(gmodels)
#reformat work experience overall
df <- df %>%
  mutate(new_work_experience = How.many.years.of.professional.work.experience.do.you.have.overall.) %>%
  mutate(new_work_experience = gsub(" - ", "-", new_work_experience)) %>%
  mutate(new_work_experience = gsub("1 year or less", "0-1 years", new_work_experience)) %>%
  mutate(new_work_experience = gsub("41 years or more", "41+ years", new_work_experience))
# find top 10 industry
industry_counts <- table(df$What.industry.do.you.work.in.)
top_industries <- names(sort(industry_counts, decreasing = TRUE)[1:10])
top_industries
#keep only top 10 industry names
df <- df %>%
  mutate(Industry_Cleaned = ifelse(What.industry.do.you.work.in. %in% top_industries,
                                   What.industry.do.you.work.in., "Other"))

#arrange by work experience
experience_levels <- c("0-1 years", "2-4 years", "5-7 years", "8-10 years",
                       "11-20 years", "21-30 years", "31-40 years", "41+ years")
df$new_work_experience <- factor(df$new_work_experience, levels = experience_levels)


#frequency tables
work_exp_table <- table(df$new_work_experience)
industry_table <- table(df$Industry_Cleaned)
work_exp_table
industry_table

# work experience distribution
ggplot(as.data.frame(work_exp_table), aes(x = Var1, y = Freq)) +
  geom_bar(stat = "identity", fill = "blue") +
  theme_minimal() +
  labs(title = "work experience distribution", x = "work experience", y = "employees") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))
## top 10 and 'others' industry distribution
ggplot(as.data.frame(industry_table), aes(x = Var1, y = Freq)) +
  geom_bar(stat = "identity", fill = "blue") +
  theme_minimal() +
  labs(title = "Industry distribution", x = "industry", y = "employees") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# cross table
gmodels::CrossTable(df$new_work_experience, df$Industry_Cleaned, prop.chisq = FALSE)

## work experience in different industry distribution
cross_tab <- table(df$new_work_experience, df$Industry_Cleaned)
cross_tab_df <- as.data.frame.matrix(prop.table(cross_tab, margin = 1))
cross_tab_df$Work_Experience <- rownames(cross_tab_df)

cross_tab_melt <- reshape2::melt(cross_tab_df, id.vars = "Work_Experience")
colnames(cross_tab_melt) <- c("Work_Experience", "Industry", "Proportion")

ggplot(cross_tab_melt, aes(x = Work_Experience, y = Proportion, fill = Industry)) +
  geom_bar(stat = "identity") +
  theme_minimal() +
  labs(title = "work experience in different industry",
       x = "work experience", y = "percentage") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1)) +
  scale_fill_brewer(palette = "Set3")



