library(dplyr)
df <- read.csv("C:/Users/JunhuiHuTEST/Desktop/ALY6010/week3/Wholesale customers data.csv")

# One-sample t-test
# Null Hypothesis: The mean of milk spending is equal to 7000
# Alternative Hypothesis: The mean of milk spending is not equal to 7000
t_test_milk <- t.test(df$Milk, mu = 7000)
print(t_test_milk)


# Hypothesis testing for p-value
# Null Hypothesis: The mean of Grocery spending is equal to 8000
# Alternative Hypothesis: The mean of Grocery spending is greater than 8000
t_test_grocery <- t.test(df$Grocery, mu = 8000, alternative = "greater")
print(t_test_grocery)

