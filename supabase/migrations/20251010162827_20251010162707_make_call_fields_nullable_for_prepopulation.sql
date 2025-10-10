/*
  # Make Call Table Fields Nullable for Pre-population

  ## Overview
  This migration modifies the calls table to support pre-populating call records
  with only elderly_profile_id immediately after user onboarding, before the
  actual Retell call is initiated and completed.

  ## Changes

  1. Modified Columns
    - `retell_call_id` - Changed from NOT NULL to nullable, unique constraint updated to allow NULLs
    - `call_type` - Changed from NOT NULL to nullable with default 'onboarding'
    - `call_status` - Changed from NOT NULL to nullable (will be filled when call completes)
    - `elderly_profile_id` - Remains NOT NULL (required field for pre-population)

  2. Updated Constraints
    - Remove NOT NULL constraints from retell_call_id, call_type, call_status
    - Keep unique constraint on retell_call_id but allow multiple NULL values

  3. Updated Indexes
    - Add composite index on (elderly_profile_id, retell_call_id) for efficient lookups
    - Add index on (elderly_profile_id, created_at) for finding recent pre-populated records

  ## Use Case

  When a user completes onboarding:
  1. System creates call record with only elderly_profile_id and created_at
  2. External n8n workflow receives webhook and initiates Retell call
  3. When Retell webhook is received, system updates the existing call record with:
     - retell_call_id
     - call_type
     - call_status
     - ended_at
     - duration_seconds
     - All other call details

  ## Security
    - All existing RLS policies remain unchanged
    - Pre-populated records are still protected by elderly_profile_id checks
*/

-- Drop the existing NOT NULL constraint on retell_call_id and make it nullable
ALTER TABLE calls ALTER COLUMN retell_call_id DROP NOT NULL;

-- Drop the existing NOT NULL constraint on call_type and make it nullable with default
ALTER TABLE calls ALTER COLUMN call_type DROP NOT NULL;
ALTER TABLE calls ALTER COLUMN call_type SET DEFAULT 'onboarding';

-- Drop the existing NOT NULL constraint on call_status and make it nullable
ALTER TABLE calls ALTER COLUMN call_status DROP NOT NULL;

-- Create composite index for efficient lookups when updating pre-populated records
CREATE INDEX IF NOT EXISTS idx_calls_elderly_profile_retell_call
  ON calls(elderly_profile_id, retell_call_id);

-- Create index for finding recent pre-populated records
CREATE INDEX IF NOT EXISTS idx_calls_elderly_profile_created_at
  ON calls(elderly_profile_id, created_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN calls.retell_call_id IS 'Unique call ID from Retell. NULL until call is initiated. Populated when Retell webhook is received.';
COMMENT ON COLUMN calls.call_type IS 'Type of call (onboarding or daily_checkin). Defaults to onboarding. NULL for pre-populated records until call is initiated.';
COMMENT ON COLUMN calls.call_status IS 'Call completion status. NULL for pre-populated records until call completes.';
