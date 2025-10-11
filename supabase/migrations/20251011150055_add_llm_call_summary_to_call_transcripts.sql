/*
  # Add LLM Call Summary to Call Transcripts

  ## Changes
  This migration adds a new column to store the LLM-generated call summary from Retell.

  ### Modified Tables
  - `call_transcripts`
    - Added `llm_call_summary` (text, nullable) - Stores the LLM-generated call summary from Retell

  ## Notes
  - The column is nullable to support existing records
  - This allows storing the detailed LLM call summary separate from the basic call_analysis summary
*/

-- Add llm_call_summary column to call_transcripts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'call_transcripts' AND column_name = 'llm_call_summary'
  ) THEN
    ALTER TABLE call_transcripts ADD COLUMN llm_call_summary text;
  END IF;
END $$;