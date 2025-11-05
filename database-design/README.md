# Database Design Documentation

This folder contains the complete database design documentation for the system, including the MySQL Workbench model, physical schema, ER diagram, and detailed information about each database table.

## 📁 Folder Structure

```
database-design/
├── README.md                    # This file
├── cpedsched.mwb                # MySQL Workbench model file
└── table-information/
    ├── admin_data.md            # Administrator table documentation
    ├── college_data.md          # College table documentation
    ├── credentials.md           # Credentials table documentation
    ├── departments.md           # Departments table documentation
    ├── equipment.md             # Equipment table documentation
    ├── equipment_category.md    # Equipment category table documentation
    ├── equipment_return.md      # Equipment return table documentation
    ├── key_issuance.md          # Key issuance table documentation
    ├── professor_information.md # Professor table documentation
    ├── program_data.md          # Program table documentation
    ├── reservation.md           # Reservation table documentation
    ├── reservation_equipment.md # Reservation equipment table documentation
    ├── room_completion.md       # Room completion table documentation
    ├── room_data.md             # Room data table documentation
    ├── room_keys.md             # Room keys table documentation
    ├── sections.md              # Sections table documentation
    └── student_data.md          # Student table documentation
```

## 📊 Database Model File

The `cpedsched.mwb` file is a MySQL Workbench model that contains:

- **Physical Schema** - The complete database schema with all tables, columns, and data types
- **ER Diagram** - Visual representation showing table relationships, primary keys, foreign keys, and cardinality
- **Indexes and Constraints** - All database constraints, indexes, and relationships defined

**To view the model:**
1. Open MySQL Workbench
2. Go to File → Open Model
3. Select `cpedsched.mwb`
4. Navigate to the ER Diagram tab to see the visual representation
5. Use the Physical Schemas panel to explore table structures

## 📖 Detailed Table Information

Each table has its own dedicated markdown file in the `table-information/` folder containing:

- **Column specifications** - Names, data types, and descriptions
- **Primary keys** - Unique identifiers for each table
- **Foreign keys** - Relationships with other tables
- **Constraints** - NOT NULL, UNIQUE, and other validations
- **Indexes** - Performance optimization details
- **Relationships** - How the table connects to other tables
- **Purpose and usage** - What the table is used for in the system

**To learn about a specific table:**
Navigate to `table-information/[table_name].md`

Example: For credentials table information, see `table-information/credentials.md`

## 🗂️ Database Purpose

This database design supports **CPEDSched** - a comprehensive room and equipment reservation system for educational institutions. The system manages:

- **User Management**: Authentication and role-based access for students, professors, and administrators
- **Resource Management**: Rooms, equipment inventory, and keys
- **Reservation System**: Facility booking and scheduling
- **Equipment Tracking**: Checkout, return, and inventory management
- **Academic Structure**: Colleges, departments, programs, and class sections
- **Key Management**: Distribution and tracking of room keys

## 🔄 Database Relationships

The database implements a normalized relational structure with:

- **One-to-many relationships**: Departments → Programs, Colleges → Departments
- **Many-to-many relationships**: Reservations ↔ Equipment (via reservation_equipment junction table)
- **Foreign key constraints**: Ensuring referential integrity across all related tables
- **Cascading operations**: Automatic handling of dependent records
- **Lookup tables**: Equipment categories for standardized classification

## 📝 Maintenance Notes

- All tables follow consistent naming conventions using snake_case
- Foreign key relationships enforce data integrity
- The design supports multi-tenancy through college/department hierarchies
- Audit fields (created_at, updated_at) are included where appropriate
- The MySQL Workbench file serves as the single source of truth for schema changes

## 🔧 Tools Required

- **MySQL Workbench** - For viewing and editing the database model
- Any markdown viewer/editor for table documentation

---

**Branch:** database-design  
**Database Name:** cpedsched  
**Last Updated:** November 2025  
**Maintained by:** Development Team
