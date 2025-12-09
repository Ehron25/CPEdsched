## **reservation Table**

### **Purpose:**

This is the central transaction table for the entire `cpedsched` system. It stores the complete details of a single reservation event, linking the student, the requested room, the professor, and the academic context (course/section) for a specific date and time. It also manages the complete lifecycle of the request, from 'Pending' through verification, approval, and potential cancellation.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| **reservation\_id** | INT | PRIMARY KEY, AUTO\_INCREMENT, NOT NULL | Unique identifier for the reservation |
| **reservation\_number** | VARCHAR(45) | UNIQUE, NULL | A unique, human-readable code based on the creation date (e.g., "251107-0001") |
| **student\_id** | INT | FOREIGN KEY, NOT NULL | ID of the student making the reservation (links to `student_data`) |
| **room\_id** | INT | FOREIGN KEY, NOT NULL | ID of the room being reserved (links to `room_data`) |
| **course\_name** | VARCHAR(200) | NOT NULL | The full name of the course for which the reservation is being made |
| **section\_id** | INT | FOREIGN KEY, NOT NULL | ID of the student's section (links to `sections`) |
| **professor\_id** | INT | FOREIGN KEY, NOT NULL | ID of the professor for the class (links to `professor_information`) |
| **date\_reserved** | DATE | NOT NULL | The specific date for which the room is reserved |
| **time\_start** | TIME | NOT NULL | The start time of the reservation |
| **time\_end** | TIME | NOT NULL | The end time of the reservation |
| **notification** | ENUM('Email', 'SMS',...) | NOT NULL | Preferred notification method for status updates |
| **status** | ENUM('Pending', 'Ver...) | NOT NULL, DEFAULT 'Pending' | The current status of the reservation (e.g., 'Pending', 'Verified', 'Active') |
| **verified\_by** | INT | FOREIGN KEY, NULL | ID of the admin who verified the request (links to `admin_data`) |
| **verified\_at** | DATETIME | NULL | Timestamp of when the reservation was verified by an admin |
| **professor\_confirmed\_at** | DATETIME | NULL | Timestamp of when the professor confirmed the reservation |
| **issuance\_id** | INT | FOREIGN KEY, NULL | ID of the key issuance transaction, linking this to a `key_issuance` record |
| **cancelled\_by\_role** | ENUM('Student', 'Ad...) | NULL | Role of the person who cancelled the reservation (e.g., 'Student', 'Admin') |
| **cancelled\_by\_admin**| INT | FOREIGN KEY, NULL | ID of the admin who cancelled (links to `admin_data`) |
| **cancelled\_by\_student**| INT | FOREIGN KEY, NULL | ID of the student who cancelled (links to `student_data`) |
| **cancel\_description**| LONGTEXT | NULL | The reason or description for the cancellation |
| **created\_at** | DATETIME | NOT NULL, DEFAULT CURRENT\_TIMESTAMP | Timestamp of when the reservation request was created |
| **updated\_at** | DATETIME | NOT NULL, DEFAULT CURRENT\_TIMESTAMP ON UPDATE ... | Timestamp that automatically updates when the record is modified |

### **Key Features:**

  * **Central Transaction Hub:** This table is the "heart" of the scheduling system, connecting students, rooms, professors, sections, and admins in a single record.
  * **Complete Lifecycle Management:** Manages the entire business process, from the initial 'Pending' request to verification, confirmation, key issuance, and potential cancellation.
  * **Unique Human-Readable ID:** The `reservation_number` (Unique Key) provides an easy-to-track identifier for students and admins, in the format `YYMMDD-XXXX` (e.g., `251107-0001`), which is separate from the database's `reservation_id` (Primary Key).
  * **Detailed Auditing:** Tracks *who* and *when* for all major events: `created_at`, `updated_at`, `verified_by`, `verified_at`, `professor_confirmed_at`, and a detailed cancellation section.
  * **Flexible Cancellation:** The NULLable cancellation fields (`cancelled_by_role`, `cancelled_by_admin`, `cancelled_by_student`, `cancel_description`) provide a robust way to track *why* and *by whom* a reservation was cancelled.

### **Table Notes:**

1.  **Core of the System:** Almost every action a user takes (requesting, approving, cancelling) will interact with this table.
2.  **NULLable Foreign Keys:** Many fields (`verified_by`, `issuance_id`, `cancelled_by_...`) are NULLable by design. They are only populated *when* that specific action (verification, cancellation, etc.) occurs. A new, pending reservation will have NULL in all these fields.
3.  **Multiple FKs to Same Table:** Note that this table links to `student_data` twice (for `student_id` and `cancelled_by_student`) and `admin_data` twice (for `verified_by` and `cancelled_by_admin`). This is a correct and standard design to log different actors for different roles.
4.  **Equipment Link:** This table *does not* store the list of requested equipment. Instead, the `reservation_equipment` table links back to this table using `reservation_id`, allowing a single reservation to have many equipment "line items."

### **Sample Data:**

```
reservation_id: 150
reservation_number: "251107-0001"
student_id: 2021001 (Links to "Juan Dela Cruz")
room_id: 10 (Links to "Room 512-B")
course_name: "CPE 423: Embedded Systems"
section_id: 5 (Links to "CPE-4A")
professor_id: 7 (Links to "Prof. Reyes")
date_reserved: 2025-11-10
time_start: 13:00:00
time_end: 15:00:00
notification: 'Email'
status: 'Pending'
verified_by: NULL
verified_at: NULL
professor_confirmed_at: NULL
issuance_id: NULL
cancelled_by_role: NULL
...
created_at: 2025-11-07 01:45:10
updated_at: 2025-11-07 01:45:10
```

### **Foreign Key Configuration:**

**References (Foreign Keys):**

  * **reservation.student\_id** → `student_data` (Constraint: `fk_reservation_student`)
  * **reservation.room\_id** → `room_data` (Constraint: `fk_reservation_room`)
  * **reservation.section\_id** → `sections` (Constraint: `fk_reservation_section`)
  * **reservation.professor\_id** → `professor_information` (Constraint: `fk_reservation_professor`)
  * **reservation.verified\_by** → `admin_data` (Constraint: `fk_reservation_verified`)
  * **reservation.cancelled\_by\_admin** → `admin_data` (Constraint: `fk_cancellation_admin`)
  * **reservation.cancelled\_by\_student** → `student_data` (Constraint: `fk_cancellation_student`)
  * **reservation.issuance\_id** → `key_issuance` (Constraint: `fk_key_issiance`)

**Referenced by:**

  * **reservation\_equipment.reservation\_id** → `reservation.reservation_id`
      * Links the line items (equipment) to this main reservation.

### **Data Validation Rules:**

1.  **Reservation Number:** `reservation_number` must be unique. It should be generated (likely by the application) in the format **`YYMMDD-XXXX`**, where `YYMMDD` is the creation date and `XXXX` is a sequential serial number for that day (e.g., `251107-0001`).
2.  **Required Fields:** All core details (`student_id`, `room_id`, `course_name`, `section_id`, `professor_id`, `date_reserved`, `time_start`, `time_end`) are NOT NULL.
3.  **Referential Integrity:** All foreign key values must exist in their respective parent tables.
4.  **Time Logic:** Application logic must ensure `time_end` is after `time_start`.
5.  **Date Logic:** `date_reserved` must not be in the past (enforced by application).
6.  **Status Workflow:** The `status` field must be one of the predefined ENUM values and defaults to 'Pending'.

### **Design Notes:**

  * **Central Transaction Table:** This is the canonical example of a central transaction table. It acts as the anchor for the entire scheduling process.
  * **Complex State Management:** The numerous `status`, `verified_...`, and `cancelled_...` fields are designed to manage a complex, multi-step business workflow.
  * **High Normalization:** The design correctly separates the *reservation* (this table) from the *reserved items* (`reservation_equipment`), which is a key principle of database normalization.
  * **Auditing:** The `created_at` and `updated_at` (with `ON UPDATE CURRENT_TIMESTAMP`) fields provide a robust, database-level audit trail for record changes.

-----
