### **blocked_dates Table**

#### **Purpose:**  
Stores dates that are blocked for room reservations, such as holidays, maintenance days, or other special events. This ensures that these dates are unavailable for booking.

---

### **Table Structure:**

| Column Name    | Data Type                | Constraints                     | Description                                                                    |
|----------------|--------------------------|------------------------------------|--------------------------------------------------------------------------------|
| **id**         | UUID                     | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for each blocked date record                                 |
| **reason**     | TEXT                     | NOT NULL                           | Explanation for why the date(s) are blocked                                    |
| **created_at** | TIMESTAMP WITH TIME ZONE | NOT NULL, DEFAULT timezone('utc'::text, now()) | Timestamp when the blocked date record was created                             |
| **start_date** | DATE                     | NOT NULL, DEFAULT CURRENT_DATE     | First date in the blocked date range                                           |
| **end_date**   | DATE                     | NOT NULL, DEFAULT CURRENT_DATE     | Last date in the blocked date range                                            |

---

### **Key Features:**

#### **Validation Rules:**
- **Date Range:**  
  `start_date` must be less than or equal to `end_date`.
- **Reason:**  
  Must be provided and cannot be empty.

#### **Default Values:**
- `id` is auto‑generated using `uuid_generate_v4()`.
- `created_at` is automatically set to the current UTC time when the record is inserted.
- `start_date` and `end_date` default to the current date if not specified.

---

### **Relationships:**

#### **Referenced by (Foreign Keys):**
*This table is not referenced by any other table in the schema.*

---

### **Sample Data:**

```sql
id: 550e8400-e29b-41d4-a716-446655440000
reason: University Holiday
created_at: 2025-12-01 09:00:00+00
start_date: 2025-12-25
end_date: 2025-01-01

id: 550e8400-e29b-41d4-a716-446655440001
reason: Building Maintenance
created_at: 2025-12-02 10:30:00+00
start_date: 2025-12-10
end_date: 2025-12-15
```

---

### **Design Notes:**

- **Simplicity:**  
  Easy to manage and query blocked date ranges.
- **Audit Trail:**  
  `created_at` provides a record of when the block was added.
- **Flexibility:**  
  Supports blocking a single day or a range of days.

