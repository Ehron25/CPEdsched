## **credentials Table**

### **Purpose:**
Stores student credential verification records in the PUP College of Engineering Computer Engineering Laboratory system. This table manages the Certificate of Registration (COR) upload and verification process, tracking document submissions, approval status, expiration dates, and admin verification history. It serves as the authentication layer ensuring only verified students with valid enrollment can access laboratory facilities and equipment.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **credential_id** | INT | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for each credential submission record |
| **credential_file** | VARCHAR(255) | NOT NULL | Filename or file path of the uploaded COR document (PDF) |
| **c_created** | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp when the credential was uploaded by student |
| **c_expired** | DATE | NOT NULL | Expiration date of the COR (6 months from verification date) |
| **c_status** | ENUM('Pending', 'Expired', 'Verified', 'Rejected') | NOT NULL, DEFAULT 'Pending' | Current verification status of the credential |
| **verified_by** | INT | FOREIGN KEY, NULL | References admin_id of the administrator who verified/rejected the credential |

### **Key Features:**

**Document Management:**
- Tracks uploaded COR files for each student credential submission
- Stores file references for retrieval and verification
- Maintains upload timestamps for audit trail

**Verification Workflow:**
- **Pending**: Initial status when student uploads COR (awaiting admin review)
- **Verified**: Admin approved the credential as valid and authentic
- **Rejected**: Admin rejected credential (invalid document, incorrect term, etc.)
- **Expired**: Credential past expiration date (automatic or admin-triggered)

**Expiration Tracking:**
- **c_expired**: Date when COR becomes invalid (6 months from verification)
- Enables automatic credential expiration checks
- Credentials valid for 6-month period after verification
- Prevents access with outdated enrollment documents

**Admin Accountability:**
- **verified_by**: Tracks which admin processed the credential
- Links verification actions to specific administrators
- Supports audit trail and responsibility tracking
- NULL when status is Pending (not yet reviewed)

**Temporal Tracking:**
- **c_created**: Records when student submitted credential
- Tracks verification processing time
- Maintains submission history

### **Relationships:**

**Parent Table:**
- **admin_data**: Each verified/rejected credential links to the admin who processed it
  - `credentials.verified_by` → `admin_data.admin_id`
  - Tracks admin accountability for verification decisions
  - NULL for Pending credentials (not yet reviewed)

**Referenced by:**
- **student_data**: Links students to their credential records
  - `student_data.credential_id` → `credentials.credential_id`
  - Each student has one current credential record
  - Establishes enrollment verification for lab access

### **System Workflow:**

```
Step 1: Student Registration
    ↓
Student creates account
    ↓
Step 2: Upload COR
    ↓
credentials record created (status = 'Pending', verified_by = NULL)
    ↓
student_data.credential_id links to credentials record
    ↓
Step 3: Wait for Verification
    ↓
Student CANNOT make reservations yet (Pending status blocks access)
    ↓
Lab Admin/Super Admin reviews credential
    ↓
Step 4: Admin Verification Decision
    ↓
    ├─→ APPROVED: credentials updated (status = 'Verified', verified_by = admin_id, c_expired = verification_date + 6 months)
    │       ↓
    │   Student can now make reservations
    │
    └─→ REJECTED: credentials updated (status = 'Rejected', verified_by = admin_id)
            ↓
        Student must upload new COR and restart process
```

### **Table Notes:**

1. **Credential Submission:**
   - Students upload COR during registration or semester start
   - Initial status automatically set to 'Pending'
   - verified_by remains NULL until admin reviews
   - c_created automatically records upload timestamp
   - c_expired initially set but not enforced until verification

2. **Access Restriction:**
   - Students with 'Pending' credentials CANNOT make reservations
   - System blocks reservation creation until credential is 'Verified'
   - Only 'Verified' credentials grant lab access
   - Expired or Rejected credentials also block access

3. **Admin Verification Process:**
   - Lab Admin or Super Admin reviews pending credentials from queue
   - Checks document authenticity, current enrollment, student details
   - Makes verification decision:
     - **Approve**: Updates c_status to 'Verified', sets verified_by to admin_id, sets c_expired to verification_date + 6 months
     - **Reject**: Updates c_status to 'Rejected', sets verified_by to admin_id
   - Decision recorded for accountability

4. **Status Transitions:**
   - **Pending → Verified**: Admin approves valid COR (student can now reserve)
   - **Pending → Rejected**: Admin rejects invalid/incorrect COR (student must resubmit)
   - **Verified → Expired**: Past expiration date (blocks access)
   - **Rejected → (New record)**: Student must upload new COR

5. **Expiration Management:**
   - c_expired set to 6 months from verification date (not upload date)
   - Example: Verified on Aug 15, 2024 → Expires Feb 15, 2025
   - Credentials valid for 6-month period after verification
   - System checks credential status before allowing reservations
   - Expired credentials require new COR submission
   - Prevents access with outdated enrollment documents

