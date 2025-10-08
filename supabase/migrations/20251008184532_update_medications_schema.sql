/*
  # Update Medications Table Schema

  This migration updates the medications table to support the new simplified medication tracking interface.

  ## Changes Made
  
  1. Removed columns:
     - `frequency` (text) - Replaced by times_of_day array
     - `time` (time) - Replaced by times_of_day array
  
  2. Added columns:
     - `dosage_quantity` (integer, not null, default 1) - Number of tablets/units to take
     - `times_of_day` (text[], not null, default '{}') - Array of when to take medication (Morning, Afternoon, Evening, Night)
  
  3. Removed old column:
     - `dosage` (text) - No longer needed as we track quantity as integer

  ## Notes
  - Existing medications will need to be migrated manually if any exist
  - The times_of_day array stores: 'Morning', 'Afternoon', 'Evening', 'Night'
  - Dosage quantity defaults to 1 tablet/unit
  - Data safety: Using conditional logic to avoid errors if columns already exist/don't exist
*/

DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'medications' AND column_name = 'dosage_quantity'
  ) THEN
    ALTER TABLE medications ADD COLUMN dosage_quantity integer NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'medications' AND column_name = 'times_of_day'
  ) THEN
    ALTER TABLE medications ADD COLUMN times_of_day text[] NOT NULL DEFAULT '{}';
  END IF;

  -- Drop old columns if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'medications' AND column_name = 'dosage'
  ) THEN
    ALTER TABLE medications DROP COLUMN dosage;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'medications' AND column_name = 'frequency'
  ) THEN
    ALTER TABLE medications DROP COLUMN frequency;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'medications' AND column_name = 'time'
  ) THEN
    ALTER TABLE medications DROP COLUMN time;
  END IF;
END $$;

-- Add check constraint to ensure times_of_day contains valid values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'medications_times_of_day_check'
  ) THEN
    ALTER TABLE medications ADD CONSTRAINT medications_times_of_day_check
      CHECK (times_of_day <@ ARRAY['Morning', 'Afternoon', 'Evening', 'Night']::text[]);
  END IF;
END $$;

-- Add check constraint to ensure dosage_quantity is positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'medications_dosage_quantity_check'
  ) THEN
    ALTER TABLE medications ADD CONSTRAINT medications_dosage_quantity_check
      CHECK (dosage_quantity > 0);
  END IF;
END $$;
