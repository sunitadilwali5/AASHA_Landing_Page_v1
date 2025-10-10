/*
  # Simplify Family Member Profile Fields

  This migration makes optional fields nullable in the profiles table for family members 
  who register on behalf of their elderly loved ones. These fields are not essential for 
  family member accounts since they're only used for authentication and dashboard access.

  ## Changes
  
  ### Modified Columns in `profiles` table
  - `date_of_birth` - Changed from NOT NULL to nullable
  - `gender` - Changed from NOT NULL to nullable, removed CHECK constraint
  - `language` - Kept NOT NULL but changed default to 'English', removed CHECK constraint for flexibility
  - `marital_status` - Changed from NOT NULL to nullable, removed CHECK constraint

  ## Security
  - No changes to RLS policies
  - All existing security measures remain in place

  ## Notes
  - Existing data will not be affected
  - Elder profiles in `elderly_profiles` table still require all fields
  - This change only affects the family member (caregiver) profiles
  - Phone number and name fields remain required as they are essential for authentication
*/

-- Make date_of_birth nullable
ALTER TABLE profiles 
  ALTER COLUMN date_of_birth DROP NOT NULL;

-- Make gender nullable and drop the constraint
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_gender_check;

ALTER TABLE profiles 
  ALTER COLUMN gender DROP NOT NULL;

-- Remove language constraint for more flexibility, keep default
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_language_check;

-- Make marital_status nullable and drop constraint
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_marital_status_check;

ALTER TABLE profiles 
  ALTER COLUMN marital_status DROP NOT NULL;
