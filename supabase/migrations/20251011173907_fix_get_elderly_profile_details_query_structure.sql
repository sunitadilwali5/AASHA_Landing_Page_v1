/*
  # Fix get_elderly_profile_full_details Query Structure

  ## Changes
  - Fix the calls query to properly handle ORDER BY with jsonb_agg
  - Use a subquery to order results before aggregating
  - Ensures proper SQL syntax for aggregate functions

  ## Impact
  - Fixes the function to properly aggregate and order call history
  - Enables webhook payload generation without SQL errors
*/

-- Drop and recreate with correct query structure
DROP FUNCTION IF EXISTS get_elderly_profile_full_details(UUID);

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

  -- Get medications with updated schema
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', m.id,
      'name', m.name,
      'dosage_quantity', m.dosage_quantity,
      'times_of_day', m.times_of_day
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

  -- Get recent call summaries (last 7 days) with correct query structure
  SELECT jsonb_agg(call_data ORDER BY call_created_at DESC) INTO recent_calls_data
  FROM (
    SELECT 
      jsonb_build_object(
        'call_id', c.id,
        'retell_call_id', c.retell_call_id,
        'call_type', c.call_type,
        'call_status', c.call_status,
        'created_at', c.created_at,
        'ended_at', c.ended_at,
        'duration_seconds', c.duration_seconds,
        'call_summary', ca.call_summary,
        'user_sentiment', ca.user_sentiment,
        'transcript_summary', ct.llm_call_summary
      ) as call_data,
      c.created_at as call_created_at
    FROM calls c
    LEFT JOIN call_analysis ca ON ca.call_id = c.id
    LEFT JOIN call_transcripts ct ON ct.call_id = c.id
    WHERE c.elderly_profile_id = p_elderly_profile_id
      AND c.created_at >= NOW() - INTERVAL '7 days'
    ORDER BY c.created_at DESC
    LIMIT 10
  ) recent_calls;

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
