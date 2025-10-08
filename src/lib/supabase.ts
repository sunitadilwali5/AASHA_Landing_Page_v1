import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone_number: string;
          country_code: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender: string;
          language: string;
          marital_status: string;
          registration_type: 'myself' | 'loved-one';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone_number: string;
          country_code: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender: string;
          language: string;
          marital_status: string;
          registration_type: 'myself' | 'loved-one';
          created_at?: string;
          updated_at?: string;
        };
      };
      elderly_profiles: {
        Row: {
          id: string;
          profile_id: string | null;
          caregiver_profile_id: string | null;
          phone_number: string;
          country_code: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender: string;
          language: string;
          marital_status: string;
          call_time_preference: 'morning' | 'afternoon' | 'evening';
          relationship_to_caregiver: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          caregiver_profile_id?: string | null;
          phone_number: string;
          country_code: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          gender: string;
          language: string;
          marital_status: string;
          call_time_preference: 'morning' | 'afternoon' | 'evening';
          relationship_to_caregiver?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      medications: {
        Row: {
          id: string;
          elderly_profile_id: string;
          name: string;
          dosage: string;
          frequency: string;
          time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          elderly_profile_id: string;
          name: string;
          dosage: string;
          frequency: string;
          time: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      interests: {
        Row: {
          id: string;
          elderly_profile_id: string;
          interest: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          elderly_profile_id: string;
          interest: string;
          created_at?: string;
        };
      };
    };
  };
}
