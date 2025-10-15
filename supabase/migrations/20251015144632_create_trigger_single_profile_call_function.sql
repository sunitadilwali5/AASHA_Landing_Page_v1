/*
  # Create Function to Trigger Call for Single Elderly Profile
  
  ## Overview
  This migration creates a function to trigger a routine call for a specific elderly profile
  by their profile ID, sending a webhook to n8n with complete profile details.
  
  ## New Function
  
  ### `trigger_single_profile_call(p_elderly_profile_id UUID)`
  - Takes an elderly profile ID as input
  - Fetches complete profile details using existing function
  - Sends webhook to n8n to initiate call via Retell
  - Returns success status and request ID
  
  ## Usage
  ```sql
  SELECT trigger_single_profile_call('96410980-5c2b-4bb6-80ca-5243ef5c20a1');
  ```
  
  ## Security
  - Uses SECURITY DEFINER for controlled access
  - Only triggers call for valid profile IDs
  - Logs execution for debugging
*/

-- Create function to trigger call for a single elderly profile
CREATE OR REPLACE FUNCTION trigger_single_profile_call(p_elderly_profile_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_payload jsonb;
  webhook_url TEXT := 'https://baibhavparida2.app.n8n.cloud/webhook/Initiate_routine_call';
  request_id BIGINT;
  profile_name TEXT;
BEGIN
  -- Check if profile exists
  SELECT first_name || ' ' || last_name INTO profile_name
  FROM elderly_profiles
  WHERE id = p_elderly_profile_id;
  
  IF profile_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Profile not found',
      'profile_id', p_elderly_profile_id
    );
  END IF;
  
  -- Get complete profile details
  profile_payload := get_elderly_profile_full_details(p_elderly_profile_id);
  
  -- Send webhook using pg_net
  SELECT net.http_post(
    url := webhook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := profile_payload
  ) INTO request_id;
  
  -- Log for debugging
  RAISE NOTICE 'Triggered call for profile % (%) - Request ID: %',
    p_elderly_profile_id,
    profile_name,
    request_id;
  
  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'profile_id', p_elderly_profile_id,
    'profile_name', profile_name,
    'request_id', request_id,
    'webhook_url', webhook_url,
    'timestamp', NOW()
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Return error response
  RETURN jsonb_build_object(
    'success', false,
    'profile_id', p_elderly_profile_id,
    'error', SQLERRM,
    'timestamp', NOW()
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION trigger_single_profile_call(UUID) TO postgres;
GRANT EXECUTE ON FUNCTION trigger_single_profile_call(UUID) TO authenticated;

COMMENT ON FUNCTION trigger_single_profile_call(UUID) IS 
'Triggers a routine call for a specific elderly profile by sending webhook to n8n with complete profile details';
