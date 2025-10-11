/*
  # Enable pg_cron and pg_net Extensions for Scheduled Jobs

  ## Overview
  This migration enables the necessary PostgreSQL extensions to support scheduled cron jobs
  and HTTP requests from the database.

  ## Extensions Enabled

  ### 1. pg_cron
  - Allows scheduling of recurring jobs using cron syntax
  - Jobs run directly within the database
  - Used to trigger daily routine calls at specific times

  ### 2. pg_net
  - Provides async HTTP request capabilities from within PostgreSQL
  - Used to send webhook requests to external services
  - Enables database functions to make outbound HTTP calls

  ## Use Case
  These extensions work together to:
  1. Schedule cron jobs that run at specific times (morning, afternoon, evening)
  2. Make HTTP POST requests to external webhook endpoints (n8n)
  3. Trigger daily routine calls for elderly profiles based on their time preferences

  ## Security
  - Extensions are installed at the database level
  - Only accessible through database functions with proper permissions
  - HTTP requests use pg_net which provides secure async networking

  ## Notes
  - pg_cron stores jobs in the cron.job table
  - pg_cron logs execution history in cron.job_run_details
  - pg_net requests are async and non-blocking
*/

-- Enable pg_cron extension for scheduling recurring jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
