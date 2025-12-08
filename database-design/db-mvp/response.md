### **blocked_dates Table**

#### **Purpose:**  
Stores dates that are blocked for room reservations, such as holidays, maintenance days, or other special events. This ensures that these dates are unavailable for booking.

---

### **Table Structure:**

| Column Name    | Data Type                | Constraints591                     | Description                                                                    |
|----------------|--------------------------|------------------------------------|--------------------------------------------------------------------------------|
| **id**         | UUID                     | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for each blocked date record                                 |
| **reason**     | TEXT                     | NOT NULL                           | Explanation for why the date(s) are blocked                                    |
| **created_at** | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT timezone('utc'::text, now()) | Timestamp when the blocked date record was created                             |
| **start_date** | DATE                     | NOT NULL, DEFAULT CURRENT_DATE     | First date in the blocked date range                                           |
| **end_date**   | DATE                     | NOT NULL, DEFAULT CURRENT_DATE     | Last date in the blocked date range                                            |

---

### **Key Features:**

#### **Validation Rules:**
- **Date Range:**  
  `start_date` must be less than or equal to `end_date`.
- **Reason:**  
  Must be provided and cannot be empty.

#### **Default Values:**
- `id` is auto‑generated using `uuid_generate_v4()`.
- `created_at` is automatically set to the current UTC time when the record is inserted.
- `start_date` and `end_date` default to the current date if not specified.

---

### **Relationships:**

#### **Referenced by (Foreign Keys):**
*This table is not referenced by any other table in the schema.*

---

### **Sample Data:**

```sql
id: 550e8400-e29b-41d4-a716-446655440000
reason: University Holiday
created_at: 2025-12-01 09:00:00+00
start_date: 2025-12-25
end_date: 2025-01-01

id: 550e8400-e29b-41d4-a716-446655440001
reason: Building Maintenance
created_at: 2025-12-02 10:30:00+00
start_date: 2025-12-10
end_date: 2025-12-15
```

---

### **Design Notes:**

- **Simplicity:**  
  Easy to manage and query blocked date ranges.
- **Audit Trail:**  
  `created_at` provides a record of when the block was added.
- **Flexibility:**  
  Supports blocking a single day or a range of days.

---

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

## **incident_reports Table**

#### **Purpose:**  
Stores reports of incidents that occur during room reservations or equipment usage. This includes problems, accidents, or any unusual events.

---

### **Table Structure:**

| Column Name       | Data Type                | Constraints591                     | Description                                                                    |
|-------------------|--------------------------|------------------------------------|--------------------------------------------------------------------------------|
| **id**            | UUID                     | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for each incident report                                    |
| **reporter_id**   | UUID                     |                                    | ID of the user who reported the incident (FK to `profiles.id`)                  |
| **reservation_id**| UUID                     |                                    | ID of the reservation associated with the incident (FK to `reservations.id`)   |
| **room_id**       | UUID                     |                                    | ID of the room where the incident occurred (FK to `rooms.id`)                 |
| **type**          | TEXT                     | NOT NULL                           | Category or type of incident (e.g., “damage”, “theft”, “equipment failure”)    |
| **title**         | TEXT                     | NOT NULL                           | Brief title summarizing the incident                                           |
| **description**   | TEXT                     | NOT NULL                           | Detailed description of the incident                                           |
| **status**        | TEXT                     | DEFAULT 'open'                     | Current status of the report (`open`, `in progress`, `resolved`)               |
| **admin_notes**   | TEXT                     |                                    | Optional notes added by administrators handling the report                    |
| **created_at**    | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT timezone('utc'::text, now()) | Timestamp when the report was filed                                            |
| **equipment_id**  | UUID                     |                                    | ID of the equipment involved in the incident (FK to `equipment.id`)            |

---

### **Key Features:**

#### **Incident Tracking:**
- Captures essential details such as who reported it, what happened, where it happened, and when.
- Allows administrators to monitor and resolve incidents.

