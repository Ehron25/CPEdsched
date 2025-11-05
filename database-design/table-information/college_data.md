## **college_data Table**

### **Purpose:**
Stores information about the different colleges within the university. This table serves as the top-level organizational unit in the academic hierarchy (College → Department → Program).

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **college_id** | INT | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for each college |
| **college_name** | VARCHAR(200) | NOT NULL | Full official name of the college |

### **Key Features:**

**Simple Reference Table:**
- Acts as a lookup/master table for college information
- Minimal structure for easy maintenance
- Foundation for organizational hierarchy

**Data Integrity:**
- Each college has a unique ID
- College names are required (cannot be NULL)
- Supports up to 200 characters for long college names

### **Business Rules:**

1. **Unique Colleges:** Each college should have a distinct entry
2. **Name Format:** Use full official college names (e.g., "College of Engineering and Technology")
3. **Cascade Impact:** Deleting a college affects all related departments and programs
4. **Active Reference:** Used throughout the system for organizational filtering

### **Relationships:**

**Parent to:**
- **departments table:** One college can have multiple departments
  - `departments.college_id` → `college_data.college_id`

**Hierarchy Flow:**
```
college_data (College)
    ↓
departments (Department)
    ↓
program_data (Program)
    ↓
student_data (Students)
```

### **Sample Data:**

```
college_id: 1
college_name: College of Engineering

college_id: 2
college_name: College of Arts and Letters

college_id: 3
college_name: College of Science

college_id: 4
college_name: College of Computer and Information Science

college_id: 5
college_name: Institute of Technology
```

### **Usage Examples:**

**Finding all departments in a college:**
```sql
SELECT d.department_name 
FROM departments d
WHERE d.college_id = 1;
```

**Finding all programs under a college:**
```sql
SELECT p.program_name 
FROM program_data p
JOIN departments d ON p.department_id = d.department_id
WHERE d.college_id = 1;
```

**Counting students per college:**
```sql
SELECT c.college_name, COUNT(s.student_id) as total_students
FROM college_data c
JOIN departments d ON c.college_id = d.college_id
JOIN program_data p ON d.department_id = p.department_id
JOIN student_data s ON p.program_id = s.program_id
GROUP BY c.college_id;
```

### **Design Notes:**

- **Simple by design:** Only essential information stored at college level
- **Extensible:** Can add more fields later (e.g., college_dean)
- **Performance:** Small table size ensures fast lookups
- **Maintenance:** Easy to add/modify colleges without complex dependencies
