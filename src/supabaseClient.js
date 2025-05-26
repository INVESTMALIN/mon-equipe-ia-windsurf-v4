import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gbdturqxlxyvdtezjwxa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZHR1cnF4bHh5dmR0ZXpqd3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzgzMjMsImV4cCI6MjA2MzQ1NDMyM30.JbO7l0jJwF2-9AuCzf8vhApgFky8L2culhOmlItiUoM'

export const supabase = createClient(supabaseUrl, supabaseKey)
