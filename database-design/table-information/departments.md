## **departments Table**

### **Purpose:**
Stores information about academic departments within each college. This table serves as the middle level in the organizational hierarchy (College → Department → Program), organizing programs by their respective departments.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **department_id** | INT | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for each department |
| **department_name** | VARCHAR(200) | UNIQUE, NOT NULL | Full official name of the department (must be unique across all colleges) |
| **college_id** | INT | FOREIGN KEY, NOT NULL | ID of the college this department belongs to (references college_data.college_id) |

### **Key Features:**

**Organizational Structure:**
- Links colleges to their departments
- One college can have multiple departments (one-to-many relationship)
- Groups related academic programs
- Enables hierarchical data organization

**Data Integrity:**
- Each department must belong to a college
- Department names are globally unique across the entire system
- Department names support up to 200 characters
- Foreign key ensures valid college references
- Multiple departments can reference the same college

### **Business Rules:**

1. **College Association:** Every department must be assigned to exactly one college
2. **Unique Department Names:** Department names must be unique across ALL colleges (no duplicate department names anywhere in the system)
3. **One-to-Many Relationship:** One college can have multiple departments
4. **Name Format:** Use full official department names (e.g., "Department of Computer Engineering")
5. **Cascade Impact:** Deleting a department affects all related programs
6. **Active Reference:** Used for filtering and organizing programs

### **Relationships:**

**Parent:**
- **college_data:** Each department belongs to one college (Many-to-One)
  - `departments.college_id` → `college_data.college_id`
  - Multiple departments can have the same `college_id`

**Child:**
- **program_data:** One department can have multiple programs (One-to-Many)
  - `program_data.department_id` → `departments.department_id`

**Hierarchy Flow:**
```
college_data (e.g., College of Engineering)
    ↓ One-to-Many
departments (e.g., Multiple departments)
    ↓ One-to-Many
program_data (e.g., Multiple programs per department)
    ↓ One-to-Many
student_data (Students enrolled in programs)
```

### **Sample Data:**

**College of Engineering and Technology (college_id = 1):**
```
department_id: 1
department_name: Department of Computer Engineering
college_id: 1

department_id: 2
department_name: Department of Electrical Engineering
college_id: 1

department_id: 3
department_name: Department of Mechanical Engineering
college_id: 1

department_id: 4
department_name: Department of Civil Engineering
college_id: 1
```

**College of Computer Studies (college_id = 5):**
```
department_id: 5
department_name: Department of Information Technology
college_id: 5

department_id: 6
department_name: Department of Computer Science
college_id: 5
```

**College of Business Administration (college_id = 2):**
```
department_id: 7
department_name: Department of Accounting
college_id: 2

department_id: 8
department_name: Department of Marketing
college_id: 2

department_id: 9
department_name: Department of Management
college_id: 2
```

### **Constraint Details:**

**PRIMARY KEY (department_id):**
- Auto-increments for each new department
- Uniquely identifies each department record

**UNIQUE (department_name):**
- Prevents duplicate department names system-wide
- Example: Only ONE "Department of Computer Engineering" can exist
- Ensures clarity in reporting and data management

**FOREIGN KEY (college_id):**
- Must reference an existing college in `college_data`
- NOT unique - allows multiple departments per college
- Example: `college_id = 1` can appear in multiple rows

**This table correctly supports the one-to-many relationship between colleges and departments. Ready for program_data documentation next?**
