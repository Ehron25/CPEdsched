# rooms Table

## Purpose
Stores laboratory rooms available for reservation.

---

## Table Structure

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Room ID |
| room_number | VARCHAR(50) | UNIQUE, NOT NULL | e.g., CPE LAB 1 |
| type | VARCHAR(50) | NOT NULL | Lab, Lecture, Workshop |
| description | TEXT | NULL | Room information |
| capacity | INT | NOT NULL | Number of users allowed |
| floor | VARCHAR(20) | NULL | Floor location |
| status | ENUM('Available','Unavailable') | DEFAULT 'Available' | Room operational status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

---

## Relationships
- rooms.id → reservations.room_id  
- rooms.id → room_keys.room_id

---

## Sample Entry
```text
room_number: CPE LAB 1
type: Laboratory
capacity: 35
status: Available
