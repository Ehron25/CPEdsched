# room_keys Table

## Purpose
Represents physical keys assigned to each laboratory room.

---

## Table Structure

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| key_number | VARCHAR(50) | UNIQUE, NOT NULL |
| room_id | INT | FK → rooms(id) |
| status | ENUM('Available','Missing','Damaged') | DEFAULT 'Available' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## Relationships
- One key can have multiple issuance logs via key_issuance (1:M)

---

## Sample Entry
```text
key_number: KEY-CPE-01
room_id: 3
status: Available
