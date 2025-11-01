/**
 * Migration script to parse contact names in commitment text and convert them to UUID format
 * 
 * This script:
 * 1. Fetches all commitments from the database
 * 2. For each commitment, detects contact names in the text
 * 3. Matches detected names to existing contacts using fuzzy matching
 * 4. Replaces names with {{contact:id}} UUID format
 * 5. Updates the commitment text and contact_ids in the database
 * 
 * Usage:
 *   npx ts-node scripts/migrateCommitmentContactReferences.ts
 * 
 * Or compile and run:
 *   tsc scripts/migrateCommitmentContactReferences.ts
 *   node scripts/migrateCommitmentContactReferences.js
 */

const dotenv = require('dotenv')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables FIRST
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Simple name normalization for fuzzy matching
function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(str: string): Set<string> {
  return new Set(normalizeName(str).split(' ').filter(Boolean));
}

function isFuzzyMatch(candidate: string, contactName: string): boolean {
  const c = normalizeName(candidate);
  const n = normalizeName(contactName);

  if (c === n) return true;
  if (n.includes(c) || c.includes(n)) return true;

  // token overlap: first/last only, prefixes
  const tC = Array.from(tokenSet(c));
  const tN = Array.from(tokenSet(n));
  const setN = new Set(tN);
  const overlap = tC.filter((t) => setN.has(t)).length;
  if (overlap >= Math.min(1, Math.ceil(Math.min(tC.length, tN.length) / 2))) return true;

  return false;
}

// Simple text-based name detection (basic regex for common name patterns)
function detectNamesInText(text: string): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  
  // Common name patterns: capitalized words that might be names
  // This is a simple heuristic - for production, you might want to use the AI API
  const words = text.split(/\s+/);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[.,!?;:]$/g, ''); // Remove trailing punctuation
    
    // Check for capitalized words (potential names)
    if (word.length > 1 && word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
      // Check if it's likely a name (not a sentence starter)
      const isLikelyName = 
        word.length >= 2 &&
        word.match(/^[A-Z][a-z]+$/) && // Proper capitalization
        !word.match(/^(The|A|An|This|That|These|Those|I|We|You|He|She|It|They)$/i); // Common words
      
      if (isLikelyName) {
        const normalized = normalizeName(word);
        if (!seen.has(normalized)) {
          seen.add(normalized);
          names.push(word);
        }
      }
    }
    
    // Check for two-word combinations (first + last name)
    if (i < words.length - 1) {
      const word1 = words[i].replace(/[.,!?;:]$/g, '');
      const word2 = words[i + 1].replace(/[.,!?;:]$/g, '');
      
      if (word1.match(/^[A-Z][a-z]+$/) && word2.match(/^[A-Z][a-z]+$/)) {
        const combined = `${word1} ${word2}`;
        const normalized = normalizeName(combined);
        if (!seen.has(normalized)) {
          seen.add(normalized);
          names.push(combined);
        }
      }
    }
  }
  
  return names;
}

async function migrateCommitmentContactReferences() {
  console.log('Starting migration of commitment contact references...\n');

  try {
    // Fetch all commitments
    console.log('Fetching all commitments...');
    const { data: commitments, error: commitmentsError } = await supabase
      .from('commitments')
      .select('id, text, user_id')
      .is('is_trashed', false);

    if (commitmentsError) {
      throw new Error(`Failed to fetch commitments: ${commitmentsError.message}`);
    }

    if (!commitments || commitments.length === 0) {
      console.log('No commitments found to migrate.');
      return;
    }

    console.log(`Found ${commitments.length} commitments to process.\n`);

    // Group by user_id to fetch contacts per user
    const userIds = Array.from(new Set(commitments.map((c: any) => c.user_id)));
    console.log(`Processing commitments for ${userIds.length} user(s)...\n`);

    let totalUpdated = 0;
    let totalSkipped = 0;

    for (const userId of userIds) {
      console.log(`Processing user: ${userId}`);

      // Fetch contacts for this user
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id, name')
        .eq('user_id', userId)
        .is('is_trashed', false);

      if (contactsError) {
        console.error(`Failed to fetch contacts for user ${userId}:`, contactsError.message);
        continue;
      }

      if (!contacts || contacts.length === 0) {
        console.log(`  No contacts found for user ${userId}, skipping...`);
        continue;
      }

      console.log(`  Found ${contacts.length} contacts`);

      // Process commitments for this user
      const userCommitments = commitments.filter((c: any) => c.user_id === userId);

      for (const commitment of userCommitments) {
        // Skip if already has contact references
        if (commitment.text.includes('{{contact:')) {
          console.log(`  Skipping commitment ${commitment.id} - already has contact references`);
          totalSkipped++;
          continue;
        }

        // Detect names in the text
        const detectedNames = detectNamesInText(commitment.text);
        
        if (detectedNames.length === 0) {
          console.log(`  No names detected in commitment ${commitment.id}`);
          totalSkipped++;
          continue;
        }

        // Match detected names to contacts
        let processedText = commitment.text;
        const matchedContactIds = new Set<string>();

        for (const detectedName of detectedNames) {
          // Find best matching contact
          let bestMatch = contacts.find((contact: any) => 
            isFuzzyMatch(detectedName, contact.name)
          );

          if (bestMatch) {
            // Replace name with UUID format
            const contactToken = `{{contact:${bestMatch.id}}}`;
            const regex = new RegExp(detectedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            processedText = processedText.replace(regex, contactToken);
            matchedContactIds.add(bestMatch.id);
            
            console.log(`    Matched "${detectedName}" -> ${bestMatch.name} (${bestMatch.id})`);
          }
        }

        // Only update if we found matches
        if (matchedContactIds.size > 0 && processedText !== commitment.text) {
          // Update commitment text
          const { error: updateError } = await supabase
            .from('commitments')
            .update({ text: processedText })
            .eq('id', commitment.id);

          if (updateError) {
            console.error(`    Failed to update commitment ${commitment.id}:`, updateError.message);
            continue;
          }

          // Update commitment_contacts junction table
          // First, clear existing relationships
          await supabase
            .from('commitment_contacts')
            .delete()
            .eq('commitment_id', commitment.id);

          // Then, insert new relationships
          if (matchedContactIds.size > 0) {
            const relationships = Array.from(matchedContactIds).map((contactId: string) => ({
              commitment_id: commitment.id,
              contact_id: contactId
            }));

            const { error: insertError } = await supabase
              .from('commitment_contacts')
              .insert(relationships);

            if (insertError) {
              console.error(`    Failed to update commitment_contacts for ${commitment.id}:`, insertError.message);
            } else {
              console.log(`    Updated commitment ${commitment.id} - ${matchedContactIds.size} contact(s) matched`);
              totalUpdated++;
            }
          }
        } else {
          console.log(`    No matches found for commitment ${commitment.id}`);
          totalSkipped++;
        }
      }

      console.log(`  Completed user ${userId}\n`);
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total commitments processed: ${commitments.length}`);
    console.log(`Successfully updated: ${totalUpdated}`);
    console.log(`Skipped: ${totalSkipped}`);
    console.log('\nMigration completed!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateCommitmentContactReferences()
  .then(() => {
    console.log('\nDone.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
