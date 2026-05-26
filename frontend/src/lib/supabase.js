import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ftyhikamyqxmghrhtwdp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0eWhpa2FteXF4bWdocmh0d2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MDk4NDEsImV4cCI6MjA5MzA4NTg0MX0.ClwCJM5tG8m32eGjnJBJtO1kE9apfZrs8alFveqyftc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)