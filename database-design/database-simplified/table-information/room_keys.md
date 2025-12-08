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