#### **Status Management:**
- `open`: Incident has been reported but not yet addressed.  
- `in progress`: Incident is under investigation or being resolved.  
- `resolved`: Incident has been addressed.

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
reporter_id: 123e4567-e89b-12d3-a456-426614174000
reservation_id: 223e4567-e89b-12d3-a456-426614174000
room_id: 323e4567-e89b-12d3-a456-426614174000
type: Equipment Failure
title: Oscilloscope not functioning
description: The digital oscilloscope stopped responding during the experiment.
status: in progress
admin_notes: Technician scheduled for repair on 2025-12-05.
created_at: 2025-12-03 10:15:00+00
equipment_id: 423e4567-e89b-12d3-a456-426614174000
```

---

### **Design Notes:**

- **Comprehensive Logging:**  
  Captures all necessary information for effective incident resolution.
- **Administrator Access:**  
  `admin_notes` allows administrators to add internal comments without altering the original report.

---

## **key_issuance Table**

#### **Purpose:**  
Tracks the issuance and return of room keys to students for reservations. Ensures proper accountability and security.

---

### **Table Structure:**

| Column Name       | Data Type                | Constraints591                     | Description                                                                    |
|-------------------|--------------------------|------------------------------------|--------------------------------------------------------------------------------|
| **id**            | UUID                     | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for each key issuance record                                 |
| **reservation_id**| UUID                     |                                    | ID of the reservation for which the key was issued (FK to `reservations.id`)   |
| **key_id**        | UUID                     |                                    | ID of the room key that was issued (FK to `room_keys.id`)                      |
| **student_id**    | UUID                     |                                    | ID of the student who received the key (FK to `profiles.id`)                  |
| **issued_by**     | UUID                     |                                    | ID of the administrator or staff member who issued the key (FK to `profiles.id`) |
| **issued_at**     | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT timezone('utc'::text, now()) | Timestamp when the key was issued                                              |
| **returned_at**   | TIMESTAMP WITH TIME ZONE |                                    | Timestamp when the key was returned (NULL if not yet returned)                 |
| **status**        | TEXT                     | DEFAULT 'issued'                   | Current status of the key (`issued`, `returned`)                               |

---

### **Key Features:**

#### **Key Management:**
- Ensures that keys are properly issued and accounted for.
- Tracks who issued the key, to whom it was issued, and when it was returned.

#### **Status Management:**
- `issued`: Key has been given to a student and has not yet been returned.  
- `returned`: Key has been returned.

---

### **Table Notes:**

1. **Return Tracking:**  
   `returned_at` should be updated when the key is returned. Until then, the status remains `issued`.

2. **Security:**  
   Only authorized personnel should be able to issue or take back keys.

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
key_id: 323e4567-e89b-12d3-a456-426614174000
student_id: 123e4567-e89b-12d3-a456-426614174000
issued_by: 523e4567-e89b-12d3-a456-426614174000
issued_at: 2025-12-03 08:00:00+00
returned_at: 2025-12-03 17:00:00+00
status: returned

id: 550e8400-e29b-41d4-a716-446655440001
reservation_id: 223e4567-e89b-12d3-a456-426614174001
key_id: 323e4567-e89b-12d3-a456-426614174001
student_id: 123e4567-e89b-12d3-a456-426614174001
issued_by: 523e4567-e89b-12d3-a456-426614174001
issued_at: 2025-12-04 08:30:00+00
returned_at: NULL
status: issued
```

---

### **Design Notes:**

- **Accountability:**  
  Every key issuance and return is logged with the person responsible.
- **Real‑Time Status:**  
  The `status` column provides immediate visibility into whether a key is currently out or has been returned.

---

## **notifications Table**

#### **Purpose:**  
Stores system-generated notifications sent to users (e.g., reservation confirmations, incident alerts, reminders). Helps keep users informed about relevant activities.

---

### **Table Structure:**

