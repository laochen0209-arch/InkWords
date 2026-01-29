import { createClient } from '@supabase/supabase-js'

// 强哥提醒：! 号是为了告诉 TS 这两个值绝对存在
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)