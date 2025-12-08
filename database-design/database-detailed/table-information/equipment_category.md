## **equipment_category Table**

### **Purpose:**
Stores the standardized categories used to organize and classify equipment in the CPE Laboratory system. This lookup table maintains the six official equipment categories from the CPE Laboratory Borrower's Slip, providing consistent classification for all laboratory equipment items.

### **Table Structure:**

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| **category_id** | INT | PRIMARY KEY, AUTO_INCREMENT, NOT NULL | Unique identifier for each equipment category |
| **category_name** | VARCHAR(150) | UNIQUE, NOT NULL | Official name of the equipment category |
| **description** | VARCHAR(500) | NULL | Optional description explaining the category's purpose and what types of equipment it includes |

### **Key Features:**

**Standardized Classification:**
- Maintains official CPE Laboratory equipment categories
- Ensures consistent categorization across all equipment
- Prevents typos and naming inconsistencies

**Normalized Structure:**
- Single source of truth for category names
- Equipment table references this table via `category_id` foreign key
- Update category name once to affect all related equipment

**Flexible Documentation:**
- Optional description field for category details
- Helps administrators understand category scope
- Provides guidance for equipment classification

### **Table Notes:**

1. **Standard Categories:**
   - Based on CPE Laboratory Borrower's Slip official classification
   - Six primary categories cover all laboratory equipment
   - Category names must match official documentation exactly

2. **Category Relationships:**
   - One category can have many equipment items (one-to-many)
   - Equipment table references this table via `category_id`
   - Cannot delete category if equipment items exist under it

3. **Data Integrity:**
   - UNIQUE constraint on `category_name` prevents duplicates
   - Categories rarely added/modified (stable reference data)
   - Descriptions optional but recommended for clarity

4. **Standard CPE Laboratory Categories:**
   ```
   1. Audiovisual Equipment
   2. Classroom Essentials
   3. Electrical & Electronic Equipment
   4. Hardware Equipment
   5. Network Equipment
   6. Breadboarding Components
   ```

### **Sample Data:**

```
category_id: 1
category_name: Audiovisual Equipment
description: Projectors, cables, TV equipment, and audio-visual accessories for presentations and multimedia use

category_id: 2
category_name: Classroom Essentials
description: Basic classroom furniture, supplies, and tools including chairs, markers, calculators, and fans

category_id: 3
category_name: Electrical & Electronic Equipment
description: Testing and measurement instruments including oscilloscopes, multimeters, power supplies, and soldering equipment

category_id: 4
category_name: Hardware Equipment
description: Computing hardware and peripherals including laptops, monitors, keyboards, mice, and computer accessories

category_id: 5
category_name: Network Equipment
description: Networking tools, cables, connectors, and devices for network installation and maintenance

category_id: 6
category_name: Breadboarding Components
description: Electronic components for circuit prototyping including resistors, capacitors, LEDs, ICs, and breadboards
```

### **Foreign Key Configuration:**

**Referenced by:**
- **equipment.category_id** → `equipment_category.category_id`
  - Each equipment item belongs to one category
  - ON DELETE: RESTRICT (prevents deletion of categories with equipment)
  - ON UPDATE: CASCADE (updates equipment if category_id changes)

### **Data Validation Rules:**

1. **Category Name:**
   - Cannot be NULL or empty
   - Must be unique across all categories
   - Use exact spelling from CPE Laboratory documentation
   - Maximum 150 characters
   - Recommended format: Title Case (e.g., "Audiovisual Equipment")

2. **Description:**
   - Maximum 500 characters
   - Should clearly explain category scope and equipment types
   - Use complete sentences for clarity

3. **Uniqueness:**
   - UNIQUE constraint on `category_name` enforced by database
   - Case-sensitive comparison (maintain consistent capitalization)
   - No duplicate category names allowed

4. **Deletion Protection:**
   - Cannot delete category if equipment items reference it
   - Foreign key RESTRICT constraint prevents orphaned equipment
   - Must reassign or delete equipment before removing category

### **Design Notes:**

- **Lookup Table**: Serves as reference data for equipment classification
- **Normalized Design**: Eliminates data redundancy in equipment table
- **Stable Data**: Categories rarely change once established
- **Six Standard Categories**: Based on CPE Laboratory official classification
- **One-to-Many**: One category maps to many equipment items
- **Data Integrity**: Foreign key and UNIQUE constraints ensure consistency
- **Small Table Size**: Only 6 records, minimal storage and fast lookups
- **Central Management**: Update category name once to affect all equipment
- **Professional Structure**: Industry-standard lookup table pattern

---
