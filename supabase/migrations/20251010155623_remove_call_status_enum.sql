/*
  # Remove call_status enum constraint

  ## Overview
  This migration converts the `call_status` column from an enum type to a text type,
  providing more flexibility for adding new status values without requiring schema changes.

  ## Changes

  1. Schema Changes
    - Convert `calls.call_status` from `call_status_enum` to `text` type
    - Preserve existing data during conversion
    - Keep the column as NOT NULL with a default value

  2. Data Safety
    - All existing enum values ('successful', 'voicemail', 'failed') remain valid as text
    - No data loss occurs during the conversion
    - Default value set to empty string for backward compatibility

  ## Notes
  - The old enum type `call_status_enum` is not dropped to avoid issues with existing data
  - Application code can now use any string value for call_status
  - Consider adding application-level validation if specific status values are required
*/

-- Step 1: Alter the column to text type
-- First, we need to convert the column using the enum's text representation
ALTER TABLE calls
  ALTER COLUMN call_status TYPE text
  USING call_status::text;

-- Step 2: Set a default value (optional, keeping it flexible)
ALTER TABLE calls
  ALTER COLUMN call_status SET DEFAULT '';

-- Note: We're keeping the column as NOT NULL
-- If you want to make it nullable, you can run:
-- ALTER TABLE calls ALTER COLUMN call_status DROP NOT NULL;
