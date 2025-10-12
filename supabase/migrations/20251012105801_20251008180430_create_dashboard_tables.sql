/*
  # Dashboard Tables for Elderly Care Management

  This migration creates tables to support the elderly dashboard functionality including
  conversation tracking, special events management, and medication adherence tracking.

  ## New Tables

  ### `conversations`
  Stores conversation history between Aasha AI and elderly users.
  - `id` (uuid, primary key) - Unique conversation identifier
  - `elderly_profile_id` (uuid, references elderly_profiles.id) - Links to elderly user
  - `conversation_date` (timestamptz, not null) - When the conversation occurred
  - `duration_minutes` (integer, not null) - Length of conversation in minutes
  - `summary` (text, not null) - Brief summary of conversation topics
  - `full_transcript` (text) - Complete conversation transcript (optional)
  - `created_at` (timestamptz) - Record creation timestamp

  ### `special_events`
  Stores important dates and events for elderly users.
  - `id` (uuid, primary key) - Unique event identifier
  - `elderly_profile_id` (uuid, references elderly_profiles.id) - Links to elderly user
  - `event_name` (text, not null) - Name of the event
  - `event_date` (date, not null) - When the event occurs
  - `event_type` (text, not null) - Category: birthday, anniversary, appointment, family_visit, holiday, other
  - `description` (text) - Additional event details
  - `is_recurring` (boolean, default false) - Whether event repeats annually
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `medication_tracking`
  Tracks medication adherence for elderly users.
  - `id` (uuid, primary key) - Unique tracking record identifier
  - `medication_id` (uuid, references medications.id) - Links to medication
  - `scheduled_datetime` (timestamptz, not null) - When medication should be taken
  - `taken_datetime` (timestamptz) - When medication was actually taken
  - `status` (text, not null) - taken, missed, or skipped
  - `notes` (text) - Optional notes about the medication event
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Elderly users can only access their own data
  - Caregivers can access data for elderly profiles they manage
  - All operations require authentication

  ## Notes
  - Conversations store both summaries and full transcripts for flexibility
  - Special events support recurring annual events like birthdays
  - Medication tracking links to existing medications table for complete history
  - Indexes added for performance on common queries
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id uuid NOT NULL REFERENCES elderly_profiles(id) ON DELETE CASCADE,
  conversation_date timestamptz NOT NULL DEFAULT now(),
  duration_minutes integer NOT NULL DEFAULT 0,
  summary text NOT NULL DEFAULT '',
  full_transcript text,
  created_at timestamptz DEFAULT now()
);

-- Create special_events table
CREATE TABLE IF NOT EXISTS special_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id uuid NOT NULL REFERENCES elderly_profiles(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  event_date date NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('birthday', 'anniversary', 'appointment', 'family_visit', 'holiday', 'other')),
  description text DEFAULT '',
  is_recurring boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medication_tracking table
CREATE TABLE IF NOT EXISTS medication_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  scheduled_datetime timestamptz NOT NULL,
  taken_datetime timestamptz,
  status text NOT NULL CHECK (status IN ('taken', 'missed', 'skipped')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_elderly_profile_id ON conversations(elderly_profile_id);
CREATE INDEX IF NOT EXISTS idx_conversations_date ON conversations(conversation_date DESC);
CREATE INDEX IF NOT EXISTS idx_special_events_elderly_profile_id ON special_events(elderly_profile_id);
CREATE INDEX IF NOT EXISTS idx_special_events_date ON special_events(event_date);
CREATE INDEX IF NOT EXISTS idx_medication_tracking_medication_id ON medication_tracking(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_tracking_scheduled ON medication_tracking(scheduled_datetime DESC);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations table
CREATE POLICY "Users can view conversations for their elderly profiles"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert conversations for their elderly profiles"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

-- RLS Policies for special_events table
CREATE POLICY "Users can view special events for their elderly profiles"
  ON special_events FOR SELECT
  TO authenticated
  USING (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert special events for their elderly profiles"
  ON special_events FOR INSERT
  TO authenticated
  WITH CHECK (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update special events for their elderly profiles"
  ON special_events FOR UPDATE
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

CREATE POLICY "Users can delete special events for their elderly profiles"
  ON special_events FOR DELETE
  TO authenticated
  USING (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

-- RLS Policies for medication_tracking table
CREATE POLICY "Users can view medication tracking for their elderly profiles"
  ON medication_tracking FOR SELECT
  TO authenticated
  USING (
    medication_id IN (
      SELECT id FROM medications
      WHERE elderly_profile_id IN (
        SELECT id FROM elderly_profiles
        WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert medication tracking for their elderly profiles"
  ON medication_tracking FOR INSERT
  TO authenticated
  WITH CHECK (
    medication_id IN (
      SELECT id FROM medications
      WHERE elderly_profile_id IN (
        SELECT id FROM elderly_profiles
        WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update medication tracking for their elderly profiles"
  ON medication_tracking FOR UPDATE
  TO authenticated
  USING (
    medication_id IN (
      SELECT id FROM medications
      WHERE elderly_profile_id IN (
        SELECT id FROM elderly_profiles
        WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    medication_id IN (
      SELECT id FROM medications
      WHERE elderly_profile_id IN (
        SELECT id FROM elderly_profiles
        WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
      )
    )
  );

-- Create trigger for special_events updated_at
CREATE TRIGGER update_special_events_updated_at
  BEFORE UPDATE ON special_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();