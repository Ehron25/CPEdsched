Here is the documentation for the `student_data` table based on your provided images and the established format.

-----

## **student\_data Table**

### **Purpose:**

Serves as the master "user" table for all students in the `cpedsched` system. It stores essential personal information, unique identifiers (student number, webmail), secure login credentials, academic context (program), and account security/status details.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| **student\_id** | INT | PRIMARY KEY, AUTO\_INCREMENT, NOT NULL | Unique identifier for the student record |
| **student\_fname** | VARCHAR(100) | NOT NULL | Student's first name |
| **student\_mname** | VARCHAR(100) | NOT NULL | Student's middle name |
| **student\_lname** | VARCHAR(100) | NOT NULL | Student's last name |
| **student\_number** | VARCHAR(50) | UNIQUE, NOT NULL | Student's official, human-readable ID number (e.g., "2021-00123") |
| **s\_position** | VARCHAR(100) | NOT NULL | The student's position or role (e.g., "Student", "Group Leader") |
| **webmail** | VARCHAR(150) | UNIQUE, NOT NULL | Student's official email address, used as the login username |
| **contactnum** | VARCHAR(20) | NOT NULL | Student's contact phone number |
| **password** | VARCHAR(255) | NOT NULL | Student's securely hashed password |
| **credential\_id** | INT | FOREIGN KEY, NOT NULL | ID linking to the student's submitted credentials (e.g., COR (Certificate of Registration), in `credentials` table) |
| **program\_id** | INT | FOREIGN KEY, NOT NULL | ID linking to the student's academic program (e.g., "BS-CPE", in `program_data` table) |
| **account\_status** | ENUM('active', 'inactive', 'pending') | NOT NULL, DEFAULT 'pending' | Current status of the student's account (e.g., 'pending', 'active', 'inactive') |
| **created\_at** | DATETIME | NOT NULL, DEFAULT CURRENT\_TIMESTAMP | Timestamp of when the student account was created |
| **update\_at** | DATETIME | NOT NULL, DEFAULT CURRENT\_TIMESTAMP ON UPDATE ... | Timestamp that automatically updates when the record is modified |
| **fail\_attempts** | INT | NOT NULL, DEFAULT 0 | Counter for consecutive failed login attempts |
| **locked\_account** | TINYINT | NOT NULL, DEFAULT 0 | Flag (0=No, 1=Yes) to indicate if the account is locked due to failed attempts |
| **last\_failed\_login**| DATETIME | NULL | Timestamp of the last failed login attempt |

### **Key Features:**

  * **Central Identity Table:** This is the single source of truth for all student data, from personal details to academic info.
  * **Authentication & Security:** Manages user login (`webmail`, `password`) and includes robust security features like failed attempt tracking (`fail_attempts`) and account locking (`locked_account`).
  * **Unique Identifiers:** Enforces uniqueness on both `student_number` (official ID) and `webmail` (login username), ensuring data integrity.
  * **Academic Linking:** Connects each student to their academic program via `program_id`.
  * **Account Lifecycle:** The `account_status` column (defaulting to 'pending') manages the student's ability to use the system, allowing for an approval or email verification workflow.

### **Table Notes:**

1.  **Surrogate vs. Natural Key:** `student_id` is the **surrogate primary key** (the internal database ID). `student_number` and `webmail` are **natural candidate keys** (real-world, unique identifiers).
2.  **Password Security:** The `password` column (VARCHAR 255) is designed to store a **securely hashed password** (e.g., using bcrypt), not plaintext.
3.  **Account Lockout:** The `fail_attempts`, `locked_account`, and `last_failed_login` columns work together to implement an account lockout policy to prevent brute-force attacks.
4.  **Credential Link:** The `credential_id` links to another table, one that stores file paths or blob data for uploaded documents specifically the Certificate of Registration (COR).

### **Sample Data:**

```
student_id: 101
student_fname: "Juan"
student_mname: "Reyes"
student_lname: "Dela Cruz"
student_number: "2021-00123"
s_position: "Student"
webmail: "jrdelacruz@pup.edu.ph"
contactnum: "09171234567"
password: "[a-long-bcrypt-hashed-password-string]"
credential_id: 55
program_id: 3 (Links to "BS Computer Engineering")
account_status: 'active'
created_at: 2025-08-01 09:15:00
update_at: 2025-08-03 11:00:00
fail_attempts: 0
locked_account: 0
last_failed_login: NULL
```

### **Foreign Key Configuration:**

**References (Foreign Keys):**

  * **student\_data.program\_id** → `program_data.program_id`
      * (Constraint: `fk_student_program`)
      * Links the student to their academic program.
  * **student\_data.credential\_id** → `credentials.credential_id`
      * (Constraint: `fk_credentials_student_data`)
      * Links to the student's submitted credential record.

### **Data Validation Rules:**

1.  **Uniqueness:** `student_number` and `webmail` must be unique across all records.
2.  **Email Format:** Application logic should validate that `webmail` is in a correct email format.
3.  **Password:** Application logic must hash all passwords before insertion.
4.  **Lockout Logic:** `fail_attempts` should be incremented on a failed login and reset to 0 on a successful one. If `fail_attempts` exceeds a threshold, `locked_account` should be set to 1.
5.  **Account Status:** Must be one of the predefined ENUM values.

### **Design Notes:**

  * **Robust "User" Table:** This is a comprehensive and well-designed table for managing student users, complete with essential personal, academic, and security information.
  * **Good Key Choice:** The use of an auto-incrementing integer (`student_id`) as the primary key is standard practice and more efficient for database joins than using `student_number`.
  * **Security-First:** The inclusion of specific columns for lockout logic is a strong, security-conscious design choice.

-----