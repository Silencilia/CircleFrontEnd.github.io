import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables FIRST
dotenv.config({ path: '.env.local' })

// Create Supabase client after environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixContactReferences() {
  console.log('Starting contact reference fix migration...');
  
  // Verify environment variables are loaded
  console.log('Environment check:');
  console.log('   Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
  console.log('   Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
  
  try {
    // Get all notes that contain contact references
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, text')
      .like('text', '%{{contact:%');
    
    if (notesError) {
      console.error('Failed to fetch notes:', notesError);
      process.exit(1);
    }
    
    console.log(`Found ${notes?.length || 0} notes with contact references`);
    
    if (!notes || notes.length === 0) {
      console.log('No notes with contact references found. Nothing to fix.');
      return;
    }
    
    // Get all contacts to build a mapping
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, name');
    
    if (contactsError) {
      console.error('Failed to fetch contacts:', contactsError);
      process.exit(1);
    }
    
    console.log(`Found ${contacts?.length || 0} contacts`);
    
    if (!contacts || contacts.length === 0) {
      console.log('No contacts found. Cannot fix references.');
      return;
    }
    
    // Create a mapping from contact names to UUIDs
    const contactNameToId = new Map<string, string>();
    contacts.forEach(contact => {
      contactNameToId.set(contact.name, contact.id);
    });
    
    console.log('Contact name to ID mapping:');
    contactNameToId.forEach((id, name) => {
      console.log(`   "${name}" -> ${id}`);
    });
    
    // Process each note
    let updatedCount = 0;
    for (const note of notes) {
      console.log(`\nProcessing note ${note.id}:`);
      console.log(`   Original text: ${note.text.substring(0, 100)}...`);
      
      // Find all contact references in the note text
      const contactRefRegex = /\{\{\s*contact\s*:\s*(\d+)\s*\}\}/g;
      let match;
      let updatedText = note.text;
      let hasChanges = false;
      
      while ((match = contactRefRegex.exec(note.text)) !== null) {
        const numericId = match[1];
        console.log(`   Found numeric contact reference: {{contact:${numericId}}}`);
        
        // Try to find a contact that might correspond to this numeric ID
        // This is a heuristic - we'll try to match by position or other criteria
        const contactIndex = parseInt(numericId) - 1; // Assuming 1-based indexing
        const contact = contacts[contactIndex];
        
        if (contact) {
          const oldRef = `{{contact:${numericId}}}`;
          const newRef = `{{contact:${contact.id}}}`;
          updatedText = updatedText.replace(oldRef, newRef);
          hasChanges = true;
          console.log(`   Updated: ${oldRef} -> ${newRef} (${contact.name})`);
        } else {
          console.log(`   Warning: Could not find contact for numeric ID ${numericId}`);
        }
      }
      
      if (hasChanges) {
        console.log(`   Updated text: ${updatedText.substring(0, 100)}...`);
        
        // Update the note in the database
        const { error: updateError } = await supabase
          .from('notes')
          .update({ text: updatedText })
          .eq('id', note.id);
        
        if (updateError) {
          console.error(`   Failed to update note ${note.id}:`, updateError);
        } else {
          console.log(`   Successfully updated note ${note.id}`);
          updatedCount++;
        }
      } else {
        console.log(`   No changes needed for note ${note.id}`);
      }
    }
    
    console.log(`\nMigration completed! Updated ${updatedCount} notes.`);
    
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

// Run the migration
fixContactReferences()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });