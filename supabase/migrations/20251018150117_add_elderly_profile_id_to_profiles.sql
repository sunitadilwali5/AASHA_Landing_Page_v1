/*
  # Add elderly_profile_id to Profiles Table

  ## Overview
  This migration adds a bidirectional relationship between profiles and elderly_profiles
  by adding an elderly_profile_id column to the profiles table. This enables quick lookups
  from a user's profile to their associated elderly profile information.

  ## Changes

  1. New Column
    - `elderly_profile_id` (uuid, nullable) - Foreign key reference to elderly_profiles table
    - Nullable to support existing profiles and registration flows
    - Set to ON DELETE SET NULL to handle elderly profile deletions gracefully

  2. Indexes
    - Add index on elderly_profile_id for efficient lookups and joins

  3. Documentation
    - Add column comment explaining the purpose and usage

  ## Use Cases

  1. For "myself" registration:
    - User profile links to their own elderly profile
    - Enables quick access to elderly profile data from the user's auth session

  2. For "loved-one" registration:
    - Caregiver profile links to the loved one's elderly profile
    - Enables family dashboard to quickly access elderly profile information

  ## Security
    - Existing RLS policies on profiles table continue to apply
    - Users can only access profiles they own or have permission to view
*/

-- Add elderly_profile_id column to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS elderly_profile_id uuid
  REFERENCES elderly_profiles(id) ON DELETE SET NULL;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_profiles_elderly_profile_id
  ON profiles(elderly_profile_id);

-- Add documentation comment
COMMENT ON COLUMN profiles.elderly_profile_id IS 'Links to the associated elderly_profiles record. For "myself" registration, this is the user''s own elderly profile. For "loved-one" registration, this is the caregiver''s loved one''s elderly profile. Populated during onboarding after elderly_profile is created.';