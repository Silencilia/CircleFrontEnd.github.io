import dotenv from 'dotenv'

// Load environment variables BEFORE importing supabase
dotenv.config({ path: '.env.local' })

import { supabase } from '../lib/supabase';

async function migrateToSupabase() {
  console.log('🚫 Migration script called - no longer needed as sample data has been removed');
  
  // Verify environment variables are loaded
  console.log('🔍 Environment check:');
  console.log('   Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set ✓' : 'Not set ❌');
  console.log('   Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✓' : 'Not set ❌');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Missing required environment variables. Please check your .env.local file.');
    process.exit(1);
  }
  
  try {
    // Test connection
    const { data, error } = await supabase
      .from('contacts')
      .select('count');
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      process.exit(1);
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('📝 Sample data has been removed from the codebase.');
      console.log('📝 This migration script is no longer needed.');
      console.log('📝 Your app now uses Supabase data directly.');
    }
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

// Run the migration
migrateToSupabase()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });