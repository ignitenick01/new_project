
install.packages("MASS")
library(MASS)
#Part1
data(cats)
#1
male <- subset(cats, Sex == "M")$Bwt
female <- subset(cats, Sex == "F")$Bwt

t_test_bwt <- t.test(male, female, var.equal = FALSE)
t_test_bwt

#2
male_hwt <- subset(cats, Sex == "M")$Hwt
female_hwt <- subset(cats, Sex == "F")$Hwt
t_test_hwt <- t.test(male_hwt, female_hwt, var.equal = FALSE)
t_test_hwt

#part2
avg_before <- c(4.6, 7.8, 9.1, 5.6, 6.9, 8.5, 5.3, 7.1, 3.2, 4.4)
avg_after <- c(6.6, 7.7, 9.0, 6.2, 7.8, 8.3, 5.9, 6.5, 5.8, 4.9)
t_test_sleep <- t.test(avg_before, avg_after, paired = TRUE)
t_test_sleep
variance_test <- var.test(avg_before, avg_after)
variance_test