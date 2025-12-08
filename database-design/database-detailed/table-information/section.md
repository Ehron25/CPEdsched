## **sections Table**

### **Purpose:**
Stores information about class sections in the PUP College of Engineering Computer Engineering Laboratory system. This table maintains a registry of all academic sections organized by year level and block designation within each program. Sections group students together for administrative and organizational purposes, enabling efficient management of class rosters, reservations, and academic structure. Each section is linked to a specific program and represents a cohort of students.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **section_id** | INT | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for each section in the system |
| **year_level** | INT | NOT NULL | Academic year level of the section (1, 2, 3, 4 for undergraduate) |
| **block** | VARCHAR(20) | NOT NULL | Block designation: numeric only (1, 2, 3, etc.) or numeric with 'P' suffix (1P, 2P, 3P, etc.) for accelerated/bridging programs |
| **program_id** | INT | FOREIGN KEY, NOT NULL | References the academic program this section belongs to |
| **created_at** | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when the section record was created |

### **Key Features:**

**Section Organization:**
- Groups students by year level and block within programs
- Enables cohort-based management and scheduling
- Maintains academic structure hierarchy: Program → Section → Students
- Differentiates between regular and accelerated/bridging program sections

**Year Level Tracking:**
- **year_level**: Indicates the academic year (1st year, 2nd year, 3rd year, 4th year)
- Supports undergraduate program structure
- Can accommodate graduate levels if needed

**Block Designation:**
- **block**: Identifies specific section within a year level
- **Standardized formats**: 
  - **Numeric only**: "1", "2", "3", "4", "5", etc. (Regular sections)
  - **Numeric with P suffix**: "1P", "2P", "3P", "4P", "5P", etc. (Accelerated/Bridging sections)
- **The "P" suffix indicates accelerated programs** for students bridging from diploma to bachelor's degree
- These students typically have advanced standing from their diploma coursework
- No alphabetic blocks (A, B, C) are allowed
- Maximum 20 characters for technical flexibility, but practical limit is 1-3 characters

**Program Association:**
- **program_id**: Foreign key reference to `program_data` table
- Each section belongs to exactly one program
- Organizes sections by degree program (e.g., BSCpE, BSEE)

**Creation Tracking:**
- **created_at**: Records when section was established in system
- Useful for academic year tracking and historical records
- Automatically set on section creation

### **Relationships:**

**Parent Table:**
- **program_data**: Each section belongs to one academic program
  - `sections.program_id` → `program_data.program_id`
  - Links sections to their degree program

**Referenced by:**
- **student_data**: Links students to their section
  - `student_data.section_id` → `sections.section_id`
  - Groups students by section for roster management

- **reservation**: May link reservations to sections
  - `reservation.section_id` → `sections.section_id` (if applicable)
  - Tracks class-based reservations

**Data Flow:**
```
program_data (Academic programs)
    ↓ (program_id FK)
sections (Class sections/cohorts)
    ↓ (section_id FK)
student_data (Student enrollment)
    ↓
reservation (Lab reservations with section context)
```

### **Table Notes:**

1. **Section Identification:**
   - Each section uniquely identified by combination of program_id, year_level, and block
   - Example: BSCpE 3rd Year Block 1 (regular), BSCpE 2nd Year Block 1P (bridging), BSEE 2nd Year Block 2
   - Consider unique constraint on (program_id, year_level, block)

2. **Year Level Requirements:**
   - Must be positive integer (1, 2, 3, 4 for typical undergraduate)
   - Represents academic standing in the program
   - Graduate programs may use different year level schemes (5, 6 for MS)

3. **Block Designation Standards:**
   - **Must be numeric only OR numeric with 'P' suffix**
   - **Valid examples**: "1", "2", "3", "4", "5", "1P", "2P", "3P", "4P", "5P"
   - **Invalid examples**: "A", "B", "C", "Block1", "1A", "P1", "p1" (lowercase)
   - Cannot be empty or NULL
   - Case-sensitive: "P" must be uppercase
   - Should follow institutional naming convention
   - Maximum 20 characters allows flexibility (practical limit: 1-3 chars)

4. **"P" Suffix Meaning:**
   - Indicates **accelerated/bridging program sections**
   - For students transitioning from diploma programs to bachelor's degree
   - These students may have:
     - Advanced standing from diploma coursework
     - Credit transfers from previous diploma studies
     - Different curriculum requirements
     - Accelerated degree completion timeline
   - Enables separate section management for bridging students

5. **Program Association:**
   - Every section must belong to a valid program
   - Cannot create section without program assignment
   - Foreign key enforces referential integrity

6. **Section Lifecycle:**
   - Sections typically created at start of academic year
   - created_at tracks when section was established
   - Historical sections maintained for graduated students
   - Consider adding active/inactive status if needed

7. **Naming Conventions:**
   - All blocks use numeric format for consistency
   - "P" suffix distinguishes bridging/accelerated program students
   - Year level should match program curriculum structure
   - Section combinations should be unique per program

### **Sample Data:**

