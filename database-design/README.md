Here is the updated `README.md` content.

I've updated the **Folder Structure** to include the new `workflows` directory, added a new section explaining what the **Workflow Diagrams** are for, and corrected the path and version of the **MySQL Workbench file** to point to the latest version in the parent directory.

```markdown
# Database Design Documentation

This folder contains the complete database design documentation for the `cpedsched` system, including the MySQL Workbench model, physical schema, ER diagrams, and detailed information about each database table.

## 📁 Folder Structure

```

database-design/
├── README.md                  \# This file
├── table-information/
│   ├── admin\_data.md
│   ├── college\_data.md
│   ├── credentials.md
│   ├── departments.md
│   ├── equipment.md
│   ├── equipment\_category.md
│   ├── equipment\_return.md
│   ├── key\_issuance.md
│   ├── professor\_information.md
│   ├── program\_data.md
│   ├── reservation.md
│   ├── reservation\_equipment.md
│   ├── room\_completion.md
│   ├── room\_data.md
│   ├── room\_keys.md
│   ├── sections.md
│   └── student\_data.md
└── workflows/
    ├── Completion-workflow.png
    ├── equipment-workflow.png
    ├── key-issuance-workflow.png
    ├── README.md
    ├── reservation-workflow.png
    ├── student-data-workflow.png
    └── whole-erd.png

```

## 📊 Database Model File

The `../cpedsched_1.3.mwb` file (located in the parent directory) is a MySQL Workbench model that contains:

- **Physical Schema** - The complete database schema with all tables, columns, and data types
- **ER Diagram** - Visual representation showing table relationships, primary keys, foreign keys, and cardinality
- **Indexes and Constraints** - All database constraints, indexes, and relationships defined

**To view the model:**
1. Open MySQL Workbench
2. Go to File → Open Model
3. Select `../cpedsched_1.3.mwb` (or the latest `.mwb` file in the root)
4. Navigate to the ER Diagram tab to see the visual representation
5. Use the Physical Schemas panel to explore table structures

## 🔄 Workflow Diagrams

The `workflows/` folder contains several focused ERD diagrams that visualize specific business processes. These diagrams are intended to be easier to understand for a specific module than the full, complex ERD.

- **whole-erd.png**: The complete database schema.
- **student-data-workflow.png**: Shows student identity and academic relationships.
- **reservation-workflow.png**: Shows the core room reservation process.
- **equipment-workflow.png**: Details how equipment is linked to reservations.
- **key-issuance-workflow.png**: Illustrates the key borrowing and return process.
- **Completion-workflow.png**: Shows the final "check-out" process for closing a reservation.

See the `workflows/README.md` for a detailed breakdown of each diagram.

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
```
