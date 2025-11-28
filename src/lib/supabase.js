// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://iapfydzethywmzpzklhs.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcGZ5ZHpldGh5d216cHprbGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMDk2ODUsImV4cCI6MjA3OTY4NTY4NX0.mpS9eBuKi-QODXQyX-1qTWwXNnnohR_yHt2OTPXJuZY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