```
section_id: 1
year_level: 1
block: 1
program_id: 1  (→ Bachelor of Science in Computer Engineering)
created_at: 2024-08-15 10:00:00
Display: BSCpE 1-1 (Regular first-year section)

section_id: 2
year_level: 1
block: 5
program_id: 1  (→ Bachelor of Science in Computer Engineering)
created_at: 2024-08-15 10:00:00
Display: BSCpE 1-5 (Regular first-year section)

section_id: 3
year_level: 2
block: 4
program_id: 1  (→ Bachelor of Science in Computer Engineering)
created_at: 2023-08-15 10:00:00
Display: BSCpE 2-4 (Regular second-year section)

section_id: 4
year_level: 3
block: 3
program_id: 1  (→ Bachelor of Science in Computer Engineering)
created_at: 2022-08-15 10:00:00
Display: BSCpE 3-3 (Regular third-year section)

section_id: 5
year_level: 4
block: 1
program_id: 1  (→ Bachelor of Science in Computer Engineering)
created_at: 2021-08-15 10:00:00
Display: BSCpE 4-1 (Regular fourth-year section)

section_id: 6
year_level: 1
block: 2P
program_id: 2  (→ Bachelor of Science in Electrical Engineering)
created_at: 2024-08-15 10:00:00
Display: BSEE 1-2P (Bridging program - diploma to bachelor)

section_id: 7
year_level: 2
block: 1P
program_id: 1  (→ Bachelor of Science in Computer Engineering)
created_at: 2023-08-15 10:00:00
Display: BSCpE 2-1P (Bridging program - diploma to bachelor)

section_id: 8
year_level: 3
block: 2P
program_id: 1  (→ Bachelor of Science in Computer Engineering)
created_at: 2022-08-15 10:00:00
Display: BSCpE 3-2P (Bridging program - diploma to bachelor)
```

### **Foreign Key Configuration:**

**In MySQL Workbench Foreign Keys tab:**

| Foreign Key Name | Referenced Table | Column | Referenced Column |
|-----------------|------------------|---------|-------------------|
| fk_section_program | program_data | program_id | program_id |

### **Data Validation Rules:**

1. **Year Level Validation:**
   - Must be positive integer (> 0)
   - Cannot be NULL
   - Typical values: 1, 2, 3, 4 for undergraduate (4-year programs)
   - Graduate programs: 5, 6 for MS programs (if applicable)
   - Should match program curriculum structure

2. **Block Validation:**
   - Cannot be empty or NULL
   - Maximum 20 characters (practical limit: 1-3 characters)
   - **Must follow one of these patterns:**
     - **Pure numeric**: "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", etc. (Regular sections)
     - **Numeric with P suffix**: "1P", "2P", "3P", "4P", "5P", etc. (Bridging/accelerated sections)

3. **Program Association:**
   - `program_id` must exist in program_data table
   - Foreign key constraint enforces this automatically
   - Cannot create section for non-existent program
   - All sections must belong to valid program

4. **Uniqueness:**
   - Consider unique constraint on (program_id, year_level, block)
   - Prevents duplicate sections within same program and year
   - Example: Cannot have two "BSCpE 3-1" sections or two "BSCpE 2-1P" sections
   - Each section_id is globally unique (enforced by PRIMARY KEY)

5. **Creation Timestamp:**
   - created_at automatically set on record insertion
   - Cannot be NULL
   - Reflects when section was added to system
   - Typically aligns with academic year start dates

6. **Logical Consistency:**
   - Year level should not exceed program duration
   - Block designations should follow institutional standards
   - Sections should exist for active academic years
   - P-suffix sections should contain students with diploma backgrounds

### **Design Notes:**

- **Hierarchical Structure**: Organizes students within program framework
- **Normalized**: Program reference eliminates redundancy
- **Bridging Program Support**: P-suffix enables tracking of diploma-to-bachelor students
- **Simple Design**: Focused on essential section identification
- **Data Integrity**: Foreign key ensures valid program associations
- **Scalability**: Can accommodate multiple programs and year levels
- **Historical Tracking**: created_at maintains temporal records
- **Administrative Tool**: Enables cohort-based management and reporting
- **Integration Ready**: Links students, programs, and potentially reservations
- **Lightweight**: Minimal fields focus on core identification needs
- **Extensible**: Easy to add fields like capacity, advisor, or room assignment
- **Student Pathway Tracking**: Distinguishes regular and bridging students for proper academic planning

### **Common Section Naming Patterns:**

**Regular Sections (Numeric only):**
- BSCpE 1-1 (Computer Engineering, 1st Year, Block 1 - Regular students)
- BSCpE 2-3 (Computer Engineering, 2nd Year, Block 3 - Regular students)
- BSEE 3-2 (Electrical Engineering, 3rd Year, Block 2 - Regular students)
- BSCpE 4-1 (Computer Engineering, 4th Year, Block 1 - Regular students)

**Bridging/Accelerated Sections (Numeric with P):**
- BSCpE 1-1P (Computer Engineering, 1st Year, Block 1P - Diploma to Bachelor bridging students)
- BSCpE 2-1P (Computer Engineering, 2nd Year, Block 1P - Diploma to Bachelor bridging students)
- BSEE 3-2P (Electrical Engineering, 3rd Year, Block 2P - Diploma to Bachelor bridging students)

**Database Representation:**
- program_id → Links to "Bachelor of Science in Computer Engineering" or "Bachelor of Science in Electrical Engineering"
- year_level → 1, 2, 3, 4
- block → "1", "2", "3" (regular) or "1P", "2P", "3P" (bridging)

### **Bridging Program Context:**

Students in P-suffix sections typically have:
- **Prior Diploma Qualification**: Completed diploma program in related field
- **Advanced Standing**: Some coursework credited toward bachelor's degree
- **Accelerated Timeline**: May complete bachelor's degree faster than regular students
- **Different Curriculum**: Follow modified curriculum accounting for prior learning
- **Separate Cohort**: Grouped together for administrative and pedagogical reasons

---
