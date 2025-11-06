Here is the recreated documentation for the `room_completion` table, now based on the **normalized** design we discussed.

-----

## **room\_completion Table**

### **Purpose:**

Acts as the "check-out" or "clearing" log to manage the final step of a reservation. This table records when a `reservation` is submitted for completion (e.g., the student has vacated the room and returned the key) and tracks the subsequent administrative verification required to formally close the reservation.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| **completion\_id** | INT | PRIMARY KEY, AUTO\_INCREMENT, NOT NULL | Unique identifier for this completion record |
| **reservation\_id** | INT | FOREIGN KEY, **UNIQUE**, NOT NULL | ID of the reservation being completed (links to `reservation`) |
| **completed\_at** | DATETIME | NOT NULL | Timestamp of when the student *submitted* the completion |
| **verified\_by** | INT | FOREIGN KEY, **NULL** | ID of the admin who verified the completion (links to `admin_data`) |
| **verified\_at** | DATETIME | **NULL** | Timestamp of when the admin performed the verification |
| **verified\_status** | ENUM('Approve', 'Rej...) | NOT NULL, DEFAULT 'Pending' | The current status of the verification (e.g., 'Pending', 'Approved') |

### **Key Features:**

  * **Post-Reservation Workflow:** Manages the formal "check-out" process *after* a reservation's time has ended.
  * **One-to-One Relationship:** The **UNIQUE** constraint on `reservation_id` ensures that a single reservation can only be marked as "completed" one time, enforcing a strict one-to-one relationship.
  * **Verification Step:** Creates a formal record for administrators to verify that a room has been vacated and left in good condition before the reservation is fully closed.
  * **Normalized Structure:** This table is fully normalized. It links *only* to the `reservation`, which acts as the single source of truth for all other details (student, room, time, etc.).

### **Table Notes:**

1.  **Workflow:** The typical process is:
    1.  A student's reservation ends.
    2.  The student (via the application) submits a "completion," creating a new row in this table.
    3.  The row is created with `verified_status` as 'Pending', and `verified_by` and `verified_at` as `NULL`.
    4.  An administrator inspects the room.
    5.  The admin updates the row, setting `verified_by` to their ID, `verified_at` to the current time, and `verified_status` to 'Approve' or 'Reject'.
2.  **Normalized Design:** This table **intentionally omits** `student_id` and `room_id`. To find those details, the application must `JOIN` this table with the `reservation` table using `reservation_id`.
3.  **Data Integrity:** The `UNIQUE` constraint on `reservation_id` is critical. It prevents duplicate completion records for the same reservation.

### **Sample Data:**

```
completion_id: 51
reservation_id: 150 (Links to "RES-2025-11-001")
completed_at: 2025-11-10 15:02:00
verified_by: NULL
verified_at: NULL
verified_status: 'Pending'
```

```
completion_id: 52
reservation_id: 149
completed_at: 2025-11-10 12:00:00
verified_by: 2 (Links to "Lab Staff")
verified_at: 2025-11-10 12:05:00
verified_status: 'Approve'
```

### **Foreign Key Configuration:**

**References (Foreign Keys):**

  * **room\_completion.reservation\_id** → `reservation.reservation_id`
      * (Constraint: `fk_rmcompletion_reserva...`)
      * Links this completion log to the original reservation.
  * **room\_completion.verified\_by** → `admin_data.admin_id` (assumed)
      * (Constraint: `fk_rmcompletion_verifica...`)
      * Links to the admin who performed the verification.

### **Data Validation Rules:**

1.  **Foreign Keys:** `reservation_id` must exist in the `reservation` table. `verified_by` (if not `NULL`) must exist in the `admin_data` table.
2.  **Uniqueness:** `reservation_id` must be unique across all rows in this table.
3.  **Workflow Logic:** `verified_by` and `verified_at` **must** be `NULL` if `verified_status` is 'Pending'. They should be populated when the status is changed to 'Approve' or 'Reject'.
4.  **Required Fields:** `reservation_id` and `completed_at` must be provided upon creation.

### **Design Notes:**

  * **Closing the Loop:** This table is essential for "closing the loop" on a reservation, providing a final step that confirms the transaction is 100% complete and verified by an admin.
  * **Data Integrity:** This normalized design eliminates data redundancy and prevents update anomalies, ensuring the `reservation` table remains the single source of truth.
  * **Audit Trail:** This serves as an important audit trail, logging exactly when a reservation was submitted for completion and which administrator signed off on it.

-----