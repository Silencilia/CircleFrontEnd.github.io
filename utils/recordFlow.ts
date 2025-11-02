import { detectHumanNamesWithContext } from './humanNameDetection';
import { classifyDetectedNames } from './contactNameDetection';
import { Draft, Contact, CommitmentDraft, Commitment, Note } from '../contexts/ContactContext';
import { ComponentKind } from '../types/chat';
import { extractContactIdsFromText } from './contactReference';

/**
 * Processes the record flow after a user message is identified as "record" intent.
 * This includes:
 * 1. Creating a temporary draft
 * 2. Detecting human names in the text
 * 3. Classifying names against existing contacts
 * 4. Displaying confirmation dialog for user to select contacts
 */
export async function processRecordFlow(
  text: string,
  chatId: string,
  chat: {
    addSystemText: (text: string) => Promise<void>;
    addSystemComponent: (kind: ComponentKind, props: unknown) => Promise<void>;
  },
  contactsCtx: {
    createTemporaryNoteFromText: (text: string) => Draft;
    state: { contacts: Contact[] };
  }
): Promise<void> {
  if (!text || !text.trim() || !chatId) {
    console.log('[Record Flow] Skipped - no text or chatId');
    return;
  }

  try {
    console.log('[Record Flow] Starting record flow with text:', text);
    
    // Create temporary draft
    console.log('[Record Flow] Creating temporary note...');
    const draft = contactsCtx.createTemporaryNoteFromText(text);
    console.log('[Record Flow] Draft created:', draft.id);
    
    // Detect human names using OpenAI
    console.log('[Record Flow] Detecting human names...');
    const detected = await detectHumanNamesWithContext(text);
    console.log('[Record Flow] Detected names:', detected);
    
    // Classify names against existing contacts
    console.log('[Record Flow] Classifying names...');
    const classified = classifyDetectedNames(detected, contactsCtx.state.contacts);
    console.log('[Record Flow] Classified:', { 
      existing: classified.existing.length, 
      newOnes: classified.newOnes.length 
    });

    // Only show dialog if there are names detected
    if (classified.existing.length === 0 && classified.newOnes.length === 0) {
      console.log('[Record Flow] No names detected, skipping confirmation');
      return;
    }

    // Add system message and confirmation dialog
    console.log('[Record Flow] Adding system text...');
    await chat.addSystemText('You mentioned a few people. Do these look right?');
    
    console.log('[Record Flow] Adding NameConfirm component...');
    await chat.addSystemComponent('NameConfirm', {
      draftId: draft.id,
      existing: classified.existing.map(e => ({
        contactId: e.contact.id,
        contactName: e.contact.name,
        original: e.original,
        snippet: e.snippet,
      })),
      newOnes: classified.newOnes,
    });
    
    console.log('[Record Flow] Complete!');
  } catch (err) {
    console.error('[Record Flow] Error:', err);
    throw err;
  }
}

/**
 * Creates a system message with a NoteCard for a newly created note.
 * Accepts the note object directly to avoid polling.
 */
export async function createNoteCardMessage(
  note: Note,
  chat: {
    addSystemText: (text: string) => Promise<void>;
    addSystemComponent: (kind: ComponentKind, props: unknown) => Promise<void>;
  }
): Promise<void> {
  console.log('[createNoteCardMessage] Creating NoteCard message', { id: note.id });
  await chat.addSystemText("Great! Here is your note:");
  // Small delay to ensure text message is fully added before component
  await new Promise(r => setTimeout(r, 50));
  await chat.addSystemComponent('NoteCard', { id: note.id, note });
  console.log('[createNoteCardMessage] Mounted NoteCard for new note');
}

/**
 * Processes commitment drafts by creating commitments in the database and generating chat messages
 */
export async function processCommitmentDrafts(
  commitmentDrafts: CommitmentDraft[],
  draftId: string,
  addCommitment: (commitment: Omit<Commitment, 'id'>) => Promise<Commitment>,
  addSystemText: (text: string) => Promise<void>,
  addSystemComponent: (kind: ComponentKind, props: unknown) => Promise<void>,
  deleteCommitmentDraft: (id: string) => void
): Promise<void> {
  // Find commitment drafts linked to this draft
  const linkedCommitmentDrafts = commitmentDrafts.filter(cd => cd.draftId === draftId);
  
  if (linkedCommitmentDrafts.length === 0) {
    return; // No commitments to process
  }

  // Create commitments in database
  const createdCommitmentIds: string[] = [];
  for (const commitmentDraft of linkedCommitmentDrafts) {
    try {
      // Extract contact IDs from commitment text
      const contactIds = extractContactIdsFromText(commitmentDraft.text);
      
      const commitment = await addCommitment({
        text: commitmentDraft.text,
        due_date: commitmentDraft.due_date,
        due_time: commitmentDraft.due_time,
        contact_ids: contactIds,
        is_trashed: false,
      });
      
      createdCommitmentIds.push(commitment.id);
      
      // Delete the commitment draft after successful creation
      deleteCommitmentDraft(commitmentDraft.id);
    } catch (error) {
      console.error('[processCommitmentDrafts] Failed to create commitment:', error);
      // Continue with other commitments even if one fails
    }
  }

  if (createdCommitmentIds.length === 0) {
    return; // No commitments were created
  }

  // Create system message with commitment cards
  await addSystemText('Keep in mind that you also mentioned doing this later:');
  await new Promise(r => setTimeout(r, 50)); // Small delay
  
  // Add commitment cards
  for (const commitmentId of createdCommitmentIds) {
    await addSystemComponent('CommitmentCard', { id: commitmentId });
  }
}






