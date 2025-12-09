# Database Simplified - CPEDSched v2.0

This folder contains the streamlined version of the CPEDSched database design, focusing on core reservation functionality without the complex academic hierarchy. This simplified approach is ideal for rapid development and MVP (Minimum Viable Product) deployment.

## 📁 Folder Structure

```
database-simplified/
├── README.md                           # This file
├── database-erd/
│   └── cpedsched_2.0.png              # Visual ER diagram
├── database-model/
│   └── cpedsched_2.0.mwb              # MySQL Workbench model file
└── table-information/
    ├── blocked_dates.md
    ├── equipment.md
    ├── incident_reports.md
    ├── key_issuance.md
    ├── notification.md
    ├── profiles.md
    ├── reservation_equipment.md
    ├── reservations.md
    ├── room_keys.md
    └── rooms.md
```

## 🎯 Design Philosophy

The simplified database design emphasizes:

- **Minimal complexity**: Removed academic hierarchy (colleges, departments, programs, sections)
- **Unified user management**: Single `profiles` table for all users (students, professors, admins)
- **Core functionality**: Focus on essential features - room reservations, equipment, and key management
- **Faster development**: Fewer tables and relationships mean quicker implementation
- **Essential additions**: Includes incident reporting, notifications, and blocked dates for operational needs

## 📊 Database Model

**Model File**: `cpedsched_2.0.mwb`

**To view the model:**
1. Open MySQL Workbench
2. Go to File → Open Model
3. Select `database-model/cpedsched_2.0.mwb`
4. Navigate to the ER Diagram tab
5. Explore table structures in the Physical Schemas panel

**Visual Reference**: The `database-erd/cpedsched_2.0.png` file provides a quick visual overview of the database structure without opening MySQL Workbench.

## 📋 Database Tables

### Core Tables

#### 1. **profiles**
Unified user management for all system users.
- Stores students, professors, and administrators in a single table
- Includes authentication credentials
- Uses `user_type` field to differentiate roles
- See `table-information/profiles.md` for details

#### 2. **rooms**
Physical room/facility management.
- Room identification and properties
- Capacity and availability status
- Building/location information
- See `table-information/rooms.md` for details

#### 3. **reservations**
Core reservation records.
- Links users to rooms and time slots
- Reservation status tracking
- Purpose and notes
- See `table-information/reservations.md` for details

### Equipment Management

#### 4. **equipment**
Equipment inventory tracking.
- Equipment catalog with categories
- Availability status
- Condition tracking
- See `table-information/equipment.md` for details

#### 5. **reservation_equipment**
Junction table linking reservations to equipment.
- Many-to-many relationship between reservations and equipment
- Quantity tracking
- Equipment status per reservation
- See `table-information/reservation_equipment.md` for details

### Key Management

#### 6. **room_keys**
Physical key inventory.
- Key identification and tracking
- Associated room links
- Key status (available, issued, lost)
- See `table-information/room_keys.md` for details

#### 7. **key_issuance**
Key borrowing and return records.
- Tracks who borrowed which keys
- Issue and return timestamps
- Links to reservations
- See `table-information/key_issuance.md` for details

### Operational Features

#### 8. **incident_reports**
Facility and equipment incident tracking.
- Document problems and damages
- Link to reservations and rooms
- Status tracking (reported, in progress, resolved)
- See `table-information/incident_reports.md` for details

#### 9. **notification**
System notifications and alerts.
- User notifications for reservations, incidents, etc.
- Read/unread status
- Notification types and priorities
- See `table-information/notification.md` for details

#### 10. **blocked_dates**
Calendar blocking for maintenance or holidays.
- Prevent reservations during specific periods
- Room-specific or system-wide blocks
- Reason tracking
- See `table-information/blocked_dates.md` for details

## 🔄 Key Relationships

```
profiles (1) ──→ (∞) reservations
rooms (1) ──→ (∞) reservations
reservations (∞) ←──→ (∞) equipment [via reservation_equipment]
rooms (1) ──→ (∞) room_keys
profiles (1) ──→ (∞) key_issuance
room_keys (1) ──→ (∞) key_issuance
reservations (1) ──→ (∞) incident_reports
profiles (1) ──→ (∞) notification
rooms (1) ──→ (∞) blocked_dates
```

## ✨ Key Features

### Compared to Database Detailed

| Feature | Simplified | Detailed |
|---------|-----------|----------|
| User Management | ✅ Single `profiles` table | ❌ Separate admin/professor/student tables |
| Academic Structure | ❌ Not included | ✅ Colleges → Departments → Programs → Sections |
| Reservation System | ✅ Streamlined | ✅ Comprehensive with completion workflow |
| Equipment Tracking | ✅ Essential features | ✅ Full tracking with returns table |
| Key Management | ✅ Core functionality | ✅ Detailed tracking |
| Incident Reporting | ✅ Included | ❌ Not included |
| Notifications | ✅ Included | ❌ Not included |
| Blocked Dates | ✅ Included | ❌ Not included |
| Table Count | 10 tables | 17+ tables |

## 🚀 Advantages

1. **Faster Development**: Fewer tables mean quicker implementation and testing
2. **Easier Maintenance**: Simpler structure is easier to understand and modify
3. **MVP Ready**: Contains essential features for a working product
4. **Lower Complexity**: Reduced foreign key relationships and constraints
5. **Operational Focus**: Includes practical features like incident tracking and notifications
6. **Flexible User Management**: Single profiles table accommodates all user types easily

## 📝 Usage Recommendations

**Best suited for:**
- Rapid prototyping and MVP development
- Small to medium-sized institutions
- Systems that don't require detailed academic structure
- Projects prioritizing quick deployment
- Scenarios where operational features (incidents, notifications) are priorities

**Consider the detailed version if you need:**
- Full academic hierarchy tracking
- Separate user type management
- Complex departmental structures
- Detailed equipment return workflows

## 🔧 Getting Started

1. **Review the ER Diagram**: Open `database-erd/cpedsched_2.0.png` for a visual overview
2. **Explore the Model**: Open `database-model/cpedsched_2.0.mwb` in MySQL Workbench
3. **Read Table Documentation**: Check `table-information/` for detailed specifications
4. **Implement**: Use the model as a blueprint for database creation

## 📖 Table Documentation

Each table has comprehensive documentation in the `table-information/` folder including:

- Column names, data types, and descriptions
- Primary and foreign key definitions
- Constraints and validation rules
- Indexes for performance
- Relationship diagrams
- Usage examples and business logic

## 🛠️ Technical Details

- **Naming Convention**: snake_case for all tables and columns
- **Foreign Keys**: All relationships enforced with foreign key constraints
- **Timestamps**: Audit fields (created_at, updated_at) included where appropriate
- **Indexes**: Strategic indexing for performance optimization
- **Data Integrity**: NOT NULL and UNIQUE constraints applied appropriately

## 🔐 Security Considerations

- Passwords should be hashed (bcrypt/argon2) before storage in `profiles` table
- Use role-based access control based on `user_type` in profiles
