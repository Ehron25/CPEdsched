# **profiles Table**

## Purpose
Stores student or faculty profiles who use the reservation and equipment borrowing system.

---

## Table Structure

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User institutional email |
| full_name | VARCHAR(255) | NOT NULL | User's full name |
| student_number | VARCHAR(50) | UNIQUE, NULL | Student number (if student) |
| program | VARCHAR(255) | NULL | Academic program (CPE, ECE, etc.) |
| year_section | VARCHAR(50) | NULL | Year and section |
| contact_number | VARCHAR(50) | NULL | Phone number |
| role | ENUM('Student','Faculty','Staff') | NOT NULL | User classification |
| is_verified | TINYINT | DEFAULT 0 | Whether COR/student identity is verified |
| cor_url | TEXT | NULL | Link to uploaded COR |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When profile was created |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

---

## Key Features
- Handles identity verification
- Distinguishes user roles
- Used as foreign key in reservations and key issuance
- Stores COR for manual verification

---

## Relationships
| Related Table | Relationship |
|---------------|--------------|
| reservations | profiles.id → reservations.user_id |
| key_issuance | profiles.id → key_issuance.student_id |

---

## Sample Entry
```text
id: 15
email: anareyes@iskolarngbayan.pup.edu.ph
full_name: Ana Reyes
student_number: 2025-12345-MN-1
program: BSCpE
year_section: 3-1
contact_number: 09123456789
role: Student
is_verified: 1
