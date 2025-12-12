# **profiles Table**

## Purpose
The `profiles` table stores all user accounts in the system, including **students, faculty, and staff** who create reservations, request equipment, and receive room keys.  
It acts as the primary user directory and supports identity verification for reservations and key issuance workflows.

---

## **Table Structure**

| Column Name      | Data Type        | Constraints | Description |
|------------------|------------------|-------------|-------------|
| **id** | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each profile |
| **email** | VARCHAR(255) | UNIQUE, NOT NULL | User’s official institutional email |
| **full_name** | VARCHAR(255) | NOT NULL | Complete name of the user |
| **student_number** | VARCHAR(50) | UNIQUE, NULL | Student ID number (NULL for faculty/staff) |
| **program** | VARCHAR(255) | NULL | Course/program of the student (BSCpE, BSECE, etc.) |
| **year_section** | VARCHAR(50) | NULL | Student’s year and section |
| **contact_number** | VARCHAR(50) | NULL | Phone number of the user |
| **role** | ENUM('Student','Faculty','Staff') | NOT NULL | Defines user access and actions in the system |
| **is_verified** | TINYINT | DEFAULT 0 | Indicates if COR/identity has been verified |
| **cor_url** | TEXT | NULL | URL of uploaded COR image/document |
| **created_at** | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| **updated_at** | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last updated timestamp |

---

## **Key Features**
- Stores complete user identity used for **reservations**, **equipment requests**, and **key issuance**.
- Supports **student verification** through uploaded COR.
- Distinguishes roles for system-level access control:
  - **Student** – can create reservations, request equipment.
  - **Faculty** – can reserve rooms and verify reservations.
  - **Staff** – typically handles key issuance and reservation validation.
- Used as a **foreign key** in other major tables.

---

## **Relationships**

| Related Table | Relationship Type | Description |
|--------------|------------------|-------------|
| **reservations** | 1 → M | One profile can create many reservations (`profiles.id` → `reservations.user_id`) |
| **key_issuance** | 1 → M | A student receives many key issuances (`profiles.id` → `key_issuance.student_id`) |
| **key_issuance** | 1 → M | A staff member issues many keys (`profiles.id` → `key_issuance.issued_by`) |

---

## **Behavior in System Workflow**
- A **verified** student/faculty is required before a reservation can be approved.
- Profile information is used to:
  - Generate reservation logs
  - Track key issuance and returns
  - Associate users with equipment requests
- Email and student number ensure **unique identity** across the system.

---

## **Sample Entry**
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
cor_url: https://example.com/uploads/cor_ana.png
created_at: 2025-01-12 10:22:01
updated_at: 2025-01-15 08:55:20