| Column Name    | Data Type                | Constraints591                     | Description                                                                    |
|----------------|--------------------------|------------------------------------|--------------------------------------------------------------------------------|
| **id**         | UUID                     | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for each notification record                                 |
| **user_id**    | UUID                     | NOT NULL                           | ID of the user who received the notification (FK to `profiles.id`)             |
| **title**      | TEXT                     | NOT NULL                           | Short title of the notification                                                |
| **message**    | TEXT                     | NOT NULL                           | Detailed content of the notification                                           |
| **type**       | TEXT                     | DEFAULT 'info'                     | Category of the notification (`info`, `warning`, `error`, `success`)           |
| **is_read**    | BOOLEAN                  | DEFAULT false                      | Whether the user has viewed the notification                                   |
| **created_at** | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT timezone('utc'::text, now()) | Timestamp when the notification was created                                    |

---

### **Key Features:**

#### **User Communication:**
- Enables the system to send timely and relevant messages to users.
- Supports different types of notifications to differentiate urgency or context.

#### **Read Status:**
- Tracks whether a user has seen a notification, allowing for follow‑up if needed.

---

### **Table Notes:**

1. **Notification Types:**  
   - `info`: General information.  
   - `warning`: Non‑critical issues or reminders.  
   - `error`: Problems that require user attention.  
   - `success`: Confirmation that an action was completed successfully.

2. **Scalability:**  
   As the system grows, new notification types can be added as needed.

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
user_id: 123e4567-e89b-12d3-a456-426614174000
title: Reservation Confirmed
message: Your reservation for Room 101 on 2025-12-05 has been verified.
type: success
is_read: true
created_at: 2025-12-03 12:00:00+00

id: 550e8400-e29b-41d4-a716-446655440001
user_id: 123e4567-e89b-12d3-a456-426614174001
title: Key Issued
message: A room key has been issued for your reservation.
type: info
is_read: false
created_at: 2025-12-04 08:15:00+00
```

---

### **Design Notes:**

- **User-Centric:**  
  Keeps users informed without cluttering their interface.
- **Flexible Typing:**  
  The `type` field allows for easy filtering and prioritization of notifications.

---

## **profiles Table**

#### **Purpose:**  
Stores user profiles for all individuals interacting with the system, including students, administrators, and possibly professors. This table links to authentication and contains user-specific details.

---

### **Table Structure:**

| Column Name        | Data Type                | Constraints591                                  | Description                                                                    |
|--------------------|--------------------------|-------------------------------------------------|--------------------------------------------------------------------------------|
| **id**             | UUID                     | NOT NULL, PRIMARY KEY                           | Unique identifier for each user profile (also references `auth.users.id`)      |
| **email**          | TEXT                     | NOT NULL, UNIQUE                                | User's email address (used for login)                                          |
| **full_name**      | TEXT                     |                                                  | User's full name                                                               |
| **student_number** | TEXT                     |                                                  | Student's university identification number                                      |
| **program**        | TEXT                     |                                                  | Academic program or department                                                 |
| **year_section**   | TEXT                     |                                                  | User's current year and section (e.g., “3rd Year, Section A”)                  |
| **contact_number** | TEXT                     |                                                  | User's phone number for contact                                                |
| **role**           | USER-DEFINED             | DEFAULT 'student'                                | User's role within the system (e.g., `student`, `admin`)                       |
| **cor_url**        | TEXT                     |                                                  | URL to the user's Certificate of Registration (for verification)                |
| **is_verified**    | BOOLEAN                  | DEFAULT false                                   | Whether the user's account has been verified (e.g., via COR)                   |
| **created_at**     | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT timezone('utc'::text, now()) | Timestamp when the user profile was created                                    |

---

### **Key Features:**

#### **User Verification:**
- The `is_verified` flag ensures that only verified users can perform certain actions.
- `cor_url` provides a means to verify identity using an official document.

#### **Role-Based Access:**
- `role` determines what actions a user can perform within the system (e.g., student vs. admin).

---

### **Table Notes:**

1. **Email Uniqueness:**  
   Each user must have a unique email, which is used as the primary login identifier.

2. **Integration with Authentication:**  
   The `id` column references `auth.users.id`, linking this table to the authentication system.

---

### **Relationships:**

#### **Referenced by (Foreign Keys):**

| Referencing Table    | Foreign Key Column     | Purpose                                                      |
|----------------------|------------------------|--------------------------------------------------------------|
| incident_reports     | reporter_id            | Links incident reports to the reporting user                 |
| incident_reports     | issued_by              | Links incident reports to the admin who handled the report     |
| key_issuance         | student_id             | Links key issuance records to the receiving student           |
| key_issuance         | issued_by              | Links key issuance to the staff member who issued the key     |
| notifications        | user_id                | Links notifications to the recipient user                     |
| reservation_equipment| reservation_id         | Links reservation equipment to the reservation                |
| reservations        | user_id                | Links reservations to the user who made the reservation       |
| reservations        | verified_by            | Links reservations to the user who verified them               |
| reservations        | cancelled_by           | Links reservations to the user who cancelled them             |
| room_keys           | room_id                | Links room keys to the room they belong to                    |

#### **References To (This Table is Referenced By):**
*This table does not reference any other table.*

---

### **Sample Data:**

```sql
id: 123e4567-e89b-12d3-a456-426614174000
email: student1@pup.edu.ph
full_name: John Doe
student_number: 2025101
program: Computer Science
year_section: 3rd Year, Section A
contact_number: +63912345678
role: student
cor_url: https://example.com/cors/2025101.pdf
is_verified: true
created_at: 2025-11-01 08:00:00+00

