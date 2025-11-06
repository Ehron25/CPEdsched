## **program_data Table**

### **Purpose:**
Stores information about academic programs offered in the PUP College of Engineering. This table maintains a registry of degree programs (e.g., Computer Engineering, Electrical Engineering, Mechanical Engineering) and their departmental associations. Programs are used to categorize students and sections within the organizational structure of the college.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **program_id** | INT | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for each academic program |
| **program_name** | VARCHAR(200) | NOT NULL | Full name of the academic program (e.g., "Bachelor of Science in Computer Engineering") |
| **department_id** | INT | FOREIGN KEY, NOT NULL | References the department that offers this program |

### **Key Features:**

**Program Registry:**
- Central repository of all academic programs in the College of Engineering
- Maintains official program names and titles
- Links programs to their parent departments

**Departmental Organization:**
- **department_id**: Foreign key reference to `departments` table
- Each program belongs to exactly one department
- Enables hierarchical organization: Department → Programs → Sections → Students

**Normalized Structure:**
- Eliminates redundant program name storage across student and section tables
- Single source of truth for program information
- Easy updates to program names without affecting related records

### **Relationships:**

**Parent Table:**
- **departments**: Each program belongs to one department
  - `program_data.department_id` → `departments.department_id`
  - Organizes programs under college departmental structure

**Referenced by:**
- **student_data**: Links students to their enrolled program
  - `student_data.program_id` → `program_data.program_id`
  - Identifies what program each student is enrolled in

- **sections**: Links sections to programs
  - `sections.program_id` → `program_data.program_id`
  - Organizes class sections by program

**Data Flow:**
```
departments (Department registry)
    ↓ (department_id FK)
program_data (Academic programs)
    ↓ (program_id FK)
sections (Class sections)
student_data (Student enrollment)
    ↓
reservation (Lab reservations with program context)
```

### **Table Notes:**

1. **Program Assignment:**
   - Every program must belong to exactly one department
   - `department_id` is NOT NULL and must reference valid department
   - Cannot create program without valid department assignment

2. **Program Naming:**
   - Should include degree type (Bachelor of Science, Master of Science, etc.)
   - Follow official PUP nomenclature and accreditation standards
   - Maintain consistency with institutional records
   - Maximum 200 characters for full program title

3. **Departmental Integrity:**
   - Programs offered only by their designated department
   - Cannot delete department that has active programs
   - Foreign key enforces referential integrity

4. **Program Lifecycle:**
   - Programs remain in system even if temporarily not accepting students
   - Historical data maintained for graduated students
   - Consider adding status field for active/inactive programs if needed

5. **Data Consistency:**
   - Program names should be unique within same department
   - Avoid duplicate program entries
   - Updates to program names reflect across all related records via foreign key

### **Sample Data:**

```
program_id: 1
program_name: Bachelor of Science in Computer Engineering
department_id: 1  (→ Computer Engineering Department)

program_id: 2
program_name: Bachelor of Science in Electrical Engineering
department_id: 2  (→ Electrical Engineering Department)

program_id: 3
program_name: Bachelor of Science in Electronics Engineering
department_id: 3  (→ Electronics Engineering Department)

program_id: 4
program_name: Bachelor of Science in Mechanical Engineering
department_id: 4  (→ Mechanical Engineering Department)

program_id: 5
program_name: Bachelor of Science in Civil Engineering
department_id: 5  (→ Civil Engineering Department)

program_id: 6
program_name: Bachelor of Science in Industrial Engineering
department_id: 6  (→ Industrial Engineering Department)

program_id: 7
program_name: Master of Science in Computer Engineering
department_id: 1  (→ Computer Engineering Department)
```

### **Foreign Key Configuration:**

**In MySQL Workbench Foreign Keys tab:**

| Foreign Key Name | Referenced Table | Column | Referenced Column |
|-----------------|------------------|---------|-------------------|
| fk_program_department | departments | department_id | department_id |

**Recommended Constraints:**
- **ON DELETE:** RESTRICT (prevent deletion of departments that have programs)
- **ON UPDATE:** CASCADE (if department_id changes, update all program references)

### **Data Validation Rules:**

1. **Valid Department:**
   - `department_id` must exist in `departments` table
   - Foreign key constraint enforces this automatically
   - Cannot insert program with invalid department_id

2. **Program Name Requirements:**
   - Cannot be empty or NULL
   - Should follow institutional naming standards
   - Include degree level (Bachelor's, Master's, Doctorate)
   - Maximum 200 characters

3. **Uniqueness:**
   - Consider adding unique constraint on (program_name, department_id)
   - Prevents duplicate program entries within same department
   - Each program should have unique program_id (enforced by PK)

4. **Referential Integrity:**
   - Cannot delete program if students are enrolled
   - Cannot delete program if sections reference it
   - Cannot delete parent department if programs exist
   - All enforced through foreign key constraints

5. **Naming Conventions:**
   - Use full official program titles
   - Include "Bachelor of Science in..." or appropriate degree prefix
   - Maintain consistency with PUP official program listings
   - Avoid abbreviations in formal program_name field

### **Design Notes:**

- **Normalized (3NF)**: Department reference eliminates data redundancy
- **Hierarchical**: Supports college organizational structure (Department → Program → Section → Student)
- **Data Integrity**: Foreign key constraints ensure valid department associations
- **Consistency**: Program information managed centrally, updates cascade automatically
- **Performance**: INT foreign key provides fast joins and lookups
- **Scalability**: Easy to add new programs without restructuring database
- **Maintainability**: Single update to program name reflects across entire system
- **Flexibility**: Can accommodate undergraduate, graduate, and certificate programs
- **Simplicity**: Minimal structure focused on essential program identification
- **Integration**: Serves as bridge between departments and students/sections