6. **File Storage:**
   - credential_file stores filename or file path
   - Actual files stored in secure server directory
   - Consider naming convention: `COR_studentID_timestamp.pdf`
   - Supported formats: PDF, JPG, PNG (configure in application)

7. **Verification Rules:**
   - Only Lab Admin or Super Admin can verify credentials
   - verified_by must reference valid admin_id from admin_data
   - Cannot be verified without admin assignment
   - Pending status = verified_by is NULL

8. **Data Retention:**
   - Historical credentials retained for audit purposes
   - Credentials valid for 6-month period from verification
   - Each new semester typically requires new credential submission
   - Old credentials remain in database with Expired status
   - Maintains complete verification history

### **Sample Data:**

```
credential_id: 1
credential_file: COR_2021-12345-MN-0_20240815.pdf
c_created: 2024-08-15 09:30:00
c_expired: 2025-02-15  (6 months from verification)
c_status: Verified
verified_by: 2  (→ Maria Garcia, Lab Admin - Student can make reservations)

credential_id: 2
credential_file: COR_2022-23456-MN-0_20240816.pdf
c_created: 2024-08-16 10:45:00
c_expired: 2025-02-16  (tentative, not enforced until verified)
c_status: Pending
verified_by: NULL  (Student CANNOT make reservations - waiting for admin review)

credential_id: 3
credential_file: COR_2020-34567-MN-0_20240105.pdf
c_created: 2024-01-05 14:20:00
c_expired: 2024-07-05  (6 months from verification, now expired)
c_status: Expired
verified_by: 2  (→ Maria Garcia, Lab Admin - Was verified but expired, needs renewal)

credential_id: 4
credential_file: COR_2023-45678-MN-0_20240817.pdf
c_created: 2024-08-17 11:15:00
c_expired: NULL  (not set since rejected)
c_status: Rejected
verified_by: 1  (→ Juan Dela Cruz, Super Admin - Invalid document, student must resubmit)

credential_id: 5
credential_file: COR_2021-56789-MN-0_20240818.pdf
c_created: 2024-08-18 13:00:00
c_expired: 2025-02-18  (6 months from verification)
c_status: Verified
verified_by: 2  (→ Maria Garcia, Lab Admin - Student can make reservations)
```

### **Foreign Key Configuration:**

**In MySQL Workbench Foreign Keys tab:**

| Foreign Key Name | Referenced Table | Column | Referenced Column |
|-----------------|------------------|---------|-------------------|
| fk_credential_verified_by | admin_data | verified_by | admin_id |

**Recommended Constraints:**
- **ON DELETE:** SET NULL (if admin account deleted, preserve credential but clear verifier reference)
- **ON UPDATE:** CASCADE (if admin_id changes, update all credential references)

### **Data Validation Rules:**

1. **File Requirements:**
   - credential_file cannot be empty or NULL
   - Must reference valid file in secure storage directory
   - Supported formats: .pdf, .jpg, .png

2. **Date Validation:**
   - c_created automatically set on record insertion
   - c_expired calculated as: verification_date + 6 months (set when admin verifies)
   - Cannot have expired date before creation date
   - Example: Verified Aug 15, 2024 → Expires Feb 15, 2025

3. **Status Values:**
   - Only 'Pending', 'Expired', 'Verified', 'Rejected' allowed
   - Default: 'Pending' for new uploads
   - Case-sensitive to maintain consistency
   - Cannot be NULL or empty

4. **Admin Assignment:**
   - verified_by must be NULL or valid admin_id
   - NULL when c_status = 'Pending'
   - Must reference existing admin when c_status = 'Verified' or 'Rejected'
   - Foreign key enforces referential integrity

5. **Status-Admin Consistency:**
   - If c_status = 'Pending', verified_by must be NULL
   - If c_status = 'Verified' or 'Rejected', verified_by must be valid admin_id
   - Application logic should enforce this business rule

6. **Access Control:**
   - Only 'Verified' status allows reservation creation
   - 'Pending', 'Rejected', 'Expired' statuses block lab access
   - System checks credential status before allowing any reservation

### **Design Notes:**

- **Gatekeeper Function**: Credentials must be verified before lab access
- **Clear Workflow**: Student registers → Uploads COR → Waits for verification → Gets approved → Can reserve
- **Access Control**: Pending status blocks reservation creation
- **Admin Accountability**: verified_by tracks who processed each credential
- **Six-Month Validity**: Credentials expire 6 months after verification
- **Temporal Tracking**: Submission and expiration dates for access control
- **Audit Trail**: Historical credentials retained (not deleted, only expired)
- **Security Layer**: Ensures only verified students can make reservations
- **File Management**: References external file storage, not blob storage
- **Simple Status Model**: Four clear states for easy workflow management
- **Integration Ready**: Links to student_data and admin_data for complete ecosystem

---