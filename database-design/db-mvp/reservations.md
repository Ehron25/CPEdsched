## **reservations Table**

#### **Purpose:**  
Manages room reservation requests made by users. Tracks details such as date, time, room, status, and verification.

---

### **Table Structure:**

| Column Name            | Data Type                | Constraints591                                  | Description                                                                    |
|------------------------|--------------------------|-------------------------------------------------|--------------------------------------------------------------------------------|
| **id**                 | UUID                     | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for each reservation record                                   |
| **reservation_number** | TEXT                     | UNIQUE                                          | Human‑readable reservation ID assigned to each reservation                      |
| **user_id**            | UUID                     | NOT NULL                                        | ID of the user who made the reservation (FK to `profiles.id`)                  |
| **room_id**            | UUID                     | NOT NULL                                        | ID of the room being reserved (FK to `rooms.id`)                               |
| **subject_code**       | TEXT                     |                                                  | Academic subject code associated with the reservation                           |
| **professor_name**     | TEXT                     |                                                  | Name of the professor conducting the session                                    |
| **professor_email**    | TEXT                     |                                                  | Email address of the professor                                                  |
| **date_reserved**      | DATE                     | NOT NULL                                        | Date for which the room is reserved                                            |
| **time_start**         | TIME WITHOUT TIME ZONE   | NOT NULL                                        | Start time of the reservation                                                   |
| **time_end**           | TIME WITHOUT TIME ZONE   | NOT NULL                                        | End time of the reservation                                                    |
| **status**             | USER-DEFINED             | DEFAULT 'pending'                                | Current status of the reservation (`pending`, `verified`, `cancelled`)          |
| **verified_by**        | UUID                     |                                                  | ID of the user who verified the reservation (FK to `profiles.id`)              |
| **created_at**         | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT timezone('utc'::text, now()) | Timestamp when the reservation was created                                      |
| **cancel_reason**      | TEXT                     |                                                  | Reason provided for cancelling the reservation                                  |
| **professor_contact_number** | TEXT                  |                                                  | Contact number of the professor                                                 |
| **professor_status**   | TEXT                     | DEFAULT 'pending'                                | Status of professor verification (`pending`, `approved`, `rejected`)            |
| **cancelled_by**       | UUID                     |                                                  | ID of the user who cancelled the reservation (FK to `profiles.id`)              |
| **cancelled_at**       | TIMESTAMP WITH TIME ZONE |                                                  | Timestamp when the reservation was cancelled                                     |
| **verified_at**        | TIMESTAMP WITH TIME ZONE |                                                  | Timestamp when the reservation was verified                                      |

---

### **Key Features:**

#### **Reservation Lifecycle:**
- Tracks a reservation from creation (`pending`) through verification (`verified`) to possible cancellation (`cancelled`).

#### **Professor Involvement:**
- Allows for verification and approval by a professor where applicable.

#### **Audit Trail:**
- Records who verified or cancelled a reservation and when.

---

### **Table Notes:**

1. **Reservation Uniqueness:**  
   `reservation_number` must be unique and user‑friendly for reference.

2. **Time Validation:**  
   `time_start` must be earlier than `time_end`.

3. **Cancellation Tracking:**  
   If a reservation is cancelled, `cancelled_by` and `cancelled_at` must be populated.

---

### **Relationships:**

#### **Referenced by (Foreign Keys):**

| Referencing Table     | Foreign Key Column     | Purpose                                                      |
|-----------------------|------------------------|--------------------------------------------------------------|
| incident_reports      | reservation_id         | Links incident reports to the reservation                     |
| key_issuance         | reservation_id         | Links key issuance to the reservation                         |
| reservation_equipment| reservation_id         | Lists equipment reserved as part of this reservation          |

#### **References To (This Table is Referenced By):**

| Referencing Table     | Foreign Key Column     | Purpose                                                      |
|-----------------------|------------------------|--------------------------------------------------------------|
| profiles              | verified_by            | Links to user who verified the reservation                    |
| profiles              | cancelled_by           | Links to user who cancelled the reservation                   |

---

### **Sample Data:**

```sql
id: 223e4567-e89b-12d3-a456-426614174000
reservation_number: RES-2025-12-03-001
user_id: 123e4567-e89b-12d3-a456-426614174000
room_id: 323e4567-e89b-12d3-a456-426614174000
subject_code: CS101
professor_name: Dr. Alice Brown
professor_email: brown@pup.edu.ph
date_reserved: 2025-12-05
time_start: 09:00:00
time_end: 10:00:00
status: verified
verified_by: 123e4567-e89b-12d3-a456-426614174001
created_at: 2025-12-01 10:00:00+00
cancel_reason: NULL
professor_contact_number: +639123456789
professor_status: approved
cancelled_by: NULL
cancelled_at: NULL
verified_at: 2025-12-01 14:30:00+00
```

---

### **Design Notes:**

- **Comprehensive Tracking:**  
  Captures all aspects of a reservation for transparency and accountability.
- **Flexibility for Academic Use:**  
  Includes fields for subject codes and professor information to suit academic scheduling needs.

---