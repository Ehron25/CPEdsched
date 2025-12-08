## **reservation_equipment Table**

#### **Purpose:**  
Links reservations with the equipment that users wish to reserve. Allows for multiple pieces of equipment to be included in a single reservation.

---

### **Table Structure:**

| Column Name           | Data Type    | Constraints591                     | Description                                                                    |
|-----------------------|--------------|------------------------------------|--------------------------------------------------------------------------------|
| **id**                | UUID         | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for each reservation‑equipment record                        |
| **reservation_id**    | UUID         |                                    | ID of the reservation to which the equipment is linked (FK to `reservations.id`) |
| **equipment_id**      | UUID         |                                    | ID of the equipment being reserved (FK to `equipment.id`)                      |
| **quantity_requested**| INTEGER      | NOT NULL                           | Number of units of this equipment requested in the reservation                  |

---

### **Key Features:**

#### **Multi‑Equipment Reservations:**
- Enables users to reserve multiple types/quantities of equipment in a single reservation.

#### **Quantity Tracking:**
- `quantity_requested` must be less than or equal to the `available_quantity` in the `equipment` table at the time of reservation.

---

### **Table Notes:**

1. **Reservation Integrity:**  
   Each entry in this table must correspond to a valid reservation and a valid piece of equipment.

2. **No Duplicates:**  
   Typically, a reservation‑equipment pair should only appear once per reservation, though quantity can be adjusted.

---

### **Relationships:**

#### **Referenced by (Foreign Keys):**
*This table is not referenced by any other table.*

#### **References To (This Table is Referenced By):**
*This table does not reference any other table.*

---

### **Sample Data:**

```sql
id: 550e8400-e29b-41d4-a716-446655440000
reservation_id: 223e4567-e89b-12d3-a456-426614174000
equipment_id: 423e4567-e89b-12d3-a456-426614174000
quantity_requested: 2

id: 550e8400-e29b-41d4-a716-446655440001
reservation_id: 223e4567-e89b-12d3-a456-426614174000
equipment_id: 423e4567-e89b-12d3-a456-426614174001
quantity_requested: 1
```

---

### **Design Notes:**

- **Flexibility:**  
  Allows for easy expansion of reservations to include various equipment.
- **Data Integrity:**  
  Application logic must ensure that requested quantities do not exceed available stock.

---
