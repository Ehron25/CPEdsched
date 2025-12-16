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

