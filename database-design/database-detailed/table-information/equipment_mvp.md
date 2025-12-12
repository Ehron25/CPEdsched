# equipment Table

## Purpose
The `equipment` table stores all borrowable laboratory equipment in the CPE Laboratory system.  
It tracks each equipment item's name, total quantity, available quantity, and operational status.  
The table is intentionally simple based on the MVP ERD to support basic reservation functionality.

---

## **Table Structure**

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| **id** | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each equipment item |
| **name** | VARCHAR(255) | NOT NULL | Name of the equipment (e.g., “Arduino Kit”, “HDMI Cable”) |
| **total_quantity** | INT | NOT NULL | Total units of this equipment owned by the laboratory |
| **available_quantity** | INT | NOT NULL | Units currently available for reservation |
| **status** | ENUM('Active','Inactive') | DEFAULT 'Active' | Indicates whether this item is available for borrowing |
| **created_at** | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Timestamp when the equipment record was created |

---

## **Key Features**

### **Minimal MVP Design**
This structure directly reflects the MVP ERD:
- No category system
- No updated_at field
- No discontinued status
- No metadata fields
- Only essential columns for reservation workflow

### **Inventory Tracking**
- `total_quantity` tracks total units owned
- `available_quantity` tracks units ready to be borrowed
- Prevents overbooking using real-time availability

### **Status Management**
- **Active** → Equipment is visible and can be reserved  
- **Inactive** → Equipment is hidden but remains for historical reference  

### **Simple, Clean Structure**
- Lightweight table to ensure fast queries  
- Easy integration with `reservation_equipment` table  
- Ideal for MVP development and testing  

---

## **Relationships**

| Relationship | Description |
|--------------|-------------|
| **equipment.id → reservation_equipment.equipment_id** | Connects equipment to reservations; one equipment can appear in many reservation records |

equipment (1)
↓
reservation_equipment (Many)

yaml
Copy code

---

## **Data Validation Rules**

1. **Quantity Consistency**
   - `available_quantity` ≤ `total_quantity`
   - No negative values
   - System must update quantities on reservation/return

2. **Status Rules**
   - Only values allowed: `Active` or `Inactive`
   - Inactive equipment does not appear in reservation form

3. **Required Fields**
   - `name`, `total_quantity`, and `available_quantity` must be provided

4. **Non-Deletion Policy (Recommended)**
   - Do not delete equipment records to preserve reservation logs  
   - Use `Inactive` instead of deleting  

---

## **Sample Entries**

```text
id: 1
name: Arduino Kit
total_quantity: 20
available_quantity: 16
status: Active
created_at: 2025-01-12 09:15:00
text
Copy code
id: 2
name: HDMI Cable
total_quantity: 50
available_quantity: 45
status: Active
created_at: 2025-01-12 09:16:00
text
Copy code
id: 3
name: Mini Breadboard
total_quantity: 120
available_quantity: 115
status: Active
created_at: 2025-01-12 09:30:00
Design Notes
Matches MVP ERD exactly

Supports core reservation logic

Can be expanded later with:

categories

per-unit tracking

conditions

updated_at timestamps

equipment lifecycle statuses

---

## Sample Entry
```text
name: Arduino Kit
total_quantity: 20
available_quantity: 16
status: Active
