import { createClient } from '@supabase/supabase-js'

// นำค่าเหล่านี้มาจากหน้า Dashboard ของ Supabase (Project Settings > API)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)