/*
  # Aasha Onboarding Database Schema

  This migration creates the complete database schema for the Aasha onboarding system,
  supporting both direct user registration ("myself") and family member registration ("loved-one").

  ## New Tables

  ### `profiles`
  Core user profile information for both family members and elderly users.
  - `id` (uuid, primary key, references auth.users)
  - `phone_number` (text, unique, not null) - User's verified phone number
  - `country_code` (text, not null) - Phone country code (+1 or +91)
  - `first_name` (text, not null) - User's first name
  - `last_name` (text, not null) - User's last name
  - `date_of_birth` (date, not null) - Date of birth
  - `gender` (text, not null) - Gender (Male, Female, Other)
  - `language` (text, not null) - Preferred language (English or Hindi)
  - `marital_status` (text, not null) - Marital status
  - `registration_type` (text, not null) - "myself" or "loved-one"
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `elderly_profiles`
  Extended profile information specifically for elderly users (the ones receiving calls).
  - `id` (uuid, primary key)
  - `profile_id` (uuid, references profiles.id) - Links to main profile (for "myself" registrations)
  - `caregiver_profile_id` (uuid, references profiles.id, nullable) - Links to family member who registered (for "loved-one" registrations)
  - `phone_number` (text, unique, not null) - Elderly person's phone number
  - `country_code` (text, not null) - Phone country code
  - `first_name` (text, not null) - Elderly person's first name
  - `last_name` (text, not null) - Elderly person's last name
  - `date_of_birth` (date, not null) - Date of birth
  - `gender` (text, not null) - Gender
  - `language` (text, not null) - Preferred language
  - `marital_status` (text, not null) - Marital status
  - `call_time_preference` (text, not null) - When to call (morning, afternoon, evening)
  - `relationship_to_caregiver` (text, nullable) - Relationship (Parent, Child, Spouse, etc.) - only for "loved-one" registrations
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `medications`
  Medication information for elderly users.
  - `id` (uuid, primary key)
  - `elderly_profile_id` (uuid, references elderly_profiles.id, not null)
  - `name` (text, not null) - Medication name
  - `dosage` (text, not null) - Dosage amount (e.g., "50mg")
  - `frequency` (text, not null) - How often (Once daily, Twice daily, etc.)
  - `time` (time, not null) - Time to take medication
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `interests`
  Interest/hobby information for elderly users to personalize conversations.
  - `id` (uuid, primary key)
  - `elderly_profile_id` (uuid, references elderly_profiles.id, not null)
  - `interest` (text, not null) - Interest category (reading, music, cooking, etc.)
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data
  - Family members can access their loved one's data
  - Strict authentication required for all operations

  ### RLS Policies
  1. **profiles table**: Users can read/update their own profile
  2. **elderly_profiles table**: 
     - Elderly users can access their own profile
     - Caregivers can access profiles they created
  3. **medications table**: Access limited to profile owners and their caregivers
  4. **interests table**: Access limited to profile owners and their caregivers

  ## Notes
  - Phone numbers are stored with country codes separately for flexibility
  - The schema supports both self-registration and family member registration flows
  - Timestamps use `now()` defaults for automatic tracking
  - Foreign keys ensure data integrity
  - Indexes on frequently queried columns for performance
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text UNIQUE NOT NULL,
  country_code text NOT NULL DEFAULT '+1',
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  language text NOT NULL DEFAULT 'English' CHECK (language IN ('English', 'Hindi')),
  marital_status text NOT NULL CHECK (marital_status IN ('Single', 'Married', 'Widowed', 'Divorced')),
  registration_type text NOT NULL CHECK (registration_type IN ('myself', 'loved-one')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create elderly_profiles table
CREATE TABLE IF NOT EXISTS elderly_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  caregiver_profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  phone_number text UNIQUE NOT NULL,
  country_code text NOT NULL DEFAULT '+1',
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  language text NOT NULL DEFAULT 'English' CHECK (language IN ('English', 'Hindi')),
  marital_status text NOT NULL CHECK (marital_status IN ('Single', 'Married', 'Widowed', 'Divorced')),
  call_time_preference text NOT NULL CHECK (call_time_preference IN ('morning', 'afternoon', 'evening')),
  relationship_to_caregiver text CHECK (relationship_to_caregiver IN ('Parent', 'Child', 'Spouse', 'Sibling', 'Grandparent', 'Grandchild', 'Other Relative', 'Friend', 'Caregiver')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT elderly_profile_owner_check CHECK (
    (profile_id IS NOT NULL AND caregiver_profile_id IS NULL) OR
    (profile_id IS NULL AND caregiver_profile_id IS NOT NULL)
  )
);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id uuid NOT NULL REFERENCES elderly_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('Once daily', 'Twice daily', 'Three times daily', 'As needed')),
  time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create interests table
CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id uuid NOT NULL REFERENCES elderly_profiles(id) ON DELETE CASCADE,
  interest text NOT NULL CHECK (interest IN ('reading', 'music', 'cooking', 'travel', 'photography', 'art-crafts', 'gardening', 'news', 'health', 'devotional', 'movies', 'sports')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_elderly_profiles_phone ON elderly_profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_elderly_profiles_profile_id ON elderly_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_elderly_profiles_caregiver_id ON elderly_profiles(caregiver_profile_id);
CREATE INDEX IF NOT EXISTS idx_medications_elderly_profile_id ON medications(elderly_profile_id);
CREATE INDEX IF NOT EXISTS idx_interests_elderly_profile_id ON interests(elderly_profile_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE elderly_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for elderly_profiles table
CREATE POLICY "Elderly users can view own profile"
  ON elderly_profiles FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid() OR caregiver_profile_id = auth.uid());

CREATE POLICY "Users can insert elderly profiles they own or manage"
  ON elderly_profiles FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid() OR caregiver_profile_id = auth.uid());

CREATE POLICY "Users can update elderly profiles they own or manage"
  ON elderly_profiles FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid() OR caregiver_profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid() OR caregiver_profile_id = auth.uid());

CREATE POLICY "Users can delete elderly profiles they own or manage"
  ON elderly_profiles FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid() OR caregiver_profile_id = auth.uid());

-- RLS Policies for medications table
CREATE POLICY "Users can view medications for their elderly profiles"
  ON medications FOR SELECT
  TO authenticated
  USING (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert medications for their elderly profiles"
  ON medications FOR INSERT
  TO authenticated
  WITH CHECK (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update medications for their elderly profiles"
  ON medications FOR UPDATE
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

CREATE POLICY "Users can delete medications for their elderly profiles"
  ON medications FOR DELETE
  TO authenticated
  USING (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

-- RLS Policies for interests table
CREATE POLICY "Users can view interests for their elderly profiles"
  ON interests FOR SELECT
  TO authenticated
  USING (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert interests for their elderly profiles"
  ON interests FOR INSERT
  TO authenticated
  WITH CHECK (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete interests for their elderly profiles"
  ON interests FOR DELETE
  TO authenticated
  USING (
    elderly_profile_id IN (
      SELECT id FROM elderly_profiles
      WHERE profile_id = auth.uid() OR caregiver_profile_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_elderly_profiles_updated_at
  BEFORE UPDATE ON elderly_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();