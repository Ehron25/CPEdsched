## **key\_issuance Table**

### **Purpose:**

Serves as the central transaction log for tracking the borrowing and returning of room keys in the `cpedsched` system. This table links a specific key (`room_keys`), a student (`student_data`), and an administrator (`admin_data`) for each loan event, recording timestamps and the current status.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| **issuance\_id** | INT | PRIMARY KEY, AUTO\_INCREMENT, NOT NULL | Unique identifier for each key issuance transaction |
| **key\_id** | INT | FOREIGN KEY, NOT NULL | ID of the key being borrowed (links to `room_keys`) |
| **student\_id** | INT | FOREIGN KEY, NOT NULL | ID of the student borrowing the key (links to `student_data`) |
| **school\_id\_held** | TINYINT | NOT NULL, DEFAULT 0 | Flag (0=No, 1=Yes) indicating if the student's school ID was held as collateral |
| **issued\_by** | INT | FOREIGN KEY, NOT NULL | ID of the admin/staff who issued the key (links to `admin_data`) |
| **issued\_at** | DATETIME | NOT NULL | Timestamp of when the key was issued to the student |
| **expected\_return** | DATETIME | NOT NULL | Timestamp of when the key is scheduled to be returned |
| **status** | ENUM('Issued', 'Returned', ...) | NOT NULL | Current status of the key loan (e.g., 'Issued', 'Returned') |

### **Key Features:**

  * **Transaction Logging:** Creates a permanent, identifiable record for every key borrowing and returning event using the `issuance_id`.
  * **Relational Integrity:** Acts as a junction table, linking students (`student_data`), keys (`room_keys`), and administrators (`admin_data`) together for each transaction.
  * **Accountability:** Clearly identifies which student possesses which key and which administrator approved and processed the issuance.
  * **Status Tracking:** Manages the lifecycle of a key loan (e.g., from 'Issued' to 'Returned') using the `status` ENUM field.
  * **Collateral Management:** Includes a dedicated flag (`school_id_held`) to track whether the student's ID was held as collateral for the loan.

### **Table Notes:**

1.  **Core Transaction Table:** This is the primary table for managing all key borrowing and returning activities. A new row is created for every key loan.
2.  **Foreign Key Dependency:** This table is highly dependent on foreign keys. Records cannot be created unless valid `key_id`, `student_id`, and `issued_by` (admin) IDs exist in their respective tables.
3.  **Timestamping:** The `issued_at` and `expected_return` columns are crucial for tracking the duration of the loan and identifying overdue keys.
4.  **Status Lifecycle:** The `status` column is essential for application logic, such as determining if a key is currently available or still on loan.
5.  **Collateral Flag:** The `school_id_held` column (TINYINT) functions as a boolean (0 for No, 1 for Yes).

### **Sample Data:**

```
issuance_id: 101
key_id: 5         (Links to a key, e.g., "512-B Key")
student_id: 2021001 (Links to a student, e.g., "Juan Dela Cruz")
school_id_held: 1
issued_by: 2        (Links to an admin, e.g., "Lab Staff")
issued_at: 2025-11-07 09:15:00
expected_return: 2025-11-07 11:15:00
status: 'Issued'
```

```
issuance_id: 102
key_id: 3         (Links to a key, e.g., "Storage Closet Key")
student_id: 2022005 (Links to a student, e.g., "Maria Clara")
school_id_held: 1
issued_by: 2
issued_at: 2025-11-06 14:00:00
expected_return: 2025-11-06 17:00:00
status: 'Returned'
```

### **Foreign Key Configuration:**

**References (Foreign Keys):**

  * **key\_issuance.key\_id** → `room_keys.key_id`
      * (Constraint Name: `fk_key_issuance_key`)
      * Links this transaction to a specific key record.
  * **key\_issuance.student\_id** → `student_data.student_id`
      * (Constraint Name: `fk_key_issuance_studen`)
      * Links this transaction to the specific student borrowing the key.
  * **key\_issuance.issued\_by** → `admin_data.admin_id` (assumed)
      * (Constraint Name: `fk_key_issuance_issuer`)
      * Links this transaction to the specific administrator who issued the key.

### **Data Validation Rules:**

1.  **Foreign Keys:** The `key_id`, `student_id`, and `issued_by` values submitted must exist as primary keys in the `room_keys`, `student_data`, and `admin_data` tables, respectively.
2.  **Required Fields:** All columns are marked as NOT NULL (NN). No field in a new record can be left empty.
3.  **Timestamps:** `issued_at` and `expected_return` must be valid DATETIME values. `issued_at` is typically set to the current time on creation.
4.  **Status:** The `status` field must be one of the predefined ENUM values (e.g., 'Issued', 'Returned').
5.  **Collateral Flag:** `school_id_held` must be either 0 (False) or 1 (True), with a default of 0.

### **Design Notes:**

  * **Transaction Table:** This table uses a common database design pattern for logging transactions. It connects multiple "lookup" entities (keys, students, admins) into a single event.
  * **Normalization:** By using foreign keys, the table avoids storing redundant data (like the student's name, the key's name, or the admin's name), making the database more efficient and easier to maintain.
  * **Historical Record:** Each row represents a single, complete transaction, allowing for historical reporting, auditing of key usage, and tracking student borrowing history.
  * **Surrogate Key:** `issuance_id` is the surrogate primary key, ensuring each transaction has a unique, non-changing identifier.
  * **State Management:** The `status` column is critical for the application's business logic, allowing it to quickly determine which keys are currently "Issued" and which are available.

-----