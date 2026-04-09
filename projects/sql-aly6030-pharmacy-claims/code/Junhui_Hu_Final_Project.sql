USE 6030_final;

# fix datatype
ALTER TABLE fact_fill_prescription
MODIFY COLUMN fill_date DATE NOT NULL;

ALTER TABLE dim_patient
MODIFY COLUMN member_birth_date DATE NOT NULL;

ALTER TABLE dim_drug
MODIFY COLUMN drug_form_code VARCHAR(10) NOT NULL;

ALTER TABLE dim_drug_form
MODIFY COLUMN drug_form_code VARCHAR(10) NOT NULL;


# add PK
ALTER TABLE dim_patient
ADD PRIMARY KEY (member_id);

ALTER TABLE dim_drug
ADD PRIMARY KEY (drug_ndc);

ALTER TABLE dim_drug_form
ADD PRIMARY KEY (drug_form_code);

ALTER TABLE dim_brand_generic
ADD PRIMARY KEY (drug_brand_generic_code);

ALTER TABLE fact_fill_prescription
ADD PRIMARY KEY (fill_id),
MODIFY COLUMN fill_id INT NOT NULL AUTO_INCREMENT;


# add FK
ALTER TABLE fact_fill_prescription
ADD CONSTRAINT fact_member_fk
FOREIGN KEY (member_id)
REFERENCES dim_patient(member_id)
ON UPDATE RESTRICT
ON DELETE RESTRICT; 

ALTER TABLE fact_fill_prescription
ADD CONSTRAINT fact_drug_fk
FOREIGN KEY (drug_ndc)
REFERENCES dim_drug(drug_ndc)
ON UPDATE RESTRICT
ON DELETE RESTRICT;

ALTER TABLE dim_drug
ADD CONSTRAINT drug_form_fk
FOREIGN KEY (drug_form_code)
REFERENCES dim_drug_form(drug_form_code)
ON UPDATE RESTRICT
ON DELETE RESTRICT;

ALTER TABLE dim_drug
ADD CONSTRAINT drug_brand_fk
FOREIGN KEY (drug_brand_generic_code)
REFERENCES dim_brand_generic(drug_brand_generic_code)
ON UPDATE RESTRICT
ON DELETE RESTRICT;


# PART4 
#TASK1
SELECT 
    b.drug_name,
    COUNT(*) AS total_prescriptions
FROM fact_fill_prescription a
LEFT JOIN dim_drug b
    ON a.drug_ndc = b.drug_ndc
GROUP BY b.drug_name
ORDER BY total_prescriptions DESC;


#TASK2
SELECT 
    CASE 
        WHEN TIMESTAMPDIFF(YEAR, b.member_birth_date, CURDATE()) >= 65 
            THEN '65+'
        ELSE '<65'
    END AS age_group,
    COUNT(*) AS total_prescriptions,
    COUNT(DISTINCT a.member_id) AS unique_members,
    SUM(a.copay) AS total_copay,
    SUM(a.insurancepaid) AS total_insurance_paid
FROM fact_fill_prescription a
LEFT JOIN dim_patient b
    ON a.member_id = b.member_id
GROUP BY age_group;


#TASK3
SELECT *
FROM (
    SELECT 
        b.member_id,
        b.member_first_name,
        b.member_last_name,
        c.drug_name,
        a.fill_date,
        a.insurancepaid,
        ROW_NUMBER() OVER (PARTITION BY b.member_id ORDER BY a.fill_date DESC) AS rwnum
    FROM fact_fill_prescription a
    LEFT JOIN dim_patient b
        ON a.member_id = b.member_id
    LEFT JOIN dim_drug c
        ON a.drug_ndc = c.drug_ndc
) aa
WHERE rwnum = 1;
