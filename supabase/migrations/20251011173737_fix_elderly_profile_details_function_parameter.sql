/*
  # Fix Parameter Ambiguity in get_elderly_profile_full_details Function

  ## Issue
  The function parameter `profile_id` conflicts with column names in the tables,
  causing "column reference is ambiguous" errors when the function is called.

  ## Changes
  - Drop existing function
  - Recreate with parameter renamed from `profile_id` to `p_elderly_profile_id`
  - Update all references within the function to use the new parameter name
  - This follows PostgreSQL best practice of prefixing function parameters

  ## Impact
  - Fixes the trigger_daily_routine_calls function which was failing silently
  - Enables proper webhook delivery to n8n for scheduled calls
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_elderly_profile_full_details(UUID);

-- Recreate the function with fixed parameter name
CREATE OR REPLACE FUNCTION get_elderly_profile_full_details(p_elderly_profile_id UUID)
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
  WHERE ep.id = p_elderly_profile_id;

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
  WHERE m.elderly_profile_id = p_elderly_profile_id;

  -- Get interests
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', i.id,
      'interest', i.interest
    )
  ) INTO interests_data
  FROM interests i
  WHERE i.elderly_profile_id = p_elderly_profile_id;

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
  WHERE c.elderly_profile_id = p_elderly_profile_id
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
  WHERE p.id = (SELECT caregiver_profile_id FROM elderly_profiles WHERE id = p_elderly_profile_id);

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_elderly_profile_full_details(UUID) TO postgres;
