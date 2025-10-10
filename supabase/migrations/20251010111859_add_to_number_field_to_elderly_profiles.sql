/*
  # Add to_number field for Retell API integration

  ## Changes
  
  1. New Column
    - `to_number` (text) - Complete phone number for Retell API (country code + phone number without spaces)
      - Format: "+12025551234" or "+919876543210"
      - Auto-generated from country_code and phone_number
      - Indexed for performance
  
  2. Database Function
    - `generate_to_number()` - Automatically generates to_number by concatenating country_code and phone_number
    - Removes all non-digit characters except the leading +
  
  3. Database Trigger
    - Automatically updates to_number on INSERT or UPDATE of phone_number or country_code
    - Ensures to_number stays synchronized with source fields
  
  4. Data Backfill
    - Backfills to_number for all existing elderly_profiles records
    - Uses existing country_code and phone_number values
  
  ## Security
    - Inherits RLS policies from elderly_profiles table
    - No additional policies needed as field is derived from existing secured fields
*/

-- Add to_number column to elderly_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'elderly_profiles' AND column_name = 'to_number'
  ) THEN
    ALTER TABLE elderly_profiles ADD COLUMN to_number text;
  END IF;
END $$;

-- Create function to generate to_number from country_code and phone_number
CREATE OR REPLACE FUNCTION generate_to_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Concatenate country_code and phone_number, removing any spaces or special characters
  -- Keep only digits and the leading + from country code
  NEW.to_number := NEW.country_code || regexp_replace(NEW.phone_number, '[^0-9]', '', 'g');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate to_number on INSERT or UPDATE
DROP TRIGGER IF EXISTS generate_to_number_trigger ON elderly_profiles;
CREATE TRIGGER generate_to_number_trigger
  BEFORE INSERT OR UPDATE OF phone_number, country_code ON elderly_profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_to_number();

-- Backfill to_number for existing records
UPDATE elderly_profiles
SET to_number = country_code || regexp_replace(phone_number, '[^0-9]', '', 'g')
WHERE to_number IS NULL OR to_number = '';

-- Create index on to_number for performance
CREATE INDEX IF NOT EXISTS idx_elderly_profiles_to_number ON elderly_profiles(to_number);

-- Add comment for documentation
COMMENT ON COLUMN elderly_profiles.to_number IS 'Complete phone number for Retell API in format: country_code + phone_number (e.g., +12025551234)';
