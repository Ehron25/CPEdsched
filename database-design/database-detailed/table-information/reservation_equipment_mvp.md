# reservation_equipment Table

## Purpose
Connects reservations with the requested equipment items.

---

## Table Structure

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PK, AUTO_INCREMENT |
| reservation_id | INT | FK → reservations(id) |
| equipment_id | INT | FK → equipment(id) |
| quantity_requested | INT | NOT NULL |

---

## Relationships
- Many equipment can be linked to one reservation (M:1)
- One equipment can belong to many reservations (1:M)

---

## Sample Entry
```text
reservation_id: 155
equipment_id: 4
quantity_requested: 2
