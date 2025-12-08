# reservations Table

## Purpose
Stores all room reservations made by verified users.

---

## Table Structure

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique reservation ID |
| reservation_number | VARCHAR(50) | UNIQUE, NOT NULL | Generated reservation ID |
| user_id | INT | FK → profiles(id) | Requesting user |
| room_id | INT | FK → rooms(id) | Reserved room |
| subject_code | VARCHAR(50) | NULL | Course code |
| professor_name | VARCHAR(255) | NULL | Faculty supervising |
| professor_email | VARCHAR(255) | NULL | Email of faculty |
| professor_contact_number | VARCHAR(50) | NULL | Contact of faculty |
| professor_status | ENUM('Regular','Part-time','Guest') | NULL | Classification |
| date_reserved | DATE | NOT NULL | Reservation date |
| time_start | TIME | NOT NULL | Start time |
| time_end | TIME | NOT NULL | End time |
| status | ENUM('Pending','Approved','Cancelled','Completed') | DEFAULT 'Pending' | Reservation status |
| cancel_reason | TEXT | NULL | Reason for cancellation |
| cancelled_by | INT | FK → admin_data(admin_id) | Admin who cancelled |
| cancelled_at | TIMESTAMP | NULL | Cancellation timestamp |
| verified_by | INT | FK → admin_data(admin_id) | Admin who approved |
| verified_at | TIMESTAMP | NULL | When reservation was approved |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last update |

---

## Relationships
- One reservation may request **multiple equipment items**  
  → reservation_equipment (1:M)
- One reservation may have **one key issuance**  
  → key_issuance (1:M)

---

## Sample Entry
```text
reservation_number: RES-2025-00123
user_id: 15
room_id: 5
date_reserved: 2025-02-10
time_start: 09:00
time_end: 12:00
status: Pending