id: 123e4567-e89b-12d3-a456-426614174001
email: admin1@pup.edu.ph
full_name: Jane Smith
student_number: ADMIN001
program: Information Technology
year_section: N/A
contact_number: +63987654321
role: admin
cor_url: NULL
is_verified: true
created_at: 2025-11-01 09:30:00+00
```

---

### **Design Notes:**

- **Central User Repository:**  
  Serves as the main source of user information for the entire system.
- **Flexibility for Roles:**  
  The `role` column can be expanded with new roles as the system evolves.

---

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

## **room_keys Table**

#### **Purpose:**  
Manages keys for rooms that can be issued to users for access during their reservations.

---

### **Table Structure:**

| Column Name    | Data Type                | Constraints591                     | Description                                                                    |
|----------------|--------------------------|------------------------------------|--------------------------------------------------------------------------------|
| **id**         | UUID                     | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for each room key record                                      |
| **room_id**    | UUID                     |                                    | ID of the room to which the key belongs (FK to `rooms.id`)                      |
| **key_number** | TEXT                     | NOT NULL                           | Physical or logical identifier for the key (e.g., “A101”, “B202”)               |
| **status**     | TEXT                     | DEFAULT 'available'                | Current status of the key (`available`, `issued`, `maintenance`)                |

---

### **Key Features:**

#### **Key Availability:**
- Tracks whether a key is available for issuance, currently issued, or under maintenance.

#### **Room Association:**
- Each key is associated with a specific room.

---

### **Table Notes:**

1. **Unique Key Numbers:**  
   `key_number` should be unique within the context of a room, but can be duplicated across different rooms if necessary.

2. **Maintenance Status:**  
   When a key is under maintenance, it should be marked as such to prevent it from being issued.

---

### **Relationships:**

#### **Referenced by (Foreign Keys):**

| Referencing Table | Foreign Key Column | Purpose                                                      |
|-------------------|--------------------|--------------------------------------------------------------|
| key_issuance      | key_id             | Links key issuance records to the specific key                 |

#### **References To (This Table is Referenced By):**

| Referencing Table | Foreign Key Column | Purpose                                                      |
|-------------------|--------------------|--------------------------------------------------------------|
| rooms             | id                 | Links rooms to their keys                                     |

---

### **Sample Data:**

```sql
id: 323e4567-e89b-12d3-a456-426614174000
room_id: 323e4567-e89b-12d3-a456-426614174000
key_number: A101
status: available

id: 323e4567-e89b-12d3-a456-426614174001
room_id: 323e4567-e89b-12d3-a456-426614174001
key_number: B202
status: issued

