
import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials to ensure Vercel deployment works immediately
const supabaseUrl = 'https://hrgjztjehubhdpdticrt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZ2p6dGplaHViaGRwZHRpY3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMDMyNjcsImV4cCI6MjA4NTY3OTI2N30.gARbNbzE-yEB4ZfJmvLKF9Ju_Y-QuQ_KgBYp1Ir526I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
