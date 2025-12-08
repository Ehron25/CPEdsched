# equipment Table

## Purpose
Stores all borrowable laboratory equipment.

---

## Table Structure

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(255) | NOT NULL |
| total_quantity | INT | NOT NULL |
| available_quantity | INT | NOT NULL |
| status | ENUM('Active','Inactive') | DEFAULT 'Active' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## Relationships
- equipment.id → reservation_equipment.equipment_id

---

## Sample Entry
```text
name: Arduino Kit
total_quantity: 20
available_quantity: 16
status: Active
