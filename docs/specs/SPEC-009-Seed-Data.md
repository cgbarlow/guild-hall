# SPEC-009: Seed Data

| Field | Value |
|-------|-------|
| **Specification ID** | SPEC-009 |
| **Parent ADR** | N/A (Implementation Detail) |
| **Version** | 1.0 |
| **Status** | Accepted |
| **Last Updated** | 2025-01-24 |

---

## Overview

This specification documents the seed data approach for Guild Hall, including the `is_test_data` flag mechanism and sample Agentics-NZ quests for demonstration purposes.

---

## Test Data Flag

### Purpose

The `is_test_data` flag allows sample/demonstration data to be:

1. **Easily identified** in the database
2. **Cleanly removed** when transitioning to production
3. **Excluded from analytics** and reporting if needed
4. **Distinguished from real user-created content**

### Schema Addition

```sql
ALTER TABLE quests ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN DEFAULT false;
```

### Usage Patterns

**Inserting test data:**
```sql
INSERT INTO quests (title, description, ..., is_test_data)
VALUES ('Sample Quest', 'This is a sample...', ..., true);
```

**Querying non-test data:**
```sql
SELECT * FROM quests WHERE is_test_data = false OR is_test_data IS NULL;
```

**Removing all test data:**
```sql
-- Remove test quests (cascades to objectives, user_quests, etc.)
DELETE FROM quests WHERE is_test_data = true;
```

### Important Notes

- The flag only applies to `quests` table
- Categories are NOT flagged as test data (they are legitimate categories)
- Achievements are NOT flagged (they are system-wide definitions)
- Cascading deletes handle related records (objectives, user_quests, user_objectives)

---

## Agentics-NZ Sample Data

### Purpose

Sample quests themed around the Agentics-NZ AI community demonstrate:

1. Quest structure with multiple objectives
2. Objective dependencies (sequential unlocking)
3. Point distribution across objectives
4. Evidence type requirements
5. Realistic community engagement scenarios

### Categories

The following categories support Agentics-NZ themed quests:

| Category | Description | Icon | Order |
|----------|-------------|------|-------|
| AI Development | Building AI applications, models, and tools | robot | 80 |
| Community Building | Growing and nurturing tech communities | handshake | 90 |
| Knowledge Sharing | Teaching, mentoring, and documentation | book-open | 100 |
| Open Source | Contributing to open source projects | code-branch | 110 |
| Technical Writing | Blogs, tutorials, and technical documentation | pen-fancy | 120 |

### Sample Quests

#### 1. Complete AI Safety Course
- **Category:** Knowledge Sharing
- **Points:** 50
- **Objectives:** 3
- **Theme:** Learn fundamentals of AI safety and alignment

#### 2. Contribute to Open Source AI Project
- **Category:** Open Source
- **Points:** 100
- **Objectives:** 4
- **Theme:** Make meaningful contribution to an AI/ML project

#### 3. Write Technical Blog Post
- **Category:** Technical Writing
- **Points:** 75
- **Objectives:** 4
- **Theme:** Create and publish educational content

#### 4. Host Community Workshop
- **Category:** Community Building
- **Points:** 150
- **Objectives:** 5
- **Theme:** Organize and deliver a workshop for the community

#### 5. Build AI Demo Application
- **Category:** AI Development
- **Points:** 200
- **Objectives:** 5
- **Theme:** Create a working AI-powered demonstration

---

## Seed File Structure

```
supabase/seed/
  categories.sql      -- Additional Agentics-NZ categories
  quests-agentics.sql -- Sample quests with is_test_data=true
  achievements.sql    -- Achievement definitions (if additional needed)
```

### Loading Seed Data

**Via psql:**
```bash
psql $DATABASE_URL -f supabase/seed/categories.sql
psql $DATABASE_URL -f supabase/seed/quests-agentics.sql
```

**Via Supabase CLI:**
```bash
supabase db reset --seed
```

### Removing Test Data

**Before production launch:**
```sql
-- 1. Remove test quests (cascades to objectives, user_quests, etc.)
DELETE FROM quests WHERE is_test_data = true;

-- 2. Verify removal
SELECT COUNT(*) FROM quests WHERE is_test_data = true;
-- Expected: 0
```

---

## Dependency Chain Example

The sample quests demonstrate proper objective dependencies:

```
Quest: "Build AI Demo Application"

Objective 1: "Research AI APIs" (no dependency)
    |
    v
Objective 2: "Design Application Architecture" (depends on 1)
    |
    v
Objective 3: "Implement Core Features" (depends on 2)
    |
    v
Objective 4: "Add User Interface" (depends on 3)
    |
    v
Objective 5: "Deploy and Demo" (depends on 4)
```

This ensures users must complete objectives sequentially, demonstrating the unlock mechanism.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-24 | Initial specification for seed data approach |