id: 323e4567-e89b-12d3-a456-426614174002
room_id: 323e4567-e89b-12d3-a456-426614174002
key_number: C303
status: maintenance
```

---

### **Design Notes:**

- **Security:**  
  Ensures that keys are properly tracked and not misused.
- **Maintenance Handling:**  
  Allows keys to be taken out of circulation when needed.

---

## **rooms Table**

#### **Purpose:**  
Stores information about the rooms in the laboratory that can be reserved. Tracks room details, availability, and features.

---

### **Table Structure:**

| Column Name     | Data Type                | Constraints591                     | Description                                                                    |
|-----------------|--------------------------|------------------------------------|--------------------------------------------------------------------------------|
| **id**          | UUID                     | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for each room record                                         |
| **room_number** | TEXT                     | NOT NULL, UNIQUE                    | Human‑readable identifier for the room (e.g., “Lab 101”, “Room A”)            |
| **description** | TEXT                     |                                    | Optional description providing more details about the room                      |
| **type**        | TEXT                     |                                    | Type or category of the room (e.g., “Lab”, “Classroom”, “Workshop”)            |
| **status**      | USER-DEFINED             | DEFAULT 'available'                | Current availability status of the room (`available`, `maintenance`, `booked`)  |
| **capacity**    | INTEGER                  |                                    | Maximum number of people the room can accommodate                               |
| **floor**       | TEXT                     |                                    | Floor on which the room is located (e.g., “1st Floor”, “Basement”)             |
| **features**    | ARRAY<TEXT>              | DEFAULT '{}'::text[]                | List of features available in the room (e.g., {“Projector”, “Whiteboard”})     |

---

### **Key Features:**

#### **Room Availability:**
- The `status` column indicates whether a room is available for booking, under maintenance, or already booked.

#### **Feature Tracking:**
- The `features` array allows for easy filtering and searching based on required room features.

#### **Capacity Planning:**
- The `capacity` field helps prevent overbooking and ensures that the room is suitable for the expected number of occupants.

---

### **Table Notes:**

1. **Unique Room Numbers:**  
   `room_number` must be unique to avoid confusion when searching or booking.

2. **Status Management:**  
   When a room is booked, the status should be set to `booked` to prevent double booking. Maintenance can be used when the room is unavailable for any reason.

3. **Feature Standardization:**  
   Use a predefined list of possible features to maintain consistency across the system.

---

### **Relationships:**

#### **Referenced by (Foreign Keys):**

| Referencing Table    | Foreign Key Column     | Purpose                                                      |
|----------------------|------------------------|--------------------------------------------------------------|
| incident_reports     | room_id                | Links incident reports to the room where they occurred        |
| key_issuance         | room_id                | Links keys to the rooms they belong to                         |
| reservations         | room_id                | Links reservations to the room being reserved                  |
| room_keys            | room_id                | Links room keys to the room they belong to                     |

#### **References To (This Table is Referenced By):**
*This table does not reference any other table.*

---

### **Sample Data:**

```sql
id: 323e4567-e89b-12d3-a456-426614174000
room_number: Lab 101
description: Main laboratory for computer systems
type: Lab
status: available
capacity: 30
floor: 1st Floor
features: {‘Projector’, ‘Wi-Fi’, ‘Power Outlets’}

id: 323e4567-e89b-12d3-a456-426614174001
room_number: Room A
description: Small meeting room with whiteboard
type: Classroom
status: booked
capacity: 10
floor: Ground Floor
features: {‘Whiteboard’, ‘Chairs’}

id: 323e4567-e89b-12d3-a456-426614174002
room_number: Workshop B
description: Hands-on workshop area
type: Workshop
status: maintenance
capacity: 20
floor: Basement
features: {‘Workbenches’, ‘Tools’}
```

---

### **Design Notes:**

- **Comprehensive Room Information:**  
  Captures all necessary details for effective room management and reservation.
- **Flexibility with Features:**  
  The array of features enables users to filter rooms based on their specific needs.