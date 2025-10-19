// Clear and resync embeddings script
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, anon, { auth: { persistSession: false } });

async function clearAndResync(userId) {
  try {
    console.log(`Clearing embeddings for user ${userId}...`);
    
    // Clear all embeddings for the user
    const { error: deleteError } = await supabase
      .from('embeddings')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('Error clearing embeddings:', deleteError);
      return;
    }
    
    console.log('Embeddings cleared successfully');
    
    // Trigger resync
    console.log('Triggering resync...');
    const response = await fetch('http://localhost:3000/api/embeddings/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Resync completed:', result);
    } else {
      console.error('Resync failed:', await response.text());
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Replace with your actual user ID
const userId = 'a5b89ac9-349c-4396-83b3-b61fee1495d1';
clearAndResync(userId);
