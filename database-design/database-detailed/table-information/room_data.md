## **room_data Table**

### **Purpose:**
Stores information about laboratory rooms and facilities available for reservation in the PUP College of Engineering Computer Engineering Laboratory system. This table maintains a registry of all reservable spaces including laboratories, lecture rooms, and other facilities. It tracks room identification, type, descriptions, current availability status, departmental ownership, and automatic timestamp updates. Each room can be reserved by students for various academic activities.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **room_id** | INT | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for each room in the system |
| **room_number** | VARCHAR(50) | UNIQUE, NOT NULL | Official room number/identifier (e.g., "CEA300", "CEA301") |
| **room_type** | ENUM('Lab', 'Lec') | NOT NULL | Type of room: Laboratory or Lecture room |
| **description** | VARCHAR(500) | NOT NULL | Detailed description of the room, facilities, and equipment |
| **room_status** | ENUM('Reserved', 'Available', 'Maintenance') | NOT NULL, DEFAULT 'Available' | Current availability status of the room |
| **department_id** | INT | FOREIGN KEY, NOT NULL | References the department that manages/owns this room |
| **updated_at** | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Timestamp when the room record was last modified |

### **Key Features:**

**Room Registry:**
- Central repository of all reservable spaces in the College of Engineering
- Maintains official room numbers following CEA building nomenclature
- Tracks room types and detailed facility information

**Room Classification:**
- **room_type**: Distinguishes between Laboratories ('Lab') and Lecture rooms ('Lec')
- Enables filtering and searching by room type
- Supports different reservation rules based on room type

**Status Management:**
- **Reserved**: Room is currently booked for an active reservation
- **Available**: Room is free and can be reserved (default state)
- **Maintenance**: Room is under maintenance/repair and unavailable for booking

**Departmental Organization:**
- **department_id**: Foreign key reference to `departments` table
- Each room belongs to a specific department
- Supports departmental resource management and access control

**Automatic Tracking:**
- **updated_at**: Automatically records timestamp of any record modification
- Tracks when room status changes, descriptions update, or any field modification
- Enables audit trail and change history

**Detailed Information:**
- **description**: Comprehensive room details including capacity, equipment, facilities
- Helps students choose appropriate rooms for their needs
- Includes seating capacity, available equipment, and special features

### **Relationships:**

**Parent Table:**
- **departments**: Each room belongs to one department
  - `room_data.department_id` → `departments.department_id`
  - Organizes rooms by departmental ownership/management

**Referenced by:**
- **reservation**: Links reservations to rooms
  - `reservation.room_id` → `room_data.room_id`
  - Tracks which room is being reserved

- **room_keys**: Links physical keys to rooms
  - `room_keys.room_id` → `room_data.room_id`
  - Associates keys with their respective rooms

- **sections**: May link class sections to assigned rooms
  - `sections.room_id` → `room_data.room_id` (if applicable)
  - Tracks home rooms for class sections

**Data Flow:**
```
departments (Department registry)
    ↓ (department_id FK)
room_data (Laboratory/room inventory)
    ↓ (room_id FK)
reservation (Room bookings)
room_keys (Physical key inventory)
sections (Class room assignments)
```

### **Table Notes:**

1. **Room Identification:**
   - Each room must have unique room_number
   - Room numbers follow CEA building format (CEA300, CEA301, CEA302, etc.)
   - CEA prefix indicates Computer Engineering Area/building
   - Cannot have duplicate room identifiers in the system

2. **Status Management:**
   - **Available**: Room can be selected for new reservations (default)
   - **Reserved**: Room is currently in use (updated when reservation is active)
   - **Maintenance**: Room blocked from reservations until maintenance complete
   - Status automatically updates based on reservation schedule
   - Status changes trigger automatic updated_at timestamp

3. **Room Type Designation:**
   - **Laboratory ('Lab')**: Equipped with specialized equipment, workstations, tools
   - **Lecture ('Lec')**: Traditional classroom setup for instruction and theory
   - Type determines available equipment and reservation rules
   - Type affects capacity calculations and usage policies

4. **Departmental Control:**
   - Every room must belong to a department
   - Department manages room usage policies and access
   - Cannot delete department that has assigned rooms
   - Supports cross-department resource sharing if needed

5. **Description Requirements:**
   - Should include room capacity (number of seats/workstations)
   - List major equipment or facilities available
   - Note any special requirements or restrictions
   - Maximum 500 characters for comprehensive details
   - Should be updated when room configuration changes

6. **Availability Rules:**
   - Only 'Available' rooms appear in reservation forms
   - 'Maintenance' rooms hidden from student selection
   - 'Reserved' status prevents double-booking
   - System automatically manages status transitions
   - Real-time availability checking during reservation creation

7. **Automatic Timestamp:**
   - updated_at automatically updates on any field modification
   - Tracks last change to room record
   - Useful for auditing and synchronization
   - No manual intervention required

### **Sample Data:**

