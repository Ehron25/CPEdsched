# key_issuance Table

## Purpose
The `key_issuance` table logs all key borrowing and returning activities linked to room reservations.  
It connects a **reservation**, a **specific room key**, the **student who borrowed it**, and the **staff who issued it**.  
This table provides accountability and traceability for all key-related transactions.

---

## **Table Structure**

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| **id** | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each key issuance record |
| **reservation_id** | INT | FOREIGN KEY, NOT NULL | Links to the reservation that requires the key (`reservations.id`) |
| **key_id** | INT | FOREIGN KEY, NOT NULL | The specific room key issued (`room_keys.id`) |
| **student_id** | INT | FOREIGN KEY, NOT NULL | The student who received the key (`profiles.id`) |
| **issued_by** | INT | FOREIGN KEY, NOT NULL | The staff/admin who issued the key (`profiles.id`) |
| **issued_at** | TIMESTAMP | NOT NULL | Timestamp when the key was issued |
| **returned_at** | TIMESTAMP | NULL | Timestamp when the key was returned |
| **status** | VARCHAR(20) | NOT NULL | Current status (`Issued`, `Returned`, `Lost`) |

---

## **Key Features**
- **Tracks key lifecycle** from issuance → return.
- **Ensures room access control** by linking key distribution to actual reservations.
- **Supports auditing** of which staff member issued which key.
- **Maintains accountability** for borrowed keys through timestamps and status updates.
- **Foreign-key connected** to three major entities: reservations, students, and keys.

---

## **Relationships**

| Relationship | Description |
|-------------|-------------|
| reservations (1 → M) | A single reservation can have multiple key issuance records. |
| room_keys (1 → M) | A key can be issued multiple times across different reservations. |
| profiles (1 → M) | Used twice: one for the student receiving the key and one for the staff issuing it. |

**Foreign Key Mapping:**

- `key_issuance.reservation_id` → `reservations.id`
- `key_issuance.key_id` → `room_keys.id`
- `key_issuance.student_id` → `profiles.id`
- `key_issuance.issued_by` → `profiles.id` (staff/admin role)

---

## **Behavior in System Workflow**
- When a reservation is approved and needs room access, an entry is created here.
- Student receives key; staff/staff logs `issued_at`.
- Once the key is returned, `returned_at` is updated and `status` becomes `Returned`.
- If the key is never returned, the status may be set to `Lost`.

---

## **Sample Entry**
```text
id: 48
reservation_id: 155
key_id: 2
student_id: 15       (profile: student role)
issued_by: 3         (profile: staff/admin role)
issued_at: 2025-11-07 09:10:00
returned_at: NULL
status: Issued
text
Copy code
id: 49
reservation_id: 140
key_id: 4
student_id: 22
issued_by: 3
issued_at: 2025-11-06 13:00:00
returned_at: 2025-11-06 16:45:00
status: Returned
Data Validation Rules
Valid foreign keys required:

Reservation must exist before key issuance.

Key must exist in room_keys.

Student and issuer must exist in profiles.

Status field must match allowed values:

Issued, Returned, Lost.

Returned keys must include a returned_at timestamp.

issued_by must refer to a profile with Faculty or Staff role.

Design Notes
This table creates a historical log for every key transaction.

Enables auditing of students who frequently borrow keys.

returned_at being NULL automatically identifies keys that are still checked out.

Prevents double issuance of the same key when combined with system-level validation.

Supports future reporting features (e.g., overdue keys, most borrowed rooms).
