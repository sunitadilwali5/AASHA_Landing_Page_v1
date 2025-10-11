/*
  # Schedule Daily Routine Call Cron Jobs

  ## Overview
  This migration schedules three daily cron jobs using pg_cron to automatically trigger
  routine calls for elderly users based on their preferred call time windows.

  ## Scheduled Jobs

  ### 1. Morning Calls (8:00 AM UTC)
  - Job Name: 'daily-routine-calls-morning'
  - Schedule: '0 8 * * *' (8:00 AM every day)
  - Time Window: 6:00 AM - 12:00 PM local time
  - Target: Elderly profiles with call_time_preference = 'morning'

  ### 2. Afternoon Calls (2:00 PM UTC)
  - Job Name: 'daily-routine-calls-afternoon'
  - Schedule: '0 14 * * *' (2:00 PM every day)
  - Time Window: 12:00 PM - 5:00 PM local time
  - Target: Elderly profiles with call_time_preference = 'afternoon'

  ### 3. Evening Calls (7:00 PM UTC)
  - Job Name: 'daily-routine-calls-evening'
  - Schedule: '0 19 * * *' (7:00 PM every day)
  - Time Window: 5:00 PM - 9:00 PM local time
  - Target: Elderly profiles with call_time_preference = 'evening'

  ## How It Works
  1. Each cron job runs at the specified time
  2. Calls the trigger_daily_routine_calls() function with the appropriate time preference
  3. Function fetches all matching elderly profiles
  4. Sends a webhook to n8n with complete profile details
  5. n8n workflow initiates the actual phone call via Retell

  ## Webhook Flow
  Database → pg_cron → trigger_daily_routine_calls() → pg_net → n8n Webhook → Retell API

  ## Management

  ### View All Scheduled Jobs
  ```sql
  SELECT * FROM cron.job ORDER BY jobname;
  ```

  ### View Job Execution History
  ```sql
  SELECT * FROM cron.job_run_details 
  ORDER BY start_time DESC 
  LIMIT 100;
  ```

  ### Manually Trigger a Job (for testing)
  ```sql
  SELECT trigger_daily_routine_calls('morning');
  SELECT trigger_daily_routine_calls('afternoon');
  SELECT trigger_daily_routine_calls('evening');
  ```

  ### Unschedule a Job
  ```sql
  SELECT cron.unschedule('daily-routine-calls-morning');
  SELECT cron.unschedule('daily-routine-calls-afternoon');
  SELECT cron.unschedule('daily-routine-calls-evening');
  ```

  ### Modify Job Schedule
  ```sql
  SELECT cron.alter_job(
    job_id := (SELECT jobid FROM cron.job WHERE jobname = 'daily-routine-calls-morning'),
    schedule := '30 8 * * *'  -- Change to 8:30 AM
  );
  ```

  ## Time Zone Notes
  - All times are in UTC by default
  - Adjust cron schedules based on your target timezone
  - Current schedules assume UTC times
  - Consider daylight saving time changes if needed

  ## Monitoring
  - Check cron.job_run_details for execution logs
  - Monitor webhook delivery in n8n workflow
  - Review Retell API logs for actual call initiation
  - Database NOTICE/WARNING messages logged during execution

  ## Security
  - Jobs run with database user permissions
  - Functions use SECURITY DEFINER for controlled access
  - Webhook URL is embedded in function (consider moving to config table for flexibility)
*/

-- Unschedule existing jobs if they exist (idempotent migration)
DO $$
BEGIN
  PERFORM cron.unschedule('daily-routine-calls-morning');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('daily-routine-calls-afternoon');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('daily-routine-calls-evening');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Schedule morning calls (8:00 AM UTC daily)
SELECT cron.schedule(
  'daily-routine-calls-morning',
  '0 8 * * *',
  $$SELECT trigger_daily_routine_calls('morning')$$
);

-- Schedule afternoon calls (2:00 PM UTC daily)
SELECT cron.schedule(
  'daily-routine-calls-afternoon',
  '0 14 * * *',
  $$SELECT trigger_daily_routine_calls('afternoon')$$
);

-- Schedule evening calls (7:00 PM UTC daily)
SELECT cron.schedule(
  'daily-routine-calls-evening',
  '0 19 * * *',
  $$SELECT trigger_daily_routine_calls('evening')$$
);