```
room_id: 1
room_number: CEA300
room_type: Lab
description: Computer Engineering Laboratory 1. Capacity: 40 students. Equipped with 20 workstations, projector, whiteboard, and air conditioning. Suitable for programming and hardware courses.
room_status: Available
department_id: 1  (→ Computer Engineering Department)
updated_at: 2024-11-05 08:30:00

room_id: 2
room_number: CEA301
room_type: Lab
description: Computer Engineering Laboratory 2. Capacity: 30 students. Features 15 workstations with dual monitors, oscilloscopes, function generators, and breadboarding equipment. Ideal for electronics and embedded systems.
room_status: Reserved
department_id: 1  (→ Computer Engineering Department)
updated_at: 2024-11-05 10:15:00

room_id: 3
room_number: CEA302
room_type: Lec
description: Computer Engineering Lecture Room. Capacity: 50 students. Traditional classroom setup with chairs, projector, sound system, and whiteboard. Used for theory classes and seminars.
room_status: Available
department_id: 1  (→ Computer Engineering Department)
updated_at: 2024-11-04 16:45:00

room_id: 4
room_number: CEA303
room_type: Lab
description: Electronics Laboratory. Capacity: 35 students. Contains soldering stations, power supplies, multimeters, and component storage. Suitable for circuit design and fabrication.
room_status: Maintenance
department_id: 1  (→ Computer Engineering Department)
updated_at: 2024-11-05 07:00:00

room_id: 5
room_number: CEA304
room_type: Lab
description: Advanced Computer Engineering Lab. Capacity: 25 students. High-end workstations, 3D printer, robotics equipment, and network infrastructure. For capstone and advanced projects.
room_status: Available
department_id: 1  (→ Computer Engineering Department)
updated_at: 2024-11-03 14:20:00

room_id: 6
room_number: CEA305
room_type: Lab
description: Microcontroller and Embedded Systems Lab. Capacity: 30 students. Arduino, Raspberry Pi, ESP32 kits, logic analyzers, and development boards. For IoT and embedded programming.
room_status: Available
department_id: 1  (→ Computer Engineering Department)
updated_at: 2024-11-05 09:00:00
```

### **Foreign Key Configuration:**

**In MySQL Workbench Foreign Keys tab:**

| Foreign Key Name | Referenced Table | Column | Referenced Column |
|-----------------|------------------|---------|-------------------|
| fk_room_department | departments | department_id | department_id |

**Recommended Constraints:**
- **ON DELETE:** RESTRICT (prevent deletion of departments that have rooms)
- **ON UPDATE:** CASCADE (propagate department_id changes to rooms)


### **Data Validation Rules:**

1. **Room Number Validation:**
   - Must be unique across all rooms
   - Cannot be empty or NULL
   - Should follow CEA building format: CEA + room number (CEA300, CEA301, etc.)
   - Maximum 50 characters
   - Format: Building Code + Floor + Room sequence number
   - CEA = College of Engineering and Architecture, now College of Engineering

2. **Room Type Validation:**
   - Must be either 'Lab' or 'Lec'
   - Cannot be NULL
   - Determines available equipment and reservation workflows
   - Type should match actual room configuration and facilities

3. **Status Validation:**
   - Default status is 'Available' for new rooms
   - Status transitions:
     - Available → Reserved (when reservation becomes active)
     - Reserved → Available (when reservation completes)
     - Available ↔ Maintenance (based on maintenance schedule)
     - Maintenance → Available (when maintenance completes)
   - Cannot manually set to 'Reserved' if room has no active reservation
   - Each status change updates updated_at timestamp

4. **Description Requirements:**
   - Cannot be empty or NULL
   - Should include minimum information: capacity, equipment, features
   - Maximum 500 characters
   - Use clear, concise language for student understanding
   - Include relevant details for reservation decision-making

5. **Department Association:**
   - `department_id` must exist in departments table
   - Foreign key constraint enforces this automatically
   - Cannot assign room to non-existent department
   - All rooms must have departmental ownership

6. **Availability Logic:**
   - Room status should sync with reservation schedule
   - Check for overlapping reservations before setting status
   - Maintenance status manually controlled by admin
   - System should prevent reservations during maintenance periods
   - Real-time availability validation

7. **Timestamp Management:**
   - updated_at automatically set on record creation
   - Automatically updates on any field modification
   - No manual intervention required
   - Used for tracking changes and synchronization

### **Design Notes:**

- **Normalized Structure**: Department reference eliminates redundancy
- **Status-Driven**: room_status controls reservation availability
- **Type-Based Logic**: room_type enables different workflows for labs vs. lectures
- **Descriptive**: Detailed description field helps students make informed choices
- **Scalability**: Can accommodate various room types and configurations
- **Data Integrity**: Foreign key constraints ensure valid department associations
- **Flexible**: ENUM types allow easy status and type management
- **User-Friendly**: Clear room numbers (CEA format) and descriptions aid in selection
- **Administrative Control**: Status field enables maintenance scheduling
- **Integration Ready**: Primary key serves as reference throughout system
- **Departmental Organization**: Supports multi-department college structure
- **Historical Tracking**: updated_at provides audit trail for changes
- **Building Organization**: CEA prefix indicates Computer Engineering building/area
- **Automatic Updates**: Timestamp management reduces manual overhead
- **Real-time Tracking**: Status changes immediately reflected in system



### **Typical Use Cases:**

**Room Selection:**
- Students browse available rooms when creating reservations
- Filter by room_type (Lab or Lec) based on activity needs
- View descriptions to understand facilities and capacity
- Only 'Available' rooms shown in the selection dropdown
- Real-time availability checking

**Maintenance Management:**
- Admins set room_status to 'Maintenance' for repairs/upgrades
- Blocked rooms hidden from reservation forms
- Maintenance scheduling doesn't affect existing approved reservations
- Status returned to 'Available' when maintenance completes
- updated_at tracks when maintenance status was set/cleared

**Resource Allocation:**
- Departments manage their assigned rooms
- Track room utilization by department
- Report on room availability and usage patterns
- Plan for future room additions or modifications
- Monitor when rooms were last updated

**Reservation Workflow:**
- Student selects available room → creates reservation (status: Pending)
- Admin approves reservation → room remains Available until reservation time
- Reservation starts → room_status updates to Reserved (updated_at changes)
- Reservation ends → room_status returns to Available (updated_at changes)
- All status changes are automatically tracked with timestamps
