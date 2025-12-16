## **key_issuance Table**

#### **Purpose:**  
Tracks the issuance and return of room keys to students for reservations. Ensures proper accountability and security.

---

### **Table Structure:**

| Column Name       | Data Type                | Constraints591                     | Description                                                                    |
|-------------------|--------------------------|------------------------------------|--------------------------------------------------------------------------------|
| **id**            | UUID                     | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for each key issuance record                                 |
| **reservation_id**| UUID                     |                                    | ID of the reservation for which the key was issued (FK to `reservations.id`)   |
| **key_id**        | UUID                     |                                    | ID of the room key that was issued (FK to `room_keys.id`)                      |
| **student_id**    | UUID                     |                                    | ID of the student who received the key (FK to `profiles.id`)                  |
| **issued_by**     | UUID                     |                                    | ID of the administrator or staff member who issued the key (FK to `profiles.id`) |
| **issued_at**     | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT timezone('utc'::text, now()) | Timestamp when the key was issued                                              |
| **returned_at**   | TIMESTAMP WITH TIME ZONE |                                    | Timestamp when the key was returned (NULL if not yet returned)                 |
| **status**        | TEXT                     | DEFAULT 'issued'                   | Current status of the key (`issued`, `returned`)                               |

---

### **Key Features:**

#### **Key Management:**
- Ensures that keys are properly issued and accounted for.
- Tracks who issued the key, to whom it was issued, and when it was returned.

#### **Status Management:**
- `issued`: Key has been given to a student and has not yet been returned.  
- `returned`: Key has been returned.

---

### **Table Notes:**

1. **Return Tracking:**  
   `returned_at` should be updated when the key is returned. Until then, the status remains `issued`.

2. **Security:**  
   Only authorized personnel should be able to issue or take back keys.

---

### **Relationships:**

#### **Referenced by (Foreign Keys):**
*This table is not referenced by any other table.*

#### **References To (This Table is Referenced By):**
*This table does not reference any other table.*

---

### **Sample Data:**

```sql
id: 550e8400-e29b-41d4-a716-446655440000
reservation_id: 223e4567-e89b-12d3-a456-426614174000
key_id: 323e4567-e89b-12d3-a456-426614174000
student_id: 123e4567-e89b-12d3-a456-426614174000
issued_by: 523e4567-e89b-12d3-a456-426614174000
issued_at: 2025-12-03 08:00:00+00
returned_at: 2025-12-03 17:00:00+00
status: returned

id: 550e8400-e29b-41d4-a716-446655440001
reservation_id: 223e4567-e89b-12d3-a456-426614174001
key_id: 323e4567-e89b-12d3-a456-426614174001
student_id: 123e4567-e89b-12d3-a456-426614174001
issued_by: 523e4567-e89b-12d3-a456-426614174001
issued_at: 2025-12-04 08:30:00+00
returned_at: NULL
status: issued
```

---

### **Design Notes:**

- **Accountability:**  
  Every key issuance and return is logged with the person responsible.
- **Real‑Time Status:**  
  The `status` column provides immediate visibility into whether a key is currently out or has been returned.

