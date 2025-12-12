# rooms Table

## Purpose
The `rooms` table stores all laboratory rooms, lecture rooms, and other reservable spaces used in the CPEDSCHED 2.0 reservation system.  
It acts as the primary registry of all rooms that can be scheduled for academic, laboratory, research, or departmental activities.  
Each room entry includes structural information, capacity, descriptive details, and operational status, ensuring accurate room allocation and reservation management.

---

## **Table Structure**

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| **id** | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each room |
| **room_number** | VARCHAR(50) | UNIQUE, NOT NULL | Official room label (e.g., "CPE LAB 1", "CEA301") |
| **type** | VARCHAR(50) | NOT NULL | Type/category of room: Laboratory, Lecture, Workshop, etc. |
| **description** | TEXT | NULL | Detailed information about the room, features, available equipment, etc. |
| **capacity** | INT | NOT NULL | Maximum number of people the room can accommodate |
| **floor** | VARCHAR(20) | NULL | Floor or location identifier (e.g., “3rd Floor”, “CEA Bldg”) |
| **status** | ENUM('Available', 'Unavailable') | DEFAULT 'Available' | Current usability of the room |
| **created_at** | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Timestamp for when the record was created |

---

## **Key Features**

### **Room Registry**
- Centralized list of all official laboratory rooms and lecture rooms.
- Prevents duplicate room listings using a **UNIQUE room_number** constraint.
- Supports multiple types of spaces used by the Computer Engineering Department.

### **Room Classification**
- **type** field classifies rooms into categories such as:
  - Laboratory
  - Lecture Room
  - Workshop / Special Room
- Allows filtering and organized display in the reservation interface.

### **Capacity & Space Requirements**
- Rooms include capacity limits to help students choose appropriate spaces.
- Capacity may be used by the reservation system to restrict overbooking.

### **Operational Status**
- Controls room availability in the system.
- Status values:
  - **Available** – Room can be reserved.
  - **Unavailable** – Room is disabled for booking (maintenance, events, etc.)
- Admins can update room status anytime.

### **Descriptive Details**
- Description field may include:
  - equipment or facilities found in the room
  - seating/workstation count
  - special tools or features  
- Helps students identify the correct room for their activity.

### **Automatic Timestamp**
- `created_at` logs when the room was added.
- Used for auditing and historical reference.

---

## **Relationships (Based on MVP ERD)**

### **1. Has Reservations (1:M)**
A room can have many reservations.

| Parent Table | Child Table | Foreign Key |
|--------------|-------------|-------------|
| rooms.id | reservations.room_id | `reservations.room_id → rooms.id` |

This relationship assigns a specific room to every reservation made by a student.

### **2. Has Keys (1:M)**
A room can have multiple physical keys associated with it.

| Parent Table | Child Table | Foreign Key |
|--------------|-------------|-------------|
| rooms.id | room_keys.room_id | `room_keys.room_id → rooms.id` |

This enables key issuance, tracking, and returns.

---

## **Data Flow Overview**

rooms (Room registry)
├── reservations (Student reservation records)
└── room_keys (Physical room keys)

yaml
Copy code

---

## **Data Validation Rules**

### **Room Number**
- Required and must be unique.
- Should follow CPE/CEA building naming conventions.
- Maximum 50 characters.

### **Type**
- Must be an existing room category recognized in the system.
- Used for filtering and layout of available rooms.

### **Capacity**
- Must be a valid integer ≥ 1.
- Should reflect actual maximum occupancy of the room.

### **Status**
- Defaults to **Available**.
- Prevents reservation if set to **Unavailable**.

### **Description**
- Optional but recommended.
- Should include important facility information.

### **Floor**
- Optional; aids location accuracy.
- Useful for navigation and map-based room selection (future feature).

---

## **Sample Data**

```text
id: 1
room_number: CPE LAB 1
type: Laboratory
description: Computer Engineering lab with 20 desktop units, projector, and AC. Suitable for hardware and programming classes.
capacity: 35
floor: 3rd Floor
status: Available
created_at: 2025-02-14 08:30:00
---

## Sample Entry
```text
room_number: CPE LAB 1
type: Laboratory
capacity: 35
status: Available
