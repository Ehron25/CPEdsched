## **profiles Table**

#### **Purpose:**  
Stores user profiles for all individuals interacting with the system, including students, administrators, and possibly professors. This table links to authentication and contains user-specific details.

---

### **Table Structure:**

| Column Name        | Data Type                | Constraints591                                  | Description                                                                    |
|--------------------|--------------------------|-------------------------------------------------|--------------------------------------------------------------------------------|
| **id**             | UUID                     | NOT NULL, PRIMARY KEY                           | Unique identifier for each user profile (also references `auth.users.id`)      |
| **email**          | TEXT                     | NOT NULL, UNIQUE                                | User's email address (used for login)                                          |
| **full_name**      | TEXT                     |                                                  | User's full name                                                               |
| **student_number** | TEXT                     |                                                  | Student's university identification number                                      |
| **program**        | TEXT                     |                                                  | Academic program or department                                                 |
| **year_section**   | TEXT                     |                                                  | User's current year and section (e.g., “3rd Year, Section A”)                  |
| **contact_number** | TEXT                     |                                                  | User's phone number for contact                                                |
| **role**           | USER-DEFINED             | DEFAULT 'student'                                | User's role within the system (e.g., `student`, `admin`)                       |
| **cor_url**        | TEXT                     |                                                  | URL to the user's Certificate of Registration (for verification)                |
| **is_verified**    | BOOLEAN                  | DEFAULT false                                   | Whether the user's account has been verified (e.g., via COR)                   |
| **created_at**     | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT timezone('utc'::text, now()) | Timestamp when the user profile was created                                    |

---

### **Key Features:**

#### **User Verification:**
- The `is_verified` flag ensures that only verified users can perform certain actions.
- `cor_url` provides a means to verify identity using an official document.

#### **Role-Based Access:**
- `role` determines what actions a user can perform within the system (e.g., student vs. admin).

---

### **Table Notes:**

1. **Email Uniqueness:**  
   Each user must have a unique email, which is used as the primary login identifier.

2. **Integration with Authentication:**  
   The `id` column references `auth.users.id`, linking this table to the authentication system.

---

### **Relationships:**

#### **Referenced by (Foreign Keys):**

| Referencing Table    | Foreign Key Column     | Purpose                                                      |
|----------------------|------------------------|--------------------------------------------------------------|
| incident_reports     | reporter_id            | Links incident reports to the reporting user                 |
| incident_reports     | issued_by              | Links incident reports to the admin who handled the report     |
| key_issuance         | student_id             | Links key issuance records to the receiving student           |
| key_issuance         | issued_by              | Links key issuance to the staff member who issued the key     |
| notifications        | user_id                | Links notifications to the recipient user                     |
| reservation_equipment| reservation_id         | Links reservation equipment to the reservation                |
| reservations        | user_id                | Links reservations to the user who made the reservation       |
| reservations        | verified_by            | Links reservations to the user who verified them               |
| reservations        | cancelled_by           | Links reservations to the user who cancelled them             |
| room_keys           | room_id                | Links room keys to the room they belong to                    |

#### **References To (This Table is Referenced By):**
*This table does not reference any other table.*

---

### **Sample Data:**

```sql
id: 123e4567-e89b-12d3-a456-426614174000
email: student1@pup.edu.ph
full_name: John Doe
student_number: 2025101
program: Computer Science
year_section: 3rd Year, Section A
contact_number: +63912345678
role: student
cor_url: https://example.com/cors/2025101.pdf
is_verified: true
created_at: 2025-11-01 08:00:00+00

id: 123e4567-e89b-12d3-a456-426614174001
email: admin1@pup.edu.ph
full_name: Jane Smith
student_number: ADMIN001
program: Information Technology
year_section: N/A
contact_number: +63987654321
role: admin
cor_url: NULL
is_verified: true
created_at: 2025-11-01 09:30:00+00
```

---

### **Design Notes:**

- **Central User Repository:**  
  Serves as the main source of user information for the entire system.
- **Flexibility for Roles:**  
  The `role` column can be expanded with new roles as the system evolves.

---