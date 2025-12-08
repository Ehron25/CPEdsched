
## **equipment Table**

#### **Purpose:**  
Stores information about laboratory equipment that can be reserved along with room bookings. Tracks inventory and availability.

---

### **Table Structure:**

| Column Name            | Data Type    | Constraints                      | Description                                                                    |
|------------------------|--------------|----------------------------------|--------------------------------------------------------------------------------|
| **id**                 | UUID         | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for each equipment record                                    |
| **name**               | TEXT         | NOT NULL                         | Name or description of the equipment                                           |
| **total_quantity**     | INTEGER      | DEFAULT 0                        | Total number of units of this equipment available                               |
| **available_quantity** | INTEGER      | DEFAULT 0                        | Number of units currently available for reservation                             |
| **status**             | TEXT         | DEFAULT 'active'                 | Current status of the equipment (`active` or `inactive`)                        |

---

### **Key Features:**

#### **Inventory Management:**
- Tracks both total and available quantities of each equipment type.
- `available_quantity` should always be less than or equal to `total_quantity`.

#### **Status Management:**
- `active`: Equipment is available for reservation.
- `inactive`: Equipment is not available (e.g., under maintenance, retired).

---

### **Table Notes:**

1. **Quantity Consistency:**  
   Application logic must ensure that `available_quantity` never exceeds `total_quantity`.  

2. **Status Handling:**  
   When equipment is marked `inactive`, it should not appear in reservation interfaces.

---

### **Relationships:**

#### **Referenced by (Foreign Keys):**

| Referencing Table        | Foreign Key Column     | Purpose                                                      |
|--------------------------|------------------------|--------------------------------------------------------------|
| incident_reports         | equipment_id           | Links incident reports related to specific equipment          |
| reservation_equipment    | equipment_id           | Lists equipment included in a reservation                     |

---

### **Sample Data:**

```sql
id: 550e8400-e29b-41d4-a716-446655440000
name: Digital Oscilloscope
total_quantity: 5
available_quantity: 3
status: active

id: 550e8400-e29b-41d4-a716-446655440001
name: Multimeter
total_quantity: 10
available_quantity: 10
status: active

id: 550e8400-e29b-41d4-a716-446655440002
name: Vintage Vacuum Tube
total_quantity: 1
available_quantity: 0
status: inactive
```

---

### **Design Notes:**

- **Real‑Time Tracking:**  
  `available_quantity` should be updated in real time as reservations are made or returned.
- **User Interface:**  
  Only `active` equipment with `available_quantity` > 0 should be shown as reservable.

---