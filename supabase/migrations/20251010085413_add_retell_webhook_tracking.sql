/*
  # Add Retell Webhook Tracking to Calls Table

  This migration adds a tracking field to the calls table to prevent duplicate processing
  of Retell webhooks.

  ## Changes Made
  
  1. Added column:
     - `retell_webhook_received` (boolean, default: false) - Tracks if webhook has been processed
  
  ## Notes
  - This field helps prevent duplicate webhook processing
  - Defaults to false for all new calls
  - Should be set to true once the webhook is successfully processed
  - Note: Index on retell_call_id already exists from previous migration
*/

-- Add retell_webhook_received column to track processed webhooks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calls' AND column_name = 'retell_webhook_received'
  ) THEN
    ALTER TABLE calls ADD COLUMN retell_webhook_received boolean DEFAULT false;
  END IF;
END $$;

-- Create index on retell_call_id if it doesn't exist (for webhook lookups)
CREATE INDEX IF NOT EXISTS idx_calls_retell_call_id ON calls(retell_call_id);
