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