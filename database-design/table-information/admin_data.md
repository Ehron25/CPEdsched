## **admin_data Table**

### **Purpose:**
Stores information about system administrators who manage the room reservation and equipment management system. This table contains admin profiles, authentication details, and account security tracking.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **admin_id** | INT | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for each administrator |
| **a_fname** | VARCHAR(100) | NOT NULL | Administrator's first name |
| **a_mname** | VARCHAR(100) | NULL | Administrator's middle name |
| **a_sname** | VARCHAR(100) | NOT NULL | Administrator's surname/last name |
| **a_role** | VARCHAR(100) | NOT NULL | Administrator's role or position **(STILL UNDECIDED ABOUT THIS ONE!!!)** |
| **webmail** | VARCHAR(255) | UNIQUE, NOT NULL | Administrator's institutional email address (used for login) |
| **password** | VARCHAR(255) | NOT NULL | Hashed password for secure authentication |
| **contactnum** | VARCHAR(20) | NOT NULL | Administrator's contact phone number |
| **account_status** | ENUM('Active', 'Inactive') | NOT NULL, DEFAULT 'Active' | Current status of the administrator account |
| **lastlog** | DATETIME | NULL | Timestamp of the administrator's last login/logout (NULL if never logged in) |
| **created_at** | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when the admin account was created |
| **update_at** | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Timestamp when the admin record was last modified |
| **fail_attempts** | INT | NOT NULL, DEFAULT 0 | Counter for consecutive failed login attempts |
| **locked_account** | TINYINT | NOT NULL, DEFAULT 0 | Boolean flag (0=unlocked, 1=locked) indicating if account is locked due to security |
| **last_failed_login** | DATETIME | NULL | Timestamp of the most recent failed login attempt |

### **Key Features:**

**Security Measures:**
- Tracks failed login attempts to prevent brute force attacks
- Automatically locks accounts after multiple failed attempts
- Records timestamps of failed login attempts for audit purposes
- Stores hashed passwords (never plain text)

**Account Management:**
- Active/Inactive status for enabling/disabling admin access
- Role-based identification for permission management
- Audit trail with creation and update timestamps
- Last login tracking for activity monitoring

**Unique Identifiers:**
- Webmail must be unique (one account per email)
- Admin ID serves as the primary key for relationships

### **Business Rules:**

1. **Account Lockout:** When `fail_attempts` reaches 3, `locked_account` is set to 1 (locked)
2. **Password Reset:** Required to unlock a locked account and reset `fail_attempts` to 0
3. **Status Management:** Inactive accounts cannot log in, but records are retained
4. **Email Requirement:** Webmail must be a valid institutional email address
5. **Audit Compliance:** `created_at` and `update_at` automatically track all changes

