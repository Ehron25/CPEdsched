## **equipment Table**

### **Purpose:**
Stores information about equipment available for reservation in the PUP College of Engineering Computer Engineering Laboratory system. This table tracks equipment inventory, quantities, and availability status. Each row represents a specific equipment item/model, organized under broader categories through a foreign key relationship with the `equipment_category` table.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **equipment_id** | INT | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for each equipment item/model |
| **equipment_name** | VARCHAR(255) | NOT NULL | Specific name of the equipment item (e.g., "Projector", "HDMI Cable", "Digital Multi-Tester") |
| **category_id** | INT | FOREIGN KEY, NOT NULL | References equipment_categories(category_id) - the category this equipment belongs to |
| **total_quantity** | INT | NOT NULL | Total number of units available in inventory |
| **available_quantity** | INT | NOT NULL | Current number of units available for reservation (not borrowed/in use) |
| **equipment_status** | ENUM('Active', 'Discontinued') | NOT NULL, DEFAULT 'Active' | Status indicating if this equipment item is active in the system |
| **updated_at** | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Timestamp when the equipment record was last modified |

### **Key Features:**

**Normalized Structure:**
- **category_id**: Foreign key reference to `equipment_categories` table
- Eliminates data redundancy (category name stored once)
- Ensures data consistency and integrity
- Easy category name updates without touching equipment records

**Hierarchical Organization:**
- Equipment items organized under standardized categories
- Each equipment name is a distinct inventory item with its own quantities
- Categories maintained in separate lookup table

**Inventory Management:**
- Tracks both total and available quantities for each specific equipment item
- Real-time availability tracking for reservations
- Automatic timestamp updates on any change

**Quantity Tracking:**
- **total_quantity**: Total units of this specific equipment item owned
- **available_quantity**: Units currently available for reservation
- **In-use calculation**: `total_quantity - available_quantity = borrowed/in-use`

**Status Management:**
- **Active**: Equipment item is currently available in the system for reservations
- **Discontinued**: Equipment item no longer being acquired; existing units can be used until depleted

### **Relationship to equipment_categories:**

**Parent Table: `equipment_categories`**
```
category_id (PK) | category_name
-----------------|----------------------------------
1                | Audiovisual Equipment
2                | Classroom Essentials
3                | Electrical & Electronic Equipment
4                | Hardware Equipment
5                | Network Equipment
6                | Breadboarding Components
```

**Child Table: `equipment` (this table)**
```
equipment_id | equipment_name  | category_id | total_qty | available_qty
-------------|-----------------|-------------|-----------|---------------
1            | Projector       | 1           | 15        | 12
2            | HDMI Cable      | 1           | 50        | 45
15           | LED             | 6           | 500       | 450
```

**Relationship:**
```
equipment_categories (1)
    ↓ One-to-Many
equipment (Many)
    ↓ One-to-Many
reservation_equipment (Many)
```

### **Business Rules:**

1. **Category Assignment:**
   - Every equipment item must belong to exactly one category
   - `category_id` is NOT NULL and must reference valid category
   - Cannot create equipment without valid category

2. **Quantity Constraints:**
   - `available_quantity` must always be ≤ `total_quantity`
   - `available_quantity` cannot be negative
   - When `available_quantity = 0`, that specific equipment item is fully borrowed

3. **Equipment Status:**
   - **Active**: Equipment item is in circulation and can be reserved
   - **Discontinued**: No longer ordering/acquiring this equipment item, but existing units can still be used

4. **Inventory Updates:**
   - When equipment is reserved: `available_quantity` decreases for that specific item
   - When equipment is returned: `available_quantity` increases for that specific item
   - `total_quantity` changes only when items are added/removed (purchased, damaged, lost)
   - `updated_at` automatically records all changes

5. **Category Integrity:**
   - Foreign key prevents deletion of categories that have equipment
   - Cannot assign invalid `category_id` to equipment
   - Database enforces referential integrity

### **Sample Data:**

**Equipment with Category References:**

```
equipment_id: 1
equipment_name: Projector
category_id: 1  (→ Audiovisual Equipment)
total_quantity: 15
available_quantity: 12
equipment_status: Active
updated_at: 2024-11-05 14:30:00

equipment_id: 2
equipment_name: HDMI Cable
category_id: 1  (→ Audiovisual Equipment)
total_quantity: 50
available_quantity: 45
equipment_status: Active
updated_at: 2024-11-05 14:30:00

equipment_id: 15
equipment_name: Digital Oscilloscope
category_id: 3  (→ Electrical & Electronic Equipment)
total_quantity: 10
available_quantity: 7
equipment_status: Active
updated_at: 2024-11-05 16:00:00

equipment_id: 30
equipment_name: LED
category_id: 6  (→ Breadboarding Components)
total_quantity: 500
available_quantity: 450
equipment_status: Active
updated_at: 2024-11-05 10:00:00

equipment_id: 45
equipment_name: Laptop
category_id: 4  (→ Hardware Equipment)
total_quantity: 20
available_quantity: 15
equipment_status: Active
updated_at: 2024-11-05 11:00:00
```

### **Relationships:**

**Parent:**
- **equipment_categories**: Each equipment item belongs to one category
  - `equipment.category_id` → `equipment_categories.category_id`

**Referenced by:**
- **reservation_equipment table**: Links reservations to equipment
  - `reservation_equipment.equipment_id` → `equipment.equipment_id`
  - Tracks which specific items were reserved with quantities
  
