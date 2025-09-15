// test-supabase.ts
import dotenv from 'dotenv'

// Load environment variables BEFORE importing supabase
dotenv.config({ path: '.env.local' })

// Now import supabase after loading env vars
import { supabase } from './lib/supabase'

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Test basic connection
    const { data, error } = await supabase
      .from('contacts')
      .select('count')
    
    if (error) {
      console.error('❌ Connection failed:', error)
    } else {
      console.log('✅ Supabase connection successful!')
      console.log('Contact count:', data)
    }
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

testConnection()