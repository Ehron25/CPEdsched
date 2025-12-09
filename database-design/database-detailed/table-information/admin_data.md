## **admin_data Table**

### **Purpose:**
Stores information about system administrators who manage the CPE Laboratory room reservation and equipment management system. This table contains admin profiles, authentication details, account security tracking, and activity monitoring.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **admin_id** | INT | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for each administrator |
| **a_fname** | VARCHAR(100) | NOT NULL | Administrator's first name |
| **a_mname** | VARCHAR(100) | NOT NULL | Administrator's middle name |
| **a_sname** | VARCHAR(100) | NOT NULL | Administrator's surname/last name |
| **a_role** | VARCHAR(45) | NOT NULL | Administrator's role: "Super Admin" or "Lab Admin" |
| **webmail** | VARCHAR(255) | UNIQUE, NOT NULL | Administrator's institutional email address (used for login) |
| **password** | VARCHAR(255) | NOT NULL | Hashed password for secure authentication (never plain text) |
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
- Automatically locks accounts after 3 consecutive failed attempts
- Records timestamps of failed login attempts for audit purposes
- Stores hashed passwords using secure algorithms (bcrypt, argon2)
- Session tracking via `lastlog` for monitoring admin activity

**Account Management:**
- Active/Inactive status for enabling/disabling admin access
- Role-based identification for permission management and access control
- Audit trail with creation and update timestamps
- Last login tracking for activity monitoring
- Two-tier admin hierarchy (Super Admin and Lab Admin)

**Unique Identifiers:**
- Webmail must be unique (one account per institutional email)
- Admin ID serves as primary key for relationships throughout system
- Email-based authentication for institutional identity verification

### **Admin Role Types:**

#### **Super Admin**
- Full system access and control
- Can manage all admin accounts (create, modify, delete Lab Admins)
- Access to all system settings and configurations
- Can override any action in the system
- Manages equipment categories and system-wide settings
- Full reporting and analytics access
- Can unlock locked accounts
- **Can delete records** (with appropriate safeguards and audit logging)
- Typically: Department head, IT administrator

#### **Lab Admin**
- Manages daily laboratory operations
- Verifies student credentials (approves/rejects COR uploads)
- Processes room and equipment reservations (approve/cancel)
- Verifies equipment returns and assesses condition
- Updates equipment inventory quantities
- **Cannot delete any records** (reservations, equipment, students, credentials, or other data)
- Cannot create or modify other admin accounts
- Cannot access system-wide settings
- Limited to operational tasks (view, create, update only)
- Typically: Laboratory staff, teaching assistants

### **Table Notes:**

1. **Account Lockout Policy:**
   - When `fail_attempts` reaches 3, `locked_account` is set to 1 (locked)
   - Locked accounts cannot log in until Super Admin resets the lock
   - Password reset required to unlock and reset `fail_attempts` to 0

2. **Login Security:**
   - Failed login increments `fail_attempts` and updates `last_failed_login`
   - Successful login resets `fail_attempts` to 0 and updates `lastlog`
   - Inactive accounts cannot log in but records are retained for audit

3. **Status Management:**
   - **Active**: Admin can log in and perform assigned duties
   - **Inactive**: Account disabled, no login access, historical data preserved

4. **Email Requirements:**
   - Webmail must be valid institutional email address (e.g., `admin@pup.edu.ph`)
   - Used for login authentication and system notifications
   - Unique constraint prevents duplicate accounts

5. **Password Policy:**
   - Must be hashed using bcrypt or argon2 (never stored as plain text)
   - Recommended: Minimum 8 characters, mix of upper/lower/numbers/symbols
   - Regular password changes recommended for security

6. **Role Assignment:**
   - Only two valid roles: "Super Admin" or "Lab Admin"
   - Super Admin can manage Lab Admin accounts
   - Lab Admin cannot change their own role or create other admins
   - At least one Super Admin must exist in the system

7. **Audit Compliance:**
   - `created_at` and `update_at` automatically track all changes
   - `lastlog` tracks login activity for security monitoring
   - Accounts should be set to Inactive rather than deleted to preserve audit trail

8. **Deletion Restrictions:**
   - **Lab Admin**: Cannot delete any records in any table (students, reservations, equipment, credentials, admin accounts, etc.)
   - **Super Admin**: Can delete records with appropriate confirmation and audit logging
   - Alternative to deletion: Lab Admins can cancel reservations or mark records as inactive
   - Permanent deletion reserved for Super Admin to maintain data integrity and audit compliance

### **Relationships:**

**Referenced by (Foreign Keys):**

1. **credentials.verified_by** → `admin_id`
   - Tracks which admin verified student credentials (COR approval)

2. **reservation.notified_by** → `admin_id`
   - Records which admin notified student about reservation status

3. **reservation.cancelled_by_admin_id** → `admin_id`
   - Tracks admin who cancelled a reservation

4. **equipment_return.verified_by** → `admin_id`
   - Records which admin verified equipment returns and assessed condition

### **Sample Data:**

```
admin_id: 1
a_fname: Juan
a_mname: Cruz
a_sname: Dela Cruz
a_role: Super Admin
webmail: jdelacruz@pup.edu.ph
account_status: Active
lastlog: 2024-11-07 14:30:00
fail_attempts: 0
locked_account: 0

admin_id: 2
a_fname: Maria
a_mname: Santos
a_sname: Garcia
a_role: Lab Admin
webmail: mgarcia@pup.edu.ph
account_status: Active
lastlog: 2024-11-07 16:45:00
fail_attempts: 0
locked_account: 0

admin_id: 3
a_fname: Pedro
a_mname: Lopez
a_sname: Reyes
a_role: Lab Admin
webmail: preyes@pup.edu.ph
account_status: Inactive
lastlog: 2024-09-15 10:20:00
fail_attempts: 0
locked_account: 0
(Former staff member - account deactivated but records preserved)
```

### **Permission Matrix:**

| Action | Super Admin | Lab Admin |
|--------|-------------|-----------|
| **Create admin accounts** | ✓ Yes | ✗ No |
| **Modify admin accounts** | ✓ Yes | ✗ No |
| **Delete admin accounts** | ✓ Yes | ✗ No |
| **Verify student credentials** | ✓ Yes | ✓ Yes |
| **Approve/cancel reservations** | ✓ Yes | ✓ Yes |
| **Delete reservations** | ✓ Yes | ✗ No |
| **Verify equipment returns** | ✓ Yes | ✓ Yes |
| **Update equipment inventory** | ✓ Yes | ✓ Yes (quantities only) |
| **Delete equipment records** | ✓ Yes | ✗ No |
| **Manage equipment categories** | ✓ Yes | ✗ No |
| **Delete student accounts** | ✓ Yes | ✗ No |
| **Delete credentials** | ✓ Yes | ✗ No |
| **Access system settings** | ✓ Yes | ✗ No |
| **View all reports** | ✓ Yes | ✓ Yes (operational only) |
| **Unlock locked accounts** | ✓ Yes | ✗ No |
| **Change account status** | ✓ Yes (all) | ✗ No |
| **Delete any system data** | ✓ Yes (with audit) | ✗ No |

### **Data Validation Rules:**

1. **Email Format:**
   - Must be valid institutional email (@pup.edu.ph)
   - Unique across all admin accounts
   - Used as primary login identifier

2. **Name Fields:**
   - All name fields required (first, middle, last)
   - No special characters except hyphens and apostrophes
   - Proper capitalization recommended

3. **Role Validation:**
   - Must be exactly "Super Admin" or "Lab Admin"
   - Case-sensitive to maintain consistency
   - Cannot be empty or other values

4. **Security Thresholds:**
   - `fail_attempts` range: 0-3 (locks at 3)
   - `locked_account`: 0 (unlocked) or 1 (locked)
   - `lastlog` NULL means never logged in

5. **Status Values:**
   - Only 'Active' or 'Inactive' allowed
   - Default is 'Active' for new accounts
   - Inactive accounts cannot log in

### **Design Notes:**

- **Two-Tier Hierarchy**: Simple role structure with clear permission boundaries
- **No Deletion for Lab Admin**: Lab Admins cannot delete any data to preserve audit integrity and prevent accidental data loss
- **Cancellation vs Deletion**: Lab Admins can cancel reservations or mark items as inactive instead of deleting
- **Security First**: Multiple security features prevent unauthorized access including lockout mechanism and deletion restrictions
- **Audit Compliance**: All actions tracked via timestamps and foreign key relationships
- **Email-Based Auth**: Uses institutional email for identity verification
- **Role-Based Access**: Super Admin has full control, Lab Admin handles daily operations without deletion privileges
- **Minimal Roles**: Only two roles simplify permission management and reduce complexity
- **Data Integrity**: Deletion restrictions protect against accidental or unauthorized data removal

---