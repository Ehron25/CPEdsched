## **reservation\_equipment Table**

### **Purpose:**

Functions as a junction (or "line item") table that links a specific `reservation` to the individual `equipment` items requested for that reservation. It resolves the many-to-many relationship, allowing a single reservation to include multiple types of equipment, each with its own requested quantity and status.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| **res\_equip\_id** | INT | PRIMARY KEY, AUTO\_INCREMENT, NOT NULL | Unique identifier for this specific equipment line item on a reservation |
| **reservation\_id** | INT | FOREIGN KEY, NOT NULL | ID of the main reservation (links to `reservation`) |
| **equipment\_id** | INT | FOREIGN KEY, NOT NULL | ID of the equipment being requested (links to `equipment`) |
| **quantity\_requested** | INT | NOT NULL | The number of units of this specific equipment item requested |
| **equipment\_status** | ENUM('Active', 'Pendi...) | NOT NULL, DEFAULT 'Pending' | The status of this specific line item (e.g., 'Pending', 'Approved', 'Rejected', 'Issued') |
| **created\_at** | DATETIME | NOT NULL | Timestamp of when this item was added to the reservation |

### **Key Features:**

  * **Many-to-Many Resolution:** This table is the standard solution for the many-to-many relationship between `reservation` and `equipment`. A reservation can have many equipment items, and an equipment item can be part of many different reservations.
  * **Reservation Line Items:** Each row acts as a "line item" for a reservation, specifying one type of equipment and the quantity needed.
  * **Granular Status Control:** The `equipment_status` column allows administrators to approve, reject, or track the status of *each item* within a reservation individually, rather than approving or rejecting the entire reservation at once.
  * **Quantity Tracking:** The `quantity_requested` column is essential for managing equipment stock, allowing users to request multiple units of the same item (e.g., 3 multimeters, 10 patch cables).

### **Table Notes:**

1.  **Junction Table:** This table's primary purpose is to connect the `reservation` and `equipment` tables.
2.  **Individual Item Status:** The `equipment_status` defaults to 'Pending'. This is the starting point for the admin approval workflow.
3.  **Audit Trail:** The `created_at` timestamp records exactly when each item was added to the reservation request.
4.  **Flexibility:** Using a surrogate primary key (`res_equip_id`) is more flexible than a composite key (of `reservation_id` and `equipment_id`), as it simplifies updates and foreign key references from other tables (if any).

### **Sample Data:**

*Assume Reservation ID 75 is for "CPE 4th Year Group 1" and Reservation ID 76 is for "CPE 3rd Year Group 3".*

```
res_equip_id: 201
reservation_id: 75
equipment_id: 10 (e.g., Oscilloscope)
quantity_requested: 2
equipment_status: 'Pending'
created_at: 2025-11-07 10:30:00
```

```
res_equip_id: 202
reservation_id: 75
equipment_id: 22 (e.g., Digital Multimeter)
quantity_requested: 4
equipment_status: 'Pending'
created_at: 2025-11-07 10:30:00
```

```
res_equip_id: 203
reservation_id: 76
equipment_id: 10 (e.g., Oscilloscope)
quantity_requested: 1
equipment_status: 'Active'
created_at: 2025-11-07 11:15:00
```

### **Foreign Key Configuration:**

**References (Foreign Keys):**

  * **reservation\_equipment.reservation\_id** → `reservation.reservation_id`
      * (Constraint Name: `fk_res_equip_reservation`)
      * Links this line item to the main reservation record.
  * **reservation\_equipment.equipment\_id** → `equipment.equipment_id`
      * (Constraint Name: `fk_res_equip_equipment`)
      * Links this line item to the specific equipment being requested.

### **Data Validation Rules:**

1.  **Foreign Keys:** The `reservation_id` and `equipment_id` values must exist as primary keys in the `reservation` and `equipment` tables, respectively.
2.  **Quantity:** `quantity_requested` must be a positive integer (e.g., greater than 0).
3.  **Status:** The `equipment_status` must be one of the predefined ENUM values. It will default to 'Pending' if not specified on insertion.
4.  **Required Fields:** All columns are marked as NOT NULL (NN).
5.  **Uniqueness:** Depending on business rules, you might enforce a unique constraint on (`reservation_id`, `equipment_id`) to prevent duplicate equipment types on the same reservation. The current design allows it, which could be valid if items are added at different times.

### **Design Notes:**

  * **Central to Reservations:** This table is critical for the equipment reservation functionality.
  * **Normalized Design:** This design correctly normalizes the database, preventing redundant data. Instead of storing equipment details in the `reservation` table, it links to them.
  * **Inventory Management:** The `quantity_requested` in this table, combined with the total stock in the `equipment` table, is the basis for all inventory and availability checks.
  * **Surrogate Key:** `res_equip_id` is the surrogate primary key, ensuring each line item has a unique, simple identifier.

-----