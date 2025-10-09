/*
  # Enhance Conversations and Add Call Scheduling System

  This migration enhances the daily voice call system to support AI agent context,
  call scheduling, and comprehensive tracking of call lifecycle and conversation details.

  ## New Tables

  ### `call_schedules`
  Manages daily call scheduling and lifecycle tracking for elderly users.
  - `id` (uuid, primary key) - Unique call schedule identifier
  - `elderly_profile_id` (uuid, references elderly_profiles.id) - Links to elderly user
  - `scheduled_date` (date, not null) - Date when call is scheduled
  - `scheduled_time_window` (text, not null) - Time window preference: morning, afternoon, evening
  - `scheduled_start_time` (timestamptz, not null) - Exact scheduled start time
  - `status` (text, not null) - Call status: pending, reminded, in_progress, completed, missed, cancelled
  - `reminder_sent_at` (timestamptz) - When reminder was sent to user
  - `actual_call_time` (timestamptz) - When call actually started
  - `retry_count` (integer, default 0) - Number of retry attempts for missed calls
  - `conversation_id` (uuid, references conversations.id) - Links to actual conversation record
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Modified Tables

  ### `conversations` - Enhanced with AI Context Fields
  Added fields to support rich AI agent context and call quality tracking:
  - `call_schedule_id` (uuid) - Links to scheduled call
  - `actual_start_time` (timestamptz) - Actual call start time
  - `actual_end_time` (timestamptz) - Actual call end time
  - `is_first_call` (boolean) - Whether this is the welcome/first call
  - `call_recording_url` (text) - URL/path to call recording
  - `mood_detected` (text) - Overall mood during call: happy, neutral, sad, anxious, confused
  - `sentiment_score` (integer) - Sentiment score from -10 (very negative) to +10 (very positive)
  - `key_topics` (jsonb) - Array of main topics discussed
  - `concerns_raised` (jsonb) - Array of concerns or issues mentioned
  - `action_items` (jsonb) - Array of follow-up actions needed
  - `medications_discussed` (jsonb) - Array of medication IDs or names discussed
  - `events_mentioned` (jsonb) - Array of event IDs or names mentioned
  - `ai_model_version` (text) - AI model version used for this call
  - `call_quality_score` (integer) - Call quality rating from 1 to 10
  - `technical_metadata` (jsonb) - Technical details, errors, performance metrics

  ## Security

  ### Row Level Security (RLS)
  - RLS enabled on call_schedules table
  - Elderly users and their caregivers can access their scheduled calls
  - All operations require authentication

  ## Indexes
  - Performance indexes added for common query patterns
  - Date-based queries for scheduling
  - Status-based queries for call management

  ## Notes
  - Call schedules track the full lifecycle from scheduling to completion
  - Conversations now store rich contextual data for AI agent intelligence
  - Mood and sentiment tracking enables better care monitoring
  - Structured fields (jsonb) allow flexible storage of topics, concerns, and action items
  - Links between schedules and conversations enable complete call history tracking
*/

-- Create call_schedules table
CREATE TABLE IF NOT EXISTS call_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id uuid NOT NULL REFERENCES elderly_profiles(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  scheduled_time_window text NOT NULL CHECK (scheduled_time_window IN ('morning', 'afternoon', 'evening')),
  scheduled_start_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reminded', 'in_progress', 'completed', 'missed', 'cancelled')),
  reminder_sent_at timestamptz,
  actual_call_time timestamptz,
  retry_count integer DEFAULT 0,
  conversation_id uuid REFERENCES conversations(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to conversations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'call_schedule_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN call_schedule_id uuid REFERENCES call_schedules(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'actual_start_time'
  ) THEN
    ALTER TABLE conversations ADD COLUMN actual_start_time timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'actual_end_time'
  ) THEN
    ALTER TABLE conversations ADD COLUMN actual_end_time timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'is_first_call'
  ) THEN
    ALTER TABLE conversations ADD COLUMN is_first_call boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'call_recording_url'
  ) THEN
    ALTER TABLE conversations ADD COLUMN call_recording_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'mood_detected'
  ) THEN
    ALTER TABLE conversations ADD COLUMN mood_detected text CHECK (mood_detected IN ('happy', 'neutral', 'sad', 'anxious', 'confused', 'frustrated', 'content'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'sentiment_score'
  ) THEN
    ALTER TABLE conversations ADD COLUMN sentiment_score integer CHECK (sentiment_score BETWEEN -10 AND 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'key_topics'
  ) THEN
    ALTER TABLE conversations ADD COLUMN key_topics jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'concerns_raised'
  ) THEN
    ALTER TABLE conversations ADD COLUMN concerns_raised jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'action_items'
  ) THEN
    ALTER TABLE conversations ADD COLUMN action_items jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'medications_discussed'
  ) THEN
    ALTER TABLE conversations ADD COLUMN medications_discussed jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'events_mentioned'
  ) THEN
    ALTER TABLE conversations ADD COLUMN events_mentioned jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'ai_model_version'
  ) THEN
    ALTER TABLE conversations ADD COLUMN ai_model_version text DEFAULT 'v1.0';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'call_quality_score'
  ) THEN
    ALTER TABLE conversations ADD COLUMN call_quality_score integer CHECK (call_quality_score BETWEEN 1 AND 10);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'technical_metadata'
  ) THEN
    ALTER TABLE conversations ADD COLUMN technical_metadata jsonb DEFAULT '{}';
  END IF;
END $$;

-- Create indexes for call_schedules
CREATE INDEX IF NOT EXISTS idx_call_schedules_elderly_profile_id ON call_schedules(elderly_profile_id);
CREATE INDEX IF NOT EXISTS idx_call_schedules_scheduled_date ON call_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_call_schedules_status ON call_schedules(status);
CREATE INDEX IF NOT EXISTS idx_call_schedules_scheduled_start_time ON call_schedules(scheduled_start_time);
CREATE INDEX IF NOT EXISTS idx_call_schedules_conversation_id ON call_schedules(conversation_id);

-- Create indexes for enhanced conversations fields
CREATE INDEX IF NOT EXISTS idx_conversations_call_schedule_id ON conversations(call_schedule_id);
CREATE INDEX IF NOT EXISTS idx_conversations_is_first_call ON conversations(is_first_call) WHERE is_first_call = true;
CREATE INDEX IF NOT EXISTS idx_conversations_mood_detected ON conversations(mood_detected);
CREATE INDEX IF NOT EXISTS idx_conversations_actual_start_time ON conversations(actual_start_time);

-- Enable Row Level Security on call_schedules
ALTER TABLE call_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for call_schedules table
CREATE POLICY "Users can view call schedules for their elderly profiles"
  ON call_schedules FOR SELECT
  TO authenticated
  USING (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert call schedules for their elderly profiles"
  ON call_schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update call schedules for their elderly profiles"
  ON call_schedules FOR UPDATE
  TO authenticated
  USING (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  )
  WITH CHECK (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete call schedules for their elderly profiles"
  ON call_schedules FOR DELETE
  TO authenticated
  USING (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

-- Create trigger for call_schedules updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_call_schedules_updated_at'
  ) THEN
    CREATE TRIGGER update_call_schedules_updated_at
      BEFORE UPDATE ON call_schedules
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
