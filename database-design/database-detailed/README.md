# Database Detailed - CPEDSched v1.x

This folder contains the comprehensive database design for CPEDSched, featuring full academic hierarchy support, detailed user role management, and extensive reservation workflows. This version is ideal for complete institutional implementations requiring robust academic structure tracking.

## 📁 Folder Structure

```
database-detailed/
├── README.md                           # This file
├── database-model/
│   ├── cpedsched.mwb              # Initial version
│   ├── cpedsched_1.0.mwb              # First iteration
│   ├── cpedsched_1.1.mwb              # Second iteration
│   ├── cpedsched_1.2.mwb              # Third iteration
│   ├── cpedsched_1.3.mwb              # Fourth iteration
│   └── cpedsched_1.4.mwb              # Latest stable version
├── table-information/
│   ├── admin_data.md
│   ├── college_data.md
│   ├── credentials.md
│   ├── departments.md
│   ├── equipment.md
│   ├── equipment_category.md
│   ├── equipment_mvp.md
│   ├── equipment_return.md
│   ├── key_issuance.md
│   ├── key_issuance_mvp.md
│   ├── professor_information.md
│   ├── profiles_mvp.md
│   ├── program_data.md
│   ├── reservation.md
│   ├── reservation_equipment.md
│   ├── reservation_equipment_mvp.md
│   ├── reservations_mvp.md
│   ├── room_completion.md
│   ├── room_data.md
│   ├── room_keys.md
│   ├── room_keys_mvp.md
│   ├── rooms_mvp.md
│   ├── section.md
│   └── student_data.md
└── workflows/
    ├── completion-workflow.png
    ├── equipment-workflow.png
    ├── key-issuance-workflow.png
    ├── README.md
    ├── reservation-workflow.png
    ├── student-data-workflow.png
    └── whole-erd.png
```

## 🎯 Design Philosophy

The detailed database design emphasizes:

- **Complete Academic Structure**: Full hierarchy from colleges down to individual sections
- **Role-Based Architecture**: Separate tables for admins, professors, and students
- **Comprehensive Workflows**: Detailed reservation lifecycle with completion tracking
- **Equipment Management**: Full tracking including returns and maintenance
- **Scalability**: Designed for large institutions with complex organizational structures
- **Version History**: Multiple model versions documenting evolution and iterations
- **MVP Variants**: Includes streamlined MVP versions of certain tables for phased implementation

## 📊 Database Model

**Latest Model File**: `cpedsched_1.4.mwb`

**To view the model:**
1. Open MySQL Workbench
2. Go to File → Open Model
3. Select `database-model/cpedsched_1.4.mwb` (latest) or any version
4. Navigate to the ER Diagram tab
5. Explore table structures in the Physical Schemas panel

### Version History

The `database-model/` folder contains the evolution of the database:

- **cpedsched.mwb** - Original database design
- **v1.0 (cpedsched_1.0.mwb)** - First refinements and additions
- **v1.1 (cpedsched_1.1.mwb)** - Enhanced relationships
- **v1.2 (cpedsched_1.2.mwb)** - Workflow improvements
- **v1.3 (cpedsched_1.3.mwb)** - Additional features
- **v1.4 (cpedsched_1.4.mwb)** - Latest production-ready version

Review sequential versions to understand design decisions and schema evolution.

## 🔄 Workflow Diagrams

The `workflows/` folder contains visual representations of key business processes. These focused diagrams help developers understand specific modules without getting overwhelmed by the complete ERD.

### Available Workflows

1. **whole-erd.png** - Complete database schema overview
   - All tables and relationships
   - Comprehensive system view
   - Reference for understanding the full scope

2. **student-data-workflow.png** - Academic identity management
   - Student registration and profiles
   - Academic program enrollment
   - Section assignments
   - Credential management

3. **reservation-workflow.png** - Room reservation process
   - User authentication
   - Room selection and booking
   - Approval workflows
   - Reservation status tracking

4. **equipment-workflow.png** - Equipment management
   - Equipment catalog and categories
   - Reservation-equipment linkage
   - Checkout and assignment
   - Equipment return process

5. **key-issuance-workflow.png** - Key management system
   - Key inventory tracking
   - Issuance to users
   - Return processing
   - Lost key handling

6. **completion-workflow.png** - Reservation finalization
   - Check-out process
   - Room inspection
   - Equipment return verification
   - Completion status updates

See `workflows/README.md` for detailed explanations of each diagram.

## 📋 Database Tables

### Academic Structure

#### College & Department Hierarchy

**college_data** → **departments** → **program_data** → **sections**

- **college_data**: Top-level organizational units (e.g., College of Engineering)
- **departments**: Departments within colleges (e.g., Computer Science Department)
- **program_data**: Academic programs offered (e.g., BS Computer Science)
- **sections**: Class sections for specific courses (e.g., CS101-A)

This hierarchy enables:
- Multi-college support
- Department-level resource allocation
- Program-specific tracking
- Section-based reservations

### User Management

#### Separate Role Tables

**credentials** ← **admin_data** / **professor_information** / **student_data**

- **credentials**: Authentication information for all users
- **admin_data**: Administrator profiles and permissions
- **professor_information**: Faculty data and department affiliations
- **student_data**: Student profiles with program and section links

**MVP Alternative**: `profiles_mvp.md` documents a unified user table approach

### Facility Management

#### Rooms

- **room_data**: Physical facilities catalog
  - Room identification and properties
  - Capacity and amenities
  - Building and location
  - Department ownership

- **room_keys**: Physical key inventory
  - Key identification
  - Room associations
  - Status tracking

**MVP Alternative**: `rooms_mvp.md` and `room_keys_mvp.md` for simplified versions

### Reservation System

#### Core Reservation

- **reservation**: Main reservation records
  - User and room associations
  - Time slot management
  - Purpose and status
  - Approval workflow

- **room_completion**: Finalization records
  - Check-out process
  - Inspection results
  - Damage reports
  - Final status

**MVP Alternative**: `reservations_mvp.md` for streamlined approach

### Equipment Management

#### Equipment Catalog

- **equipment_category**: Equipment classification
  - Category definitions
  - Hierarchical organization
  
- **equipment**: Equipment inventory
  - Item catalog
  - Category assignment
  - Availability status
  - Condition tracking

- **reservation_equipment**: Equipment assignments
  - Links reservations to equipment
  - Quantity tracking
  - Status per reservation

- **equipment_return**: Return processing
  - Return timestamps
  - Condition verification
  - Damage documentation

**MVP Alternative**: `equipment_mvp.md` and `reservation_equipment_mvp.md` for basic functionality

### Key Management

- **key_issuance**: Key borrowing records
  - Who borrowed which keys
  - Issue timestamps
  - Return tracking
  - Linked to reservations

**MVP Alternative**: `key_issuance_mvp.md` for simplified tracking

## 🔄 Key Relationships

### Academic Hierarchy
```
college_data (1) ──→ (∞) departments
departments (1) ──→ (∞) program_data
program_data (1) ──→ (∞) sections
departments (1) ──→ (∞) professor_information
```

### User Authentication
```
credentials (1) ──→ (1) admin_data
credentials (1) ──→ (1) professor_information
credentials (1) ──→ (1) student_data
```

### Reservation Flow
```
student_data (1) ──→ (∞) reservation
professor_information (1) ──→ (∞) reservation
room_data (1) ──→ (∞) reservation
reservation (1) ──→ (1) room_completion
reservation (∞) ←──→ (∞) equipment [via reservation_equipment]
```

### Equipment Tracking
```
equipment_category (1) ──→ (∞) equipment
equipment (1) ──→ (∞) reservation_equipment
reservation_equipment (1) ──→ (1) equipment_return
```

### Key Management
```
room_data (1) ──→ (∞) room_keys
room_keys (1) ──→ (∞) key_issuance
student_data/professor_information (1) ──→ (∞) key_issuance
```

## ✨ Key Features

### Compared to Database Simplified

| Feature | Detailed | Simplified |
|---------|----------|------------|
| Academic Structure | ✅ Full hierarchy (4 levels) | ❌ Not included |
| User Management | ✅ Separate role tables | ✅ Single profiles table |
| Reservation System | ✅ With completion workflow | ✅ Streamlined |
| Equipment Tracking | ✅ Full with returns table | ✅ Essential features |
| Key Management | ✅ Detailed tracking | ✅ Core functionality |
| Equipment Categories | ✅ Hierarchical | ✅ Basic |
| Room Completion | ✅ Dedicated table | ❌ Not included |
| Equipment Returns | ✅ Dedicated table | ❌ Not included |
| Incident Reporting | ❌ Not included | ✅ Included |
| Notifications | ❌ Not included | ✅ Included |
| Blocked Dates | ❌ Not included | ✅ Included |
| MVP Alternatives | ✅ Documented | N/A |
| Table Count | 17+ tables | 10 tables |
| Workflow Diagrams | ✅ 6 diagrams | ❌ Not included |

## 🚀 Advantages

1. **Enterprise Ready**: Supports complex organizational structures
2. **Role Separation**: Clear boundaries between user types
3. **Complete Lifecycle**: Tracks reservations from booking to completion
4. **Audit Trail**: Comprehensive tracking of all operations
5. **Scalability**: Designed for large institutions with multiple colleges
6. **Flexibility**: MVP variants allow phased implementation
7. **Documentation**: Extensive workflow diagrams and table documentation
8. **Version Control**: Historical versions document design decisions

