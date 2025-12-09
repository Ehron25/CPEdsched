## **notifications Table**

#### **Purpose:**  
Stores system-generated notifications sent to users (e.g., reservation confirmations, incident alerts, reminders). Helps keep users informed about relevant activities.

---

### **Table Structure:**

| Column Name    | Data Type                | Constraints591                     | Description                                                                    |
|----------------|--------------------------|------------------------------------|--------------------------------------------------------------------------------|
| **id**         | UUID                     | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for each notification record                                 |
| **user_id**    | UUID                     | NOT NULL                           | ID of the user who received the notification (FK to `profiles.id`)             |
| **title**      | TEXT                     | NOT NULL                           | Short title of the notification                                                |
| **message**    | TEXT                     | NOT NULL                           | Detailed content of the notification                                           |
| **type**       | TEXT                     | DEFAULT 'info'                     | Category of the notification (`info`, `warning`, `error`, `success`)           |
| **is_read**    | BOOLEAN                  | DEFAULT false                      | Whether the user has viewed the notification                                   |
| **created_at** | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT timezone('utc'::text, now()) | Timestamp when the notification was created                                    |

---

### **Key Features:**

#### **User Communication:**
- Enables the system to send timely and relevant messages to users.
- Supports different types of notifications to differentiate urgency or context.

#### **Read Status:**
- Tracks whether a user has seen a notification, allowing for follow‑up if needed.

---

### **Table Notes:**

1. **Notification Types:**  
   - `info`: General information.  
   - `warning`: Non‑critical issues or reminders.  
   - `error`: Problems that require user attention.  
   - `success`: Confirmation that an action was completed successfully.

2. **Scalability:**  
   As the system grows, new notification types can be added as needed.

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
user_id: 123e4567-e89b-12d3-a456-426614174000
title: Reservation Confirmed
message: Your reservation for Room 101 on 2025-12-05 has been verified.
type: success
is_read: true
created_at: 2025-12-03 12:00:00+00

id: 550e8400-e29b-41d4-a716-446655440001
user_id: 123e4567-e89b-12d3-a456-426614174001
title: Key Issued
message: A room key has been issued for your reservation.
type: info
is_read: false
created_at: 2025-12-04 08:15:00+00
```

---

### **Design Notes:**

- **User-Centric:**  
  Keeps users informed without cluttering their interface.
- **Flexible Typing:**  
  The `type` field allows for easy filtering and prioritization of notifications.

---