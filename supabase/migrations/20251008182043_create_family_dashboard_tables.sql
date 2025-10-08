/*
  # Family Dashboard Tables

  This migration creates tables to support the family member dashboard functionality
  including family profiles, alerts, shared content, and activity logging.

  ## New Tables

  ### `family_member_alerts`
  Stores alerts and notifications for family members about their elderly loved ones.
  - `id` (uuid, primary key) - Unique alert identifier
  - `elderly_profile_id` (uuid, references elderly_profiles.id) - Links to elderly user
  - `family_member_id` (uuid, references profiles.id) - Links to family member who should see the alert
  - `alert_type` (text, not null) - Type: medication_missed, no_conversation, mood_change, health_concern
  - `severity` (text, not null) - low, medium, high, critical
  - `title` (text, not null) - Brief alert title
  - `description` (text, not null) - Detailed alert description
  - `related_entity_id` (uuid) - Reference to related medication, conversation, etc.
  - `is_acknowledged` (boolean, default false) - Whether family member has seen/acknowledged
  - `acknowledged_at` (timestamptz) - When alert was acknowledged
  - `created_at` (timestamptz) - Alert creation timestamp

  ### `shared_content`
  Stores content uploaded by family members for Aasha to mention during calls.
  - `id` (uuid, primary key) - Unique content identifier
  - `elderly_profile_id` (uuid, references elderly_profiles.id) - Links to elderly user
  - `uploaded_by` (uuid, references profiles.id) - Family member who uploaded
  - `content_type` (text, not null) - family_news, photo, milestone, reminder, conversation_topic
  - `title` (text, not null) - Content title
  - `description` (text, not null) - Full content description
  - `file_url` (text) - Optional file URL if photo/video uploaded
  - `tags` (text[]) - Array of topic tags for categorization
  - `is_approved` (boolean, default true) - Whether ready for Aasha to mention
  - `mention_priority` (text, default 'normal') - low, normal, high
  - `expiration_date` (date) - Optional expiration for time-sensitive content
  - `mentioned_count` (integer, default 0) - How many times Aasha has mentioned this
  - `last_mentioned_at` (timestamptz) - When content was last mentioned in conversation
  - `created_at` (timestamptz) - Content creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `family_activity_log`
  Tracks actions taken by family members on behalf of elderly users.
  - `id` (uuid, primary key) - Unique log entry identifier
  - `elderly_profile_id` (uuid, references elderly_profiles.id) - Links to elderly user
  - `family_member_id` (uuid, references profiles.id) - Family member who took action
  - `action_type` (text, not null) - profile_updated, medication_added, event_created, content_uploaded, etc.
  - `entity_type` (text, not null) - Type of entity affected: profile, medication, event, interest, etc.
  - `entity_id` (uuid) - ID of affected entity
  - `description` (text, not null) - Human-readable action description
  - `metadata` (jsonb) - Additional structured data about the action
  - `created_at` (timestamptz) - When action occurred

  ### `conversation_prompts`
  Stores suggested conversation topics that family members want Aasha to discuss.
  - `id` (uuid, primary key) - Unique prompt identifier
  - `elderly_profile_id` (uuid, references elderly_profiles.id) - Links to elderly user
  - `created_by` (uuid, references profiles.id) - Family member who created prompt
  - `prompt_text` (text, not null) - The suggested conversation topic or question
  - `category` (text, not null) - Type: memory, family_update, health_check, activity_suggestion, general
  - `priority` (text, default 'normal') - low, normal, high
  - `is_active` (boolean, default true) - Whether prompt should be used
  - `used_count` (integer, default 0) - How many times used in conversations
  - `last_used_at` (timestamptz) - When prompt was last used
  - `created_at` (timestamptz) - Prompt creation timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Family members can only access data related to elderly profiles they manage
  - All operations require authentication
  - Strict checks on caregiver_profile_id relationships

  ## Notes
  - Alerts support multiple severity levels for proper prioritization
  - Shared content includes expiration dates for time-sensitive information
  - Activity log provides audit trail of family member actions
  - Conversation prompts give family members control over discussion topics
*/

-- Create family_member_alerts table
CREATE TABLE IF NOT EXISTS family_member_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id uuid NOT NULL REFERENCES elderly_profiles(id) ON DELETE CASCADE,
  family_member_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('medication_missed', 'no_conversation', 'mood_change', 'health_concern', 'system_notification')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text NOT NULL,
  related_entity_id uuid,
  is_acknowledged boolean DEFAULT false,
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create shared_content table
CREATE TABLE IF NOT EXISTS shared_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id uuid NOT NULL REFERENCES elderly_profiles(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('family_news', 'photo', 'milestone', 'reminder', 'conversation_topic')),
  title text NOT NULL,
  description text NOT NULL,
  file_url text,
  tags text[] DEFAULT '{}',
  is_approved boolean DEFAULT true,
  mention_priority text DEFAULT 'normal' CHECK (mention_priority IN ('low', 'normal', 'high')),
  expiration_date date,
  mentioned_count integer DEFAULT 0,
  last_mentioned_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create family_activity_log table
CREATE TABLE IF NOT EXISTS family_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id uuid NOT NULL REFERENCES elderly_profiles(id) ON DELETE CASCADE,
  family_member_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('profile_updated', 'medication_added', 'medication_updated', 'medication_deleted', 'event_created', 'event_updated', 'event_deleted', 'content_uploaded', 'interest_added', 'interest_removed', 'alert_acknowledged')),
  entity_type text NOT NULL CHECK (entity_type IN ('profile', 'medication', 'event', 'interest', 'content', 'conversation', 'alert')),
  entity_id uuid,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create conversation_prompts table
CREATE TABLE IF NOT EXISTS conversation_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id uuid NOT NULL REFERENCES elderly_profiles(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_text text NOT NULL,
  category text NOT NULL CHECK (category IN ('memory', 'family_update', 'health_check', 'activity_suggestion', 'general')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  is_active boolean DEFAULT true,
  used_count integer DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_family_alerts_elderly_profile ON family_member_alerts(elderly_profile_id);
CREATE INDEX IF NOT EXISTS idx_family_alerts_family_member ON family_member_alerts(family_member_id);
CREATE INDEX IF NOT EXISTS idx_family_alerts_acknowledged ON family_member_alerts(is_acknowledged, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_content_elderly_profile ON shared_content(elderly_profile_id);
CREATE INDEX IF NOT EXISTS idx_shared_content_uploaded_by ON shared_content(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_shared_content_approved ON shared_content(is_approved, mention_priority);
CREATE INDEX IF NOT EXISTS idx_activity_log_elderly_profile ON family_activity_log(elderly_profile_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_family_member ON family_activity_log(family_member_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON family_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_prompts_elderly ON conversation_prompts(elderly_profile_id);
CREATE INDEX IF NOT EXISTS idx_conversation_prompts_active ON conversation_prompts(is_active, priority);

-- Enable Row Level Security
ALTER TABLE family_member_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_member_alerts table
CREATE POLICY "Family members can view alerts for their elderly profiles"
  ON family_member_alerts FOR SELECT
  TO authenticated
  USING (
    family_member_id = auth.uid() AND
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "System can insert alerts for family members"
  ON family_member_alerts FOR INSERT
  TO authenticated
  WITH CHECK (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE caregiver_profile_id = family_member_id
    )
  );

CREATE POLICY "Family members can update their own alerts"
  ON family_member_alerts FOR UPDATE
  TO authenticated
  USING (family_member_id = auth.uid())
  WITH CHECK (family_member_id = auth.uid());

-- RLS Policies for shared_content table
CREATE POLICY "Family members can view content for their elderly profiles"
  ON shared_content FOR SELECT
  TO authenticated
  USING (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "Family members can insert content for their elderly profiles"
  ON shared_content FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "Family members can update their own content"
  ON shared_content FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Family members can delete their own content"
  ON shared_content FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- RLS Policies for family_activity_log table
CREATE POLICY "Family members can view activity log for their elderly profiles"
  ON family_activity_log FOR SELECT
  TO authenticated
  USING (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "System can insert activity log entries"
  ON family_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (
    family_member_id = auth.uid() AND
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE caregiver_profile_id = auth.uid()
    )
  );

-- RLS Policies for conversation_prompts table
CREATE POLICY "Family members can view prompts for their elderly profiles"
  ON conversation_prompts FOR SELECT
  TO authenticated
  USING (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "Family members can insert prompts for their elderly profiles"
  ON conversation_prompts FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "Family members can update their own prompts"
  ON conversation_prompts FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Family members can delete their own prompts"
  ON conversation_prompts FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create trigger for shared_content updated_at
CREATE TRIGGER update_shared_content_updated_at
  BEFORE UPDATE ON shared_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
