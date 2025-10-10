/*
  # Change call_type from enum to open text field

  ## Changes
  1. Modifications
    - Drop the call_type_enum constraint from calls.call_type column
    - Convert call_type column from call_type_enum to TEXT type
    - This allows storing any text value for call_type instead of only 'onboarding' or 'daily_checkin'

  ## Notes
  - Existing data will be preserved during the conversion
  - The enum type itself is not dropped in case other code references it, but the column no longer uses it
*/

-- Drop the enum constraint and change column type to TEXT
ALTER TABLE calls 
  ALTER COLUMN call_type DROP DEFAULT,
  ALTER COLUMN call_type TYPE TEXT USING call_type::TEXT,
  ALTER COLUMN call_type SET DEFAULT '';
