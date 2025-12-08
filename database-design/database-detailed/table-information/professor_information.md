## **professor_information Table**

### **Purpose:**
Stores essential information about professors in the PUP College of Engineering Computer Engineering Laboratory system. This table maintains professor profiles including names and contact details. Professors are referenced in the reservation system when students need to indicate which professor authorized or is associated with their laboratory reservation request.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **professor_id** | INT | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for each professor in the system |
| **professor_name** | VARCHAR(255) | NOT NULL | Full name of the professor (First Name, Middle Initial, Last Name) |
| **professor_webmail** | VARCHAR(255) | NOT NULL | Official PUP webmail address of the professor for communication |
| **professor_contact** | VARCHAR(100) | NOT NULL | Contact number of the professor for notifications and emergencies |

### **Key Features:**

**Professor Registry:**
- Central repository for all Professors
- Maintains essential contact information for communication
- Simple, focused structure for professor identification

**Contact Information:**
- **professor_name**: Full name for formal identification and display
- **professor_webmail**: Official institutional email for system notifications
- **professor_contact**: Phone number for urgent communications

**Integration Point:**
- Referenced by the reservation table to track professor involvement
- Enables the notification system to contact professors about reservations
- Supports verification workflow where professors confirm student reservations

### **Relationships:**

**Referenced by:**
- **reservation**: Links reservations to professors
  - `reservation.professor_id` → `professor_information.professor_id`
  - Tracks which professor is associated with/authorizing the reservation

**Data Flow:**
```
professor_information (Faculty registry)
    ↓ (professor_id FK)
reservation (Lab reservations)
    ↓
Professors receive notifications about reservations
Professors can confirm student reservations
```

### **Table Notes:**

1. **Professor Registration:**
   - All Computer Engineering department professors should be registered
   - Active faculty members maintained in the system
   - Contact information must be current and accurate

2. **Naming Convention:**
   - Full formal name (e.g., "Dr. Juan Dela Cruz" or "Prof. Maria Santos")
   - Include academic titles if institutional standard requires
   - Consistent formatting across all professor entries

3. **Contact Requirements:**
   - **professor_webmail**: Must be valid PUP institutional email
   - **professor_contact**: Must be reachable phone number
   - Both fields required for system notifications
   - Contact info should be verified and updated regularly

4. **Data Integrity:**
   - Cannot delete professor if they have associated reservations
   - Historical reservation data maintains professor_id reference
   - Updates to contact info don't affect historical records

5. **System Integration:**
   - Professors appear in dropdown menus for reservation forms
   - Used for email notifications when students create reservations
   - Referenced in professor confirmation workflow

### **Sample Data:**

```
professor_id: 1
professor_name: Dr. Juan Dela Cruz
professor_webmail: jdelacruz@pup.edu.ph
professor_contact: 09171234567

professor_id: 2
professor_name: Prof. Maria Santos
professor_webmail: msantos@pup.edu.ph
professor_contact: 09189876543

professor_id: 3
professor_name: Engr. Pedro Reyes
professor_webmail: preyes@pup.edu.ph
professor_contact: 09123456789

professor_id: 4
professor_name: Dr. Ana Garcia
professor_webmail: agarcia@pup.edu.ph
professor_contact: 09451234567

professor_id: 5
professor_name: Prof. Roberto Mendoza
professor_webmail: rmendoza@pup.edu.ph
professor_contact: 09162345678
```


**Recommended Constraints:**
- **ON DELETE:** RESTRICT (prevent deletion of professors with reservation history)
- **ON UPDATE:** CASCADE (propagate professor_id changes to reservations)

### **Data Validation Rules:**

1. **Name Validation:**
   - Cannot be empty or NULL
   - Should include academic title (Dr., Prof., Engr.) if applicable
   - Maximum 255 characters
   - No special characters that could break display

2. **Email Validation:**
   - Must follow email format (contains @)
   - Should be PUP institutional email (@pup.edu.ph domain preferred)
   - Must be unique to avoid confusion
   - Should be verified before granting system access

3. **Contact Number Validation:**
   - Should be Philippine mobile number format (09XX-XXX-XXXX or +639XX-XXX-XXXX)
   - Minimum 10-11 digits
   - Can include formatting characters (spaces, dashes) for readability
   - Must be reachable for notifications

4. **Uniqueness:**
   - Each professor should have unique professor_id (enforced by PK)
   - Consider adding unique constraint on professor_webmail to prevent duplicates
   - Professor names may not be unique (handle same-name professors by email)

5. **Required Fields:**
   - All fields marked NOT NULL must have values
   - No empty strings allowed for contact fields
   - Validation at application layer before database insertion

### **Design Notes:**

- **Simplicity**: Minimal fields focused on essential professor information
- **Contact-Centric**: Designed primarily for notification and communication purposes
- **Integration Ready**: Primary key serves as reference in reservation workflow
- **Flexibility**: VARCHAR sizes accommodate various name lengths and contact formats
- **Maintainability**: Simple structure easy to update and maintain
- **Scalability**: Can be extended with additional fields if needed (department, office, schedule)
- **Normalized**: Separate table prevents redundant professor data in reservations
- **Data Integrity**: Foreign key constraints prevent orphaned reservations
- **User-Friendly**: Professor names appear in dropdowns and reports throughout system
