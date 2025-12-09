# Database Design Documentation

This folder contains the complete database design documentation for the `cpedsched` system, including the MySQL Workbench models, physical schema, ER diagrams, and detailed information about each database table.

## 📁 Folder Structure

```
database-design/
├── README.md                           # This file
├── database-detailed/
│   ├── database-model/
│   │   ├── cpedsched_1.0.mwb
│   │   ├── cpedsched_1.1.mwb
│   │   ├── cpedsched_1.2.mwb
│   │   ├── cpedsched_1.3.mwb
│   │   ├── cpedsched_1.4.mwb
│   │   └── cpedsched.mwb
│   ├── table-information/
│   │   ├── admin_data.md
│   │   ├── college_data.md
│   │   ├── credentials.md
│   │   ├── departments.md
│   │   ├── equipment.md
│   │   ├── equipment_category.md
│   │   ├── equipment_mvp.md
│   │   ├── equipment_return.md
│   │   ├── key_issuance.md
│   │   ├── key_issuance_mvp.md
│   │   ├── professor_information.md
│   │   ├── profiles_mvp.md
│   │   ├── program_data.md
│   │   ├── reservation.md
│   │   ├── reservation_equipment.md
│   │   ├── reservation_equipment_mvp.md
│   │   ├── reservations_mvp.md
│   │   ├── room_completion.md
│   │   ├── room_data.md
│   │   ├── room_keys.md
│   │   ├── room_keys_mvp.md
│   │   ├── rooms_mvp.md
│   │   ├── section.md
│   │   └── student_data.md
│   └── workflows/
│       ├── completion-workflow.png
│       ├── equipment-workflow.png
│       ├── key-issuance-workflow.png
│       ├── README.md
│       ├── reservation-workflow.png
│       ├── student-data-workflow.png
│       └── whole-erd.png
└── database-simplified/
    ├── database-erd/
    │   └── cpedsched_2.0.png
    │   └── cpedsched_2.1.png
    ├── database-model/
    │   └── cpedsched_2.0.mwb
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

## 📊 Database Model Files

The repository contains two versions of the database design:

### Database Detailed (`database-detailed/`)
The original, comprehensive database schema with full academic structure support:

- **Latest Model**: `cpedsched.mwb` (in `database-model/` folder)
- **Version History**: Models from v1.0 to v1.4 showing evolution of the schema
- **Features**: Full academic hierarchy (colleges, departments, programs, sections), detailed user roles, comprehensive equipment tracking

### Database Simplified (`database-simplified/`)
A streamlined version (v2.0) focusing on core reservation functionality:

- **Model**: `cpedsched_2.0.mwb` 
- **ER Diagram**: `cpedsched_2.1.png` for quick visual reference
- **Features**: Simplified user profiles, streamlined reservation process, essential equipment and key management

**To view the models:**
1. Open MySQL Workbench
2. Go to File → Open Model
3. Select the desired `.mwb` file from either version
4. Navigate to the ER Diagram tab to see the visual representation
5. Use the Physical Schemas panel to explore table structures

## 🔄 Workflow Diagrams

The `database-detailed/workflows/` folder contains focused ERD diagrams that visualize specific business processes. These diagrams make it easier to understand specific modules than the full, complex ERD.

- **whole-erd.png**: The complete database schema
- **student-data-workflow.png**: Student identity and academic relationships
- **reservation-workflow.png**: Core room reservation process
- **equipment-workflow.png**: Equipment linkage to reservations
- **key-issuance-workflow.png**: Key borrowing and return process
- **completion-workflow.png**: Final "check-out" process for closing a reservation

See the `workflows/README.md` for a detailed breakdown of each diagram.

## 📖 Detailed Table Information

Each version has its own set of table documentation:

### Database Detailed
Located in `database-detailed/table-information/`, includes both standard and MVP (Minimum Viable Product) versions of tables:

- Academic structure tables (colleges, departments, programs, sections)
- User management (admin, professor, student data)
- Full reservation and equipment tracking
- Comprehensive key management

### Database Simplified
Located in `database-simplified/table-information/`, focuses on core functionality:

- Unified profiles table
- Streamlined reservations
- Essential equipment and key tracking
- Incident reporting and notifications
- Blocked dates management

Each table documentation file contains:
- **Column specifications** - Names, data types, and descriptions
- **Primary keys** - Unique identifiers
- **Foreign keys** - Relationships with other tables
- **Constraints** - NOT NULL, UNIQUE, and other validations
- **Indexes** - Performance optimization details
- **Relationships** - How the table connects to others
- **Purpose and usage** - What the table is used for in the system

## 🗂️ Database Purpose

This database design supports **CPEDSched** - a comprehensive room and equipment reservation system for educational institutions. The system manages:

- **User Management**: Authentication and role-based access for students, professors, and administrators
- **Resource Management**: Rooms, equipment inventory, and keys
- **Reservation System**: Facility booking and scheduling
- **Equipment Tracking**: Checkout, return, and inventory management
- **Academic Structure**: Colleges, departments, programs, and class sections (detailed version)
- **Key Management**: Distribution and tracking of room keys
- **Incident Reporting**: Track and manage facility-related incidents (simplified version)
- **Notifications**: System alerts and user notifications (simplified version)

## 🔄 Database Relationships

The database implements a normalized relational structure with:

- **One-to-many relationships**: Departments → Programs, Rooms → Reservations
- **Many-to-many relationships**: Reservations ↔ Equipment (via reservation_equipment junction table)
- **Foreign key constraints**: Ensuring referential integrity across all related tables
- **Cascading operations**: Automatic handling of dependent records
- **Lookup tables**: Equipment categories for standardized classification

## 📝 Version Comparison

| Feature | Database Detailed | Database Simplified |
|---------|------------------|---------------------|
| Academic Hierarchy | Full (Colleges → Departments → Programs → Sections) | Not included |
| User Management | Separate tables for admin, professor, student | Unified profiles table |
| Reservation Process | Detailed with completion workflow | Streamlined |
| Equipment Tracking | Comprehensive with returns | Essential functionality |
| Key Management | Full tracking with issuance records | Core functionality |
| Incident Reporting | Not included | Included |
| Notifications | Not included | Included |
| Blocked Dates | Not included | Included |

## 🔧 Tools Required

- **MySQL Workbench** - For viewing and editing the database models
- Any markdown viewer/editor for table documentation
- Image viewer for workflow diagrams

## 🚀 Getting Started

1. **Choose your version**: 
   - Use `database-detailed` for full academic institution features
   - Use `database-simplified` for streamlined core functionality

2. **Review the model**: Open the appropriate `.mwb` file in MySQL Workbench

3. **Understand the workflows**: Check the workflow diagrams in `database-detailed/workflows/`

4. **Read table documentation**: Explore the `table-information/` folders for detailed specifications

## 📝 Maintenance Notes

- All tables follow consistent naming conventions using snake_case
- Foreign key relationships enforce data integrity
- The design supports multi-tenancy through organizational hierarchies (detailed version)
- Audit fields (created_at, updated_at) are included where appropriate
- The MySQL Workbench files serve as the single source of truth for schema changes
- MVP tables in the detailed version represent iterative development phases

---

**Branch:** database-design  
**Database Name:** cpedsched  
**Last Updated:** December 2025
**Maintained by:** Development Team
