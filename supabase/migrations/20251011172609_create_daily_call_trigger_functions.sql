/*
  # Daily Routine Call Trigger System

  ## Overview
  This migration creates PostgreSQL functions to automatically trigger daily routine calls
  for elderly profiles by sending webhooks to an external n8n workflow.

  ## New Functions

  ### 1. `get_elderly_profile_full_details(profile_id UUID)`
  Returns complete profile information for an elderly user including:
  - Basic profile info (name, phone, language, etc.)
  - Medications list with dosage and timing
  - Interests and hobbies
  - Recent call summaries from the last 7 days
  - Call time preference
  - Caregiver information if applicable

  ### 2. `trigger_daily_routine_calls(time_preference TEXT)`
  Main function that:
  - Fetches all elderly profiles with matching time preference
  - Builds complete profile data payload
  - Sends webhook POST request to n8n endpoint
  - Logs execution for debugging

  ## Webhook Integration
  - Target URL: https://baibhavparida2.app.n8n.cloud/webhook/Initiate_routine_call
  - Method: POST
  - Content-Type: application/json
  - Payload includes all elderly profile details needed for personalized calls

  ## Scheduling
  These functions are designed to be called by pg_cron jobs scheduled for:
  - Morning calls (6 AM - 12 PM)
  - Afternoon calls (12 PM - 5 PM)
  - Evening calls (5 PM - 9 PM)

  ## Security
  - Functions execute with database user permissions
  - HTTP requests use pg_net for secure async networking
  - Only processes profiles with matching time preferences

  ## Error Handling
  - Returns count of processed profiles
  - Logs errors for debugging
  - Continues processing even if individual webhooks fail
*/

-- Function to get complete elderly profile details with all related data
CREATE OR REPLACE FUNCTION get_elderly_profile_full_details(profile_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data jsonb;
  medications_data jsonb;
  interests_data jsonb;
  recent_calls_data jsonb;
  caregiver_data jsonb;
BEGIN
  -- Get basic elderly profile information
  SELECT to_jsonb(ep.*) INTO profile_data
  FROM elderly_profiles ep
  WHERE ep.id = profile_id;

  -- Get medications
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', m.id,
      'name', m.name,
      'dosage', m.dosage,
      'frequency', m.frequency,
      'time', m.time
    )
  ) INTO medications_data
  FROM medications m
  WHERE m.elderly_profile_id = profile_id;

  -- Get interests
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', i.id,
      'interest', i.interest
    )
  ) INTO interests_data
  FROM interests i
  WHERE i.elderly_profile_id = profile_id;

  -- Get recent call summaries (last 7 days)
  SELECT jsonb_agg(
    jsonb_build_object(
      'call_id', c.id,
      'call_type', c.call_type,
      'call_status', c.call_status,
      'started_at', c.started_at,
      'duration_seconds', c.duration_seconds,
      'call_summary', ca.call_summary,
      'user_sentiment', ca.user_sentiment,
      'transcript_summary', ct.llm_call_summary
    )
  ) INTO recent_calls_data
  FROM calls c
  LEFT JOIN call_analysis ca ON ca.call_id = c.id
  LEFT JOIN call_transcripts ct ON ct.call_id = c.id
  WHERE c.elderly_profile_id = profile_id
    AND c.started_at >= NOW() - INTERVAL '7 days'
  ORDER BY c.started_at DESC
  LIMIT 10;

  -- Get caregiver information if exists
  SELECT jsonb_build_object(
    'id', p.id,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'phone_number', p.phone_number,
    'country_code', p.country_code
  ) INTO caregiver_data
  FROM profiles p
  WHERE p.id = (SELECT caregiver_profile_id FROM elderly_profiles WHERE id = profile_id);

  -- Combine all data
  RETURN jsonb_build_object(
    'profile', profile_data,
    'medications', COALESCE(medications_data, '[]'::jsonb),
    'interests', COALESCE(interests_data, '[]'::jsonb),
    'recent_calls', COALESCE(recent_calls_data, '[]'::jsonb),
    'caregiver', caregiver_data
  );
END;
$$;

-- Function to trigger daily routine calls for a specific time preference
CREATE OR REPLACE FUNCTION trigger_daily_routine_calls(time_preference TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record RECORD;
  profile_payload jsonb;
  webhook_url TEXT := 'https://baibhavparida2.app.n8n.cloud/webhook/Initiate_routine_call';
  profiles_processed INTEGER := 0;
  request_id BIGINT;
BEGIN
  -- Loop through all elderly profiles with matching time preference
  FOR profile_record IN
    SELECT id, first_name, last_name, phone_number, country_code
    FROM elderly_profiles
    WHERE call_time_preference = time_preference
  LOOP
    BEGIN
      -- Get complete profile details
      profile_payload := get_elderly_profile_full_details(profile_record.id);

      -- Send webhook using pg_net
      SELECT net.http_post(
        url := webhook_url,
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := profile_payload
      ) INTO request_id;

      -- Increment counter
      profiles_processed := profiles_processed + 1;

      -- Log for debugging (optional)
      RAISE NOTICE 'Triggered call for profile % (%) - Request ID: %',
        profile_record.id,
        profile_record.first_name || ' ' || profile_record.last_name,
        request_id;

    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue processing other profiles
      RAISE WARNING 'Failed to trigger call for profile %: %',
        profile_record.id,
        SQLERRM;
    END;
  END LOOP;

  RETURN profiles_processed;
END;
$$;

-- Grant execute permissions (adjust as needed for your security model)
GRANT EXECUTE ON FUNCTION get_elderly_profile_full_details(UUID) TO postgres;
GRANT EXECUTE ON FUNCTION trigger_daily_routine_calls(TEXT) TO postgres;
