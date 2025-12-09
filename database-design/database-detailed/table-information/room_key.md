## **room\_keys Table**

### **Purpose:**

Manages the inventory of all physical keys available in the `cpedsched` system. This table links each individual key to a specific room in the `room_data` table and tracks its current real-time status (e.g., 'Available', 'Issued', 'Lost').

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| **key\_id** | INT | PRIMARY KEY, AUTO\_INCREMENT, NOT NULL | Unique identifier for each individual physical key |
| **room\_id** | INT | FOREIGN KEY, NOT NULL | ID of the room this key opens (links to `room_data`) |
| **key\_number** | VARCHAR(45) | NOT NULL | Human-readable identifier for the key (e.g., "512-A", "Lab Closet - Copy 1") |
| **key\_status** | ENUM('Available', 'Lo...) | NOT NULL, DEFAULT 'Available' | The current status of the key (e.g., 'Available', 'Issued', 'Lost') |
| **update\_at** | DATETIME | NOT NULL, DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP | Timestamp that automatically updates when the key's record is changed (e.g., status update) |

### **Key Features:**

  * **Physical Key Inventory:** Serves as the master list of all individual keys managed by the system.
  * **Room Association:** Directly links each key to a single room record, establishing a clear one-to-many relationship (one room can have many keys).
  * **Real-time Status Tracking:** The `key_status` column provides immediate information on whether a key is available for borrowing, currently on loan, or marked as lost.
  * **Automatic Auditing:** The `update_at` column automatically records the exact time any change is made to a key's record (like a status change), providing a simple audit trail for last activity.

### **Table Notes:**

1.  **One-to-Many Relationship:** This table has a one-to-many relationship with `room_data`. One room can have multiple keys (e.g., "Room 512" might have `key_id` 1 and `key_id` 2).
2.  **Core of Key Borrowing:** This table is central to the key issuance process. The `key_issuance` table will reference a `key_id` from this table for every loan transaction.
3.  **Status Management:** The `key_status` is the most critical field for business logic. When a key is borrowed via the `key_issuance` table, its status here should be updated to 'Issued' (or equivalent). When returned, it should be set back to 'Available'.
4.  **Human-Readable ID:** `key_number` is the user-facing label for the key, which distinguishes it from other keys for the same room.

### **Sample Data:**

```
key_id: 1
room_id: 10      (Links to "Room 512-B" in room_data)
key_number: "512-B Key 1"
key_status: 'Available'
update_at: 2025-11-01 08:00:00
```

```
key_id: 2
room_id: 10      (Links to "Room 512-B" in room_data)
key_number: "512-B Key 2"
key_status: 'Issued'
update_at: 2025-11-07 09:15:22
```

```
key_id: 3
room_id: 15      (Links to "Storage Closet" in room_data)
key_number: "STORAGE-A"
key_status: 'Available'
update_at: 2025-10-30 14:20:01
```

### **Foreign Key Configuration:**

**References (Foreign Keys):**

  * **room\_keys.room\_id** → `room_data.room_id` (assumed)
      * (Constraint Name: `fk_key_room`)
      * Links each key to its corresponding room.
      * ON DELETE: RESTRICT (Prevents deleting a room if keys are still associated with it).
      * ON UPDATE: CASCADE (If a `room_id` changes in `room_data`, it updates here).

**Referenced by:**

  * **key\_issuance.key\_id** → `room_keys.key_id`
      * Links key-borrowing transactions to a specific key.
      * ON DELETE: RESTRICT (Prevents deleting a key if it has borrowing records).
      * ON UPDATE: CASCADE.

### **Data Validation Rules:**

1.  **Foreign Key:** `room_id` must be a valid ID that exists in the `room_data` table.
2.  **Key Number:** `key_number` cannot be NULL. It is recommended to enforce a UNIQUE constraint on this column to prevent duplicate key labels.
3.  **Status:** `key_status` must be one of the predefined ENUM values (e.g., 'Available', 'Issued', 'Lost', 'Maintenance'). The default is 'Available'.
4.  **Timestamp:** `update_at` is managed by the database automatically. It updates every time the row is modified.

### **Design Notes:**

  * **Lookup Table:** This table acts as a primary inventory or lookup table for the physical key assets.
  * **State Machine:** The `key_status` field effectively turns each key into a simple state machine, whose state is controlled by the borrowing and returning transactions in `key_issuance`.
  * **Clear Responsibility:** This table's design clearly separates the *item* (the key) from the *action* (the issuance/loan), which is a core principle of good database design.
  * **Scalability:** This design allows the system to easily add more keys for existing rooms or add new rooms with their own sets of keys without complex changes.

-----
