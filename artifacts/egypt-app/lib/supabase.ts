import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fklmjwjsoszenlffhxfl.supabase.co'
const supabaseKey = 'sb_publishable_06z8ApT1Sm9GpafeQaGQQA_Pbge8fFA'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
