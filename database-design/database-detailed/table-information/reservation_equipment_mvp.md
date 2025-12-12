# reservation_equipment Table

## Purpose
Serves as a junction table that connects a reservation to the equipment items included in that reservation.  
This table resolves the many-to-many relationship between `reservations` and `equipment` in the MVP system.

---

## Table Structure

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| **id** | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each reservation–equipment line item |
| **reservation_id** | INT | FOREIGN KEY, NOT NULL | References `reservations.id` — identifies the reservation this equipment belongs to |
| **equipment_id** | INT | FOREIGN KEY, NOT NULL | References `equipment.id` — identifies the equipment being requested |
| **quantity_requested** | INT | NOT NULL | Number of units of this equipment requested in the reservation |

---

## Key Features

### **Many-to-Many Resolution**
- A reservation can include multiple equipment types  
- A single equipment item can appear in multiple reservations  
- This table links them together

### **Line-Item Structure**
Each row represents **one equipment type** within a reservation and the quantity requested for that equipment.

### **MVP-Aligned Minimal Design**
Based strictly on the MVP ERD:
- No per-item status
- No timestamps
- No extended metadata  
→ Only essential fields needed to support reservations

---

## Relationships

**Foreign Keys**
- `reservation_equipment.reservation_id` → `reservations.id`
- `reservation_equipment.equipment_id` → `equipment.id`

**Cardinality**
reservations (1)
↓
reservation_equipment (Many)
↓
equipment (1)

yaml
Copy code

---

## Data Validation Rules

1. **Foreign Key Integrity**  
   - `reservation_id` must exist in `reservations`  
   - `equipment_id` must exist in `equipment`

2. **Quantity Rules**  
   - `quantity_requested` must be a positive integer  
   - Must always be ≤ `equipment.available_quantity` during reservation creation

3. **No Duplicate Line Items (Optional Rule)**  
   The system may enforce uniqueness of `(reservation_id, equipment_id)`  
   to prevent duplicate entries for the same equipment in one reservation.

---

## Sample Entries

```text
id: 301
reservation_id: 155
equipment_id: 4
quantity_requested: 2
text
Copy code
id: 302
reservation_id: 155
equipment_id: 7
quantity_requested: 1
text
Copy code
id: 303
reservation_id: 158
equipment_id: 4
quantity_requested: 3
Design Notes
This is a standard junction table used for many-to-many relationships.

Keeps the reservations table clean by avoiding repeated equipment entries.

Works together with the equipment table to enforce inventory limits.

Provides the minimum needed functionality for the MVP reservation workflow.
