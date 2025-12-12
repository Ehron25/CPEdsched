# room_key Table

## Purpose
The `room_keys` table manages the complete inventory of all physical keys used within the CPEDSCHED system.  
Each key is uniquely identified, linked to a specific room, and tracked with a real-time status to support the borrowing and returning workflow handled by the `key_issuance` table.

This table enables the system to:
- Determine which keys are currently available or issued.
- Associate keys with rooms in the reservation system.
- Maintain accountability and monitoring of all physical key assets.

---

## **Table Structure**

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| **id** | INT | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for each physical key |
| **key_number** | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable label for the key (e.g., “LAB1-KEY-01”, “512-B Copy 2”) |
| **room_id** | INT | FOREIGN KEY → `rooms.id`, NOT NULL | Specifies which room the key is assigned to |
| **status** | ENUM('Available', 'Issued', 'Missing', 'Damaged') | DEFAULT 'Available' | Current condition/state of the key |
| **created_at** | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Timestamp when the key record was created |
| **updated_at** | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Auto-updates whenever the key status or details are modified |

---

## **Key Features**

### **1. Master Inventory of Physical Keys**
The table acts as the central registry of all real, physical room keys managed by the Department.  
Each key is logged individually, even if multiple copies exist for the same room.

### **2. Direct Room Linkage**
Each key is connected to a room through the `room_id` foreign key, establishing a clear one-to-many relationship:
- One room → Many keys
- Each key → Belongs to exactly one room

This supports scenarios where a single laboratory may have several spare or duplicate keys.

### **3. Real-Time Key Status Monitoring**
The `status` field provides accurate tracking of the key's current state:
- **Available** – Key can be issued to a requester  
- **Issued** – Key is currently borrowed via the `key_issuance` table  
- **Missing** – Key is lost or cannot be located  
- **Damaged** – Key is broken or unusable  

Status updates are automatically timestamped.

### **4. Audit & Accountability**
The `updated_at` column automatically records the latest modification time, enabling:
- Tracking of borrowing/returning patterns  
- Easier monitoring of missing or damaged keys  
- Transparent audit trails for administrative review  

---

## **Relationships**

### **1. Belongs to Room (M:1)**
Each key is linked to exactly one room.

| Parent Table | Child Table | Foreign Key |
|--------------|-------------|-------------|
| rooms.id | room_keys.room_id | `room_keys.room_id → rooms.id` |

**Behavior:**
- **ON DELETE: RESTRICT**  
  Prevents deleting a room that still has registered keys.
- **ON UPDATE: CASCADE**  
  Automatically updates the `room_id` here if the room’s ID changes.

### **2. Has Many Key Issuances (1:M)**
A single key can appear in multiple borrowing records.

| Parent Table | Child Table | Foreign Key |
|--------------|-------------|-------------|
| room_keys.id | key_issuance.key_id | `key_issuance.key_id → room_keys.id` |

**Behavior:**
- **ON DELETE: RESTRICT**  
  Prevents deleting a key with recorded issuance logs.
- **ON UPDATE: CASCADE**  
  Keeps foreign key references synchronized.

---

## **Data Validation Rules**

1. **Room Must Exist**  
   - `room_id` must reference an existing `rooms.id`.

2. **Unique Key Label**  
   - `key_number` must be unique to avoid conflicts in the borrowing process.

3. **Valid Key Status**  
   - Status must be one of:  
     `'Available', 'Issued', 'Missing', 'Damaged'`.

4. **Correct State Updates**  
   - When a key is issued, the system should automatically update its status to **Issued**.  
   - When returned, status should revert to **Available**.  
   - If reported missing or damaged, the status should not allow new issuance.

5. **Automatic Timestamping**  
   - `created_at` records initial entry.  
   - `updated_at` updates whenever changes occur.

---

## **Design Notes**

- **Separation of Concerns:**  
  This table only stores the key *as an asset*. Actual borrowing events are stored in `key_issuance`.

- **State Machine Behavior:**  
  The `status` field effectively controls the life cycle of the key through states like Available → Issued → Returned.

- **Scalable Design:**  
  Rooms can have multiple keys without altering the structure.  
  Additional key states can be added easily in future revisions.

---

## **Sample Entries**

id: 1
key_number: LAB1-KEY-01
room_id: 3
status: Available
created_at: 2025-10-01 08:00:00
updated_at: 2025-10-01 08:00:00

Copy code
id: 2
key_number: LAB1-KEY-02
room_id: 3
status: Issued
created_at: 2025-10-02 09:10:00
updated_at: 2025-10-05 14:22:10 (Updated due to issuance)

Copy code
id: 3
key_number: STOR-KEY-A
room_id: 8
status: Missing
created_at: 2025-09-18 11:40:00
updated_at: 2025-11-01 15:55:00

pgsql
Copy code

---
