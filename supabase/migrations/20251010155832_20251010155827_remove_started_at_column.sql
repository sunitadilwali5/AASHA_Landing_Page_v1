/*
  # Remove started_at column from calls table

  ## Overview
  This migration removes the `started_at` column from the `calls` table as it's not needed.

  ## Changes

  1. Schema Changes
    - Drop `calls.started_at` column

  2. Data Safety
    - Column data will be permanently deleted
    - No foreign key dependencies on this column
*/

-- Remove the started_at column from calls table
ALTER TABLE calls DROP COLUMN IF EXISTS started_at;
