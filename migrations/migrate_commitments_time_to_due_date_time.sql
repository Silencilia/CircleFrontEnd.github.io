-- Migration: Split commitments.time into due_date and due_time
-- This migration adds two new columns, migrates existing data, and removes the old column

-- Step 1: Add new columns (nullable initially)
ALTER TABLE "public"."commitments"
  ADD COLUMN "due_date" text,
  ADD COLUMN "due_time" text;

-- Step 2: Migrate data from time column to due_date and due_time
-- Parse format like "Dec 20, 2024 16:00" into date "Dec 20, 2024" and time "16:00"
UPDATE "public"."commitments"
SET 
  "due_date" = CASE 
    WHEN "time" ~ '^\w+ \d{1,2}, \d{4}' THEN 
      (regexp_match("time", '^(\w+ \d{1,2}, \d{4})'))[1]
    ELSE 
      NULL
  END,
  "due_time" = CASE 
    WHEN "time" ~ '\d{1,2}:\d{2}$' THEN 
      (regexp_match("time", '(\d{1,2}:\d{2})$'))[1]
    ELSE 
      NULL
  END
WHERE "time" IS NOT NULL;

-- Step 3: Drop the index on the time column (if it exists)
DROP INDEX IF EXISTS "public"."idx_commitments_time";

-- Step 4: Drop the old time column
ALTER TABLE "public"."commitments"
  DROP COLUMN "time";

-- Step 5: Make columns NOT NULL after migration (optional, only if you want to enforce)
-- ALTER TABLE "public"."commitments"
--   ALTER COLUMN "due_date" SET NOT NULL,
--   ALTER COLUMN "due_time" SET NOT NULL;