## 📝 Usage Recommendations

**Best suited for:**
- Large educational institutions
- Multi-college universities
- Organizations requiring academic hierarchy tracking
- Systems needing detailed audit trails
- Enterprise deployments with complex user roles
- Projects requiring comprehensive equipment lifecycle management
- Implementations with strict compliance requirements

**Consider the simplified version if:**
- You need rapid MVP development
- Academic structure is not required
- Simpler user management is sufficient
- Operational features (incidents, notifications) are priorities
- Smaller scale deployment

## 🔧 Getting Started

### For New Implementations

1. **Review Workflows**: Start with `workflows/whole-erd.png` for overview
2. **Choose Approach**: 
   - Full implementation: Use all standard tables
   - Phased rollout: Start with MVP variants
3. **Explore Model**: Open `database-model/cpedsched_1.4.mwb` in MySQL Workbench
4. **Study Relationships**: Review workflow diagrams for your priority modules
5. **Read Documentation**: Check `table-information/` for detailed specs

### For Understanding Evolution

1. Open sequential versions (cpedsched.mwb → v1.4) to see design progression
2. Compare MVP variants with full tables to understand trade-offs
3. Review `workflows/README.md` for process flow documentation

## 📖 Table Documentation

The `table-information/` folder contains comprehensive documentation for each table:

### Standard Tables
Complete feature-rich implementations for production use

### MVP Tables (suffix: _mvp)
Streamlined versions for rapid development:
- `profiles_mvp.md` - Unified user management
- `equipment_mvp.md` - Basic equipment tracking
- `reservation_equipment_mvp.md` - Simplified equipment links
- `reservations_mvp.md` - Core reservation features
- `room_keys_mvp.md` - Essential key tracking
- `rooms_mvp.md` - Basic room management
- `key_issuance_mvp.md` - Simple key borrowing

Each documentation file includes:
- Column specifications with data types
- Primary and foreign keys
- Constraints and validations
- Indexes for performance
- Relationship diagrams
- Business logic and usage examples

## 🛠️ Technical Details

- **Naming Convention**: snake_case for consistency
- **Foreign Keys**: All relationships strictly enforced
- **Referential Integrity**: Cascading deletes where appropriate
- **Timestamps**: created_at, updated_at for audit trails
- **Indexes**: Strategic indexing on foreign keys and search columns
- **Normalization**: 3rd Normal Form (3NF) for data integrity
- **Data Types**: Optimized for MySQL/MariaDB

## 🔐 Security Considerations

- **Password Storage**: Hash all passwords (bcrypt/argon2) in credentials table
- **Role-Based Access**: Enforce permissions based on user type tables
- **Data Isolation**: College/department-level data segregation
- **Audit Logging**: Timestamps track all data modifications
- **Foreign Key Protection**: Prevents orphaned records
- **Input Validation**: NOT NULL and UNIQUE constraints prevent invalid data

## 📈 Migration Path

### From Simplified to Detailed

If starting with the simplified version and migrating:

1. **Data Migration**:
   - Split `profiles` → `admin_data`, `professor_information`, `student_data`
   - Add academic hierarchy tables
   - Link users to departments/programs/sections

2. **Feature Addition**:
   - Add `room_completion` workflow
   - Implement `equipment_return` tracking
   - Add `equipment_category` hierarchy

3. **Workflow Enhancement**:
   - Implement approval processes
   - Add completion verification
   - Enable department-level resource management

### Phased Implementation with MVP

1. **Phase 1**: Deploy MVP versions for quick launch
2. **Phase 2**: Migrate to full tables as needs grow
3. **Phase 3**: Add academic hierarchy progressively
4. **Phase 4**: Implement complete workflows

## 🔄 Future Enhancements

Potential additions maintaining the detailed approach:

- Course schedule integration
- Faculty office hours management
- Recurring reservation patterns
- Advanced reporting and analytics
- Equipment maintenance scheduling
- Automated approval workflows
- Integration with student information systems
- Resource utilization analytics
- Budget and cost tracking per department

## 📚 Additional Resources

- **Workflow Documentation**: See `workflows/README.md`
- **Simplified Version**: Compare with `../database-simplified/README.md`
- **Version History**: Review model files from cpedsched.mwb through v1.4
- **MVP Documentation**: Check `*_mvp.md` files for phased implementation options

---

**Version**: 1.x (Latest: v1.4 - cpedsched_1.4.mwb)  
**Database Name**: cpedsched  
**Last Updated**: December 2025 
**Maintained by**: Development Team  
**For simplified version**: See `../database-simplified/README.md`
