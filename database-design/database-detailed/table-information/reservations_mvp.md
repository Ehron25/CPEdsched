# reservations Table

## Purpose
The `reservation` table is the core transaction table of the `cpedsched` system.  
It stores every room reservation request made by verified users and records all academic, scheduling, administrative, and auditing details.  
Each reservation includes the student (user), room, professor details, course context, schedule, approval logs, and cancellation records.

---

## **Table Structure**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| **id** | INT | PK, AUTO_INCREMENT, NOT NULL | Unique reservation identifier |
| **reservation_number** | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable reservation code (e.g., `251107-0001`) |
| **user_id** | INT | FK → profiles(id), NOT NULL | User requesting the reservation |
| **room_id** | INT | FK → rooms(id), NOT NULL | Reserved room |
| **subject_code** | VARCHAR(50) | NULL | Subject or course code |
| **professor_name** | VARCHAR(255) | NULL | Full name of supervising professor |
| **professor_email** | VARCHAR(255) | NULL | Email of supervising professor |
| **professor_contact_number** | VARCHAR(50) | NULL | Contact number of supervising professor |
| **professor_status** | ENUM('Regular','Part-time','Guest') | NULL | Professor classification |
| **date_reserved** | DATE | NOT NULL | Reservation date |
| **time_start** | TIME | NOT NULL | Start time of reservation |
| **time_end** | TIME | NOT NULL | End time of reservation |
| **status** | ENUM('Pending','Approved','Cancelled','Completed') | NOT NULL, DEFAULT 'Pending' | Reservation status |
| **cancel_reason** | TEXT | NULL | Reason for cancellation |
| **cancelled_by** | INT | FK → admin_data(admin_id) | Admin who cancelled the reservation |
| **cancelled_at** | TIMESTAMP | NULL | Timestamp of cancellation |
| **verified_by** | INT | FK → admin_data(admin_id) | Admin who approved the reservation |
| **verified_at** | TIMESTAMP | NULL | Timestamp when reservation was approved |
| **created_at** | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| **updated_at** | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |

---

## **Key Features**

- **Central workflow table** for all reservation processes.
- **Human-readable reservation codes** using format `YYMMDD-XXXX`.
- **Full admin audit tracking** (approved/cancelled with timestamps).
- **Professor information stored directly** (no foreign key).
- **Time and date integrity** ensured through `date_reserved`, `time_start`, and `time_end`.
- **Supports linking to key issuance records** via the `key_issuance` table.
- **Highly normalized**—equipment is stored separately under `reservation_equipment`.

---

## **Table Notes**

1. Many fields (verification/cancellation) remain `NULL` for new reservations.
2. Cancellation fields only populate when the admin cancels the request.
3. Simple, clean reservation workflow:
   - `Pending` → `Approved` → `Completed`  
   or  
   - `Pending`/`Approved` → `Cancelled`
4. Referential integrity maintained through FKs (`user_id`, `room_id`, `cancelled_by`, `verified_by`).
5. Auto-managed auditing via `created_at` and `updated_at`.

---

## **Relationships**

- **1 Reservation → Many Equipment Items**  
  `reservations.id` → reservation_equipment.reservation_id  

- **1 Reservation → 0 or 1 Key Issuance**  
  (Linked in the `key_issuance` table)

- **Many Reservations → 1 User**  
  (user_id → profiles)

- **Many Reservations → 1 Admin for Approval/Cancellation**  
  (verified_by / cancelled_by → admin_data)

---

## **Sample Entry**

```text
id: 150
reservation_number: "251107-0001"
user_id: 14
room_id: 5
subject_code: "CPE423"
professor_name: "Prof. Maria L. Reyes"
professor_email: "mreyes@pup.edu.ph"
professor_contact_number: "09171234567"
professor_status: "Regular"
date_reserved: 2025-11-10
time_start: 13:00:00
time_end: 15:00:00
status: "Pending"
verified_by: NULL
verified_at: NULL
cancelled_by: NULL
cancel_reason: NULL
created_at: 2025-11-07 01:45:10
updated_at: 2025-11-07 01:45:10
