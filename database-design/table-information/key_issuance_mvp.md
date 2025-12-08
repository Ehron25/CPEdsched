# key_issuance Table

## Purpose
Tracks which user borrowed a room key and when it was returned.

---

## Table Structure

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| reservation_id | INT | FK → reservations(id) |
| key_id | INT | FK → room_keys(id) |
| student_id | INT | FK → profiles(id) |
| issued_by | INT | FK → admin_data(admin_id) |
| issued_at | TIMESTAMP | NOT NULL |
| returned_at | TIMESTAMP | NULL |
| status | VARCHAR(20) | 'Issued', 'Returned', 'Lost' |

---

## Relationships
Links admin, student profile, room key, and reservation in one transaction.

---

## Sample Entry
```text
reservation_id: 155
key_id: 2
student_id: 15
issued_by: 1
status: Issued