- **equipment_returns table**: Tracks equipment returns
  - `equipment_returns.equipment_id` → `equipment.equipment_id`
  - Records the condition of returned items

**Data Flow:**
```
equipment_categories (Category master list)
    ↓ (category_id FK)
equipment (Equipment inventory)
    ↓ (equipment_id FK)
reservation_equipment (Reservation details)
    ↓
equipment_returns (Return tracking)
```

### **Usage Examples:**

**Browse equipment by category (with JOIN):**
```sql
SELECT 
    e.equipment_name,
    e.available_quantity,
    e.total_quantity,
    ec.category_name
FROM equipment e
JOIN equipment_categories ec ON e.category_id = ec.category_id
WHERE ec.category_name = 'Audiovisual Equipment'
  AND e.equipment_status = 'Active'
  AND e.available_quantity > 0
ORDER BY e.equipment_name;

-- Results show category name from lookup table
```

**Get all equipment with category info:**
```sql
SELECT 
    ec.category_name,
    e.equipment_name,
    e.available_quantity,
    e.total_quantity,
    (e.total_quantity - e.available_quantity) as in_use
FROM equipment e
JOIN equipment_categories ec ON e.category_id = ec.category_id
WHERE e.equipment_status = 'Active'
ORDER BY ec.category_name, e.equipment_name;
```

**List all categories with equipment counts:**
```sql
SELECT 
    ec.category_id,
    ec.category_name,
    COUNT(e.equipment_id) as total_items,
    SUM(e.total_quantity) as total_units,
    SUM(e.available_quantity) as available_units
FROM equipment_categories ec
LEFT JOIN equipment e ON ec.category_id = e.category_id
WHERE e.equipment_status = 'Active' OR e.equipment_id IS NULL
GROUP BY ec.category_id
ORDER BY ec.category_name;
```

**Check equipment availability by category:**
```sql
SELECT 
    ec.category_name,
    e.equipment_name,
    e.available_quantity,
    CASE 
        WHEN e.available_quantity = 0 THEN 'Out of Stock'
        WHEN e.available_quantity < 5 THEN 'Low Stock'
        ELSE 'In Stock'
    END as stock_status
FROM equipment e
JOIN equipment_categories ec ON e.category_id = ec.category_id
WHERE e.equipment_status = 'Active'
ORDER BY ec.category_name, e.equipment_name;
```

**Find equipment across categories:**
```sql
-- Search for all oscilloscopes regardless of category
SELECT 
    ec.category_name,
    e.equipment_name,
    e.available_quantity,
    e.total_quantity
FROM equipment e
JOIN equipment_categories ec ON e.category_id = ec.category_id
WHERE e.equipment_name LIKE '%Oscilloscope%'
  AND e.equipment_status = 'Active';
```

**Category utilization report:**
```sql
SELECT 
    ec.category_name,
    COUNT(e.equipment_id) as items_count,
    SUM(e.total_quantity) as total_units,
    SUM(e.available_quantity) as available_units,
    SUM(e.total_quantity - e.available_quantity) as borrowed_units,
    ROUND(SUM(e.total_quantity - e.available_quantity) / SUM(e.total_quantity) * 100, 2) as utilization_percent
FROM equipment_categories ec
JOIN equipment e ON ec.category_id = e.category_id
WHERE e.equipment_status = 'Active'
GROUP BY ec.category_id
ORDER BY utilization_percent DESC;
```

**Rename category (affects all equipment automatically):**
```sql
-- Update category name once
UPDATE equipment_categories
SET category_name = 'Audio-Visual Equipment'
WHERE category_id = 1;

-- All equipment with category_id = 1 now shows new name
-- No need to update equipment table!
```

### **Foreign Key Configuration:**

**In MySQL Workbench Foreign Keys tab:**

| Foreign Key Name | Referenced Table | Column | Referenced Column |
|-----------------|------------------|---------|-------------------|
| fk_equipment_category | equipment_categories | category_id | category_id |

**Recommended Constraints:**
- **ON DELETE:** RESTRICT (prevent deletion of categories that have equipment)
- **ON UPDATE:** CASCADE (if category_id changes, update all equipment references)

**SQL Statement:**
```sql
ALTER TABLE equipment
ADD CONSTRAINT fk_equipment_category
FOREIGN KEY (category_id) REFERENCES equipment_categories(category_id)
ON DELETE RESTRICT
ON UPDATE CASCADE;
```

### **Data Validation Rules:**

1. **Valid Category:**
   - `category_id` must exist in `equipment_categories` table
   - Foreign key constraint enforces this automatically
   - Cannot insert equipment with an invalid category_id

2. **Quantity Validation:**
   - Before reservation: `available_quantity >= requested_quantity`
   - After return: `available_quantity <= total_quantity`
   - No negative quantities allowed

3. **Status Management:**
   - Active equipment appears in the borrower's form
   - Discontinued equipment is hidden from form but maintains historical data
   - Out of stock items (available_quantity = 0) displayed as "Out of Stock"

4. **Naming Standards:**
   - Use official names from CPE Laboratory Borrower's Slip
   - Maintain consistent naming conventions
   - Clear, descriptive equipment names


### **Design Notes:**

- **Normalized (3NF)**: category_id references separate lookup table
- **Data Integrity**: Foreign key constraints enforce valid categories
- **Consistency**: Category names managed centrally
- **Performance**: INT foreign key faster than VARCHAR category names
- **Scalability**: Easy to add category metadata without touching equipment
- **Maintainability**: Update category once, affects all related equipment
- **Flexibility**: Can restructure categories without massive data migration

