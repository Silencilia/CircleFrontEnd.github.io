// utils/entityCleanup.ts
import { supabase } from '../lib/supabase';
import { Contact, PrecisionDate } from '../contexts/ContactContext';

/**
 * Interface for cleanup results
 */
export interface CleanupResult {
  deletedCount: number;
  deletedIds: string[];
  errors: string[];
}

/**
 * Destroys all occupations that are not referenced by any contacts
 * @returns Promise<CleanupResult> - Result of the cleanup operation
 */
export async function destroyUnusedOccupations(): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedCount: 0,
    deletedIds: [],
    errors: []
  };

  try {
    console.log('Starting cleanup of unused occupations...');

    // Get all occupation IDs that are currently referenced by contacts
    const { data: usedOccupationIds, error: usedError } = await supabase
      .from('contacts')
      .select('occupation_id')
      .not('occupation_id', 'is', null);

    if (usedError) {
      result.errors.push(`Error fetching used occupation IDs: ${usedError.message}`);
      return result;
    }

    // Extract unique occupation IDs that are in use
    const usedIds = new Set(
      usedOccupationIds
        ?.map(contact => contact.occupation_id)
        .filter(id => id !== null) || []
    );

    console.log(`Found ${usedIds.size} occupations currently in use`);

    // Get all occupations
    const { data: allOccupations, error: allError } = await supabase
      .from('occupations')
      .select('id');

    if (allError) {
      result.errors.push(`Error fetching all occupations: ${allError.message}`);
      return result;
    }

    if (!allOccupations) {
      console.log('No occupations found');
      return result;
    }

    // Find unused occupations
    const unusedOccupations = allOccupations.filter(
      occupation => !usedIds.has(occupation.id)
    );

    console.log(`Found ${unusedOccupations.length} unused occupations`);

    if (unusedOccupations.length === 0) {
      console.log('No unused occupations to delete');
      return result;
    }

    // Delete unused occupations
    const unusedIds = unusedOccupations.map(occ => occ.id);
    const { error: deleteError } = await supabase
      .from('occupations')
      .delete()
      .in('id', unusedIds);

    if (deleteError) {
      result.errors.push(`Error deleting occupations: ${deleteError.message}`);
      return result;
    }

    result.deletedCount = unusedOccupations.length;
    result.deletedIds = unusedIds;

    console.log(`Successfully deleted ${unusedOccupations.length} unused occupations`);
    console.log('Deleted occupation IDs:', unusedIds);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Unexpected error during occupation cleanup: ${errorMessage}`);
    console.error('Error during occupation cleanup:', error);
  }

  return result;
}

/**
 * Destroys all organizations that are not referenced by any contacts
 * @returns Promise<CleanupResult> - Result of the cleanup operation
 */
export async function destroyUnusedOrganizations(): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedCount: 0,
    deletedIds: [],
    errors: []
  };

  try {
    console.log('Starting cleanup of unused organizations...');

    // Get all organization IDs that are currently referenced by contacts
    const { data: usedOrganizationIds, error: usedError } = await supabase
      .from('contacts')
      .select('organization_id')
      .not('organization_id', 'is', null);

    if (usedError) {
      result.errors.push(`Error fetching used organization IDs: ${usedError.message}`);
      return result;
    }

    // Extract unique organization IDs that are in use
    const usedIds = new Set(
      usedOrganizationIds
        ?.map(contact => contact.organization_id)
        .filter(id => id !== null) || []
    );

    console.log(`Found ${usedIds.size} organizations currently in use`);

    // Get all organizations
    const { data: allOrganizations, error: allError } = await supabase
      .from('organizations')
      .select('id');

    if (allError) {
      result.errors.push(`Error fetching all organizations: ${allError.message}`);
      return result;
    }

    if (!allOrganizations) {
      console.log('No organizations found');
      return result;
    }

    // Find unused organizations
    const unusedOrganizations = allOrganizations.filter(
      organization => !usedIds.has(organization.id)
    );

    console.log(`Found ${unusedOrganizations.length} unused organizations`);

    if (unusedOrganizations.length === 0) {
      console.log('No unused organizations to delete');
      return result;
    }

    // Delete unused organizations
    const unusedIds = unusedOrganizations.map(org => org.id);
    const { error: deleteError } = await supabase
      .from('organizations')
      .delete()
      .in('id', unusedIds);

    if (deleteError) {
      result.errors.push(`Error deleting organizations: ${deleteError.message}`);
      return result;
    }

    result.deletedCount = unusedOrganizations.length;
    result.deletedIds = unusedIds;

    console.log(`Successfully deleted ${unusedOrganizations.length} unused organizations`);
    console.log('Deleted organization IDs:', unusedIds);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Unexpected error during organization cleanup: ${errorMessage}`);
    console.error('Error during organization cleanup:', error);
  }

  return result;
}

/**
 * Destroys both unused occupations and organizations
 * @returns Promise<{occupations: CleanupResult, organizations: CleanupResult}>
 */
export async function destroyAllUnusedEntities(): Promise<{
  occupations: CleanupResult;
  organizations: CleanupResult;
}> {
  console.log('Starting cleanup of all unused entities...');
  
  const [occupationsResult, organizationsResult] = await Promise.all([
    destroyUnusedOccupations(),
    destroyUnusedOrganizations()
  ]);

  const totalDeleted = occupationsResult.deletedCount + organizationsResult.deletedCount;
  const totalErrors = occupationsResult.errors.length + organizationsResult.errors.length;

  console.log(`Cleanup completed: ${totalDeleted} entities deleted, ${totalErrors} errors`);

  return {
    occupations: occupationsResult,
    organizations: organizationsResult
  };
}

/**
 * Destroys all unused entities and empty contacts
 * @returns Promise<{occupations: CleanupResult, organizations: CleanupResult, contacts: CleanupResult}>
 */
export async function destroyAllUnusedEntitiesAndEmptyContacts(): Promise<{
  occupations: CleanupResult;
  organizations: CleanupResult;
  contacts: CleanupResult;
}> {
  console.log('Starting complete cleanup of all unused entities and empty contacts...');
  
  const [occupationsResult, organizationsResult, contactsResult] = await Promise.all([
    destroyUnusedOccupations(),
    destroyUnusedOrganizations(),
    destroyEmptyContacts()
  ]);

  const totalDeleted = occupationsResult.deletedCount + organizationsResult.deletedCount + contactsResult.deletedCount;
  const totalErrors = occupationsResult.errors.length + organizationsResult.errors.length + contactsResult.errors.length;

  console.log(`Complete cleanup finished: ${totalDeleted} entities deleted, ${totalErrors} errors`);

  return {
    occupations: occupationsResult,
    organizations: organizationsResult,
    contacts: contactsResult
  };
}

/**
 * Destroys all unused entities, empty contacts, and note cleanup
 * @returns Promise<{occupations: CleanupResult, organizations: CleanupResult, contacts: CleanupResult, notes: CleanupResult}>
 */
export async function destroyAllUnusedEntitiesAndEmptyContactsAndNotes(): Promise<{
  occupations: CleanupResult;
  organizations: CleanupResult;
  contacts: CleanupResult;
  notes: CleanupResult;
}> {
  console.log('Starting complete cleanup of all unused entities, empty contacts, and notes...');
  
  const [occupationsResult, organizationsResult, contactsResult, notesResult] = await Promise.all([
    destroyUnusedOccupations(),
    destroyUnusedOrganizations(),
    destroyEmptyContacts(),
    destroyUnusedNotes()
  ]);

  const totalDeleted = occupationsResult.deletedCount + organizationsResult.deletedCount + contactsResult.deletedCount + notesResult.deletedCount;
  const totalErrors = occupationsResult.errors.length + organizationsResult.errors.length + contactsResult.errors.length + notesResult.errors.length;

  console.log(`Complete cleanup finished: ${totalDeleted} entities deleted, ${totalErrors} errors`);

  return {
    occupations: occupationsResult,
    organizations: organizationsResult,
    contacts: contactsResult,
    notes: notesResult
  };
}

/**
 * Destroys all empty entities (empty contacts and empty notes)
 * @returns Promise<{contacts: CleanupResult, notes: CleanupResult}>
 */
export async function destroyAllEmptyEntities(): Promise<{
  contacts: CleanupResult;
  notes: CleanupResult;
}> {
  console.log('Starting cleanup of all empty entities...');
  
  const [contactsResult, notesResult] = await Promise.all([
    destroyEmptyContacts(),
    destroyEmptyNotes()
  ]);

  const totalDeleted = contactsResult.deletedCount + notesResult.deletedCount;
  const totalErrors = contactsResult.errors.length + notesResult.errors.length;

  console.log(`Empty entities cleanup finished: ${totalDeleted} entities deleted, ${totalErrors} errors`);

  return {
    contacts: contactsResult,
    notes: notesResult
  };
}

/**
 * Destroys all contacts that have empty properties (all properties empty except UUID)
 * @returns Promise<CleanupResult> - Result of the cleanup operation
 */
export async function destroyEmptyContacts(): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedCount: 0,
    deletedIds: [],
    errors: []
  };

  try {
    console.log('Starting cleanup of empty contacts...');

    // Get all contacts with their related data
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select(`
        *,
        occupation:occupations(*),
        organization:organizations(*)
      `);

    if (contactsError) {
      result.errors.push(`Error fetching contacts: ${contactsError.message}`);
      return result;
    }

    if (!contacts) {
      console.log('No contacts found');
      return result;
    }

    console.log(`Found ${contacts.length} total contacts`);

    // Get all relationships for contacts
    const [contactSubjects, contactRelationships, contactNotes] = await Promise.all([
      supabase.from('contact_subjects').select('contact_id'),
      supabase.from('contact_relationships').select('contact_id'),
      supabase.from('contact_notes').select('contact_id')
    ]);

    // Build lookup maps for relationships
    const contactSubjectsMap = new Set(contactSubjects.data?.map(cs => cs.contact_id) || []);
    const contactRelationshipsMap = new Set(contactRelationships.data?.map(cr => cr.contact_id) || []);
    const contactNotesMap = new Set(contactNotes.data?.map(cn => cn.contact_id) || []);

    // Find empty contacts
    const emptyContacts = contacts.filter(contact => {
      // Check if contact has any meaningful data
      const hasName = contact.name && contact.name.trim() !== '';
      const hasOccupation = contact.occupation_id !== null && contact.occupation_id !== undefined;
      const hasOrganization = contact.organization_id !== null && contact.organization_id !== undefined;
      const hasBirthDate = contact.birth_year !== null && contact.birth_month !== null && contact.birth_day !== null;
      const hasLastInteraction = contact.last_interaction !== null && contact.last_interaction !== undefined;
      const hasSubjects = contactSubjectsMap.has(contact.id);
      const hasRelationships = contactRelationshipsMap.has(contact.id);
      const hasNotes = contactNotesMap.has(contact.id);
      const isTrashed = contact.is_trashed === true;

      // Contact is considered empty if it has no meaningful data
      return !hasName && 
             !hasOccupation && 
             !hasOrganization && 
             !hasBirthDate && 
             !hasLastInteraction && 
             !hasSubjects && 
             !hasRelationships && 
             !hasNotes && 
             !isTrashed;
    });

    console.log(`Found ${emptyContacts.length} empty contacts`);

    if (emptyContacts.length === 0) {
      console.log('No empty contacts to delete');
      return result;
    }

    // Delete empty contacts
    const emptyContactIds = emptyContacts.map(contact => contact.id);
    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .in('id', emptyContactIds);

    if (deleteError) {
      result.errors.push(`Error deleting empty contacts: ${deleteError.message}`);
      return result;
    }

    result.deletedCount = emptyContacts.length;
    result.deletedIds = emptyContactIds;

    console.log(`Successfully deleted ${emptyContacts.length} empty contacts`);
    console.log('Deleted contact IDs:', emptyContactIds);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Unexpected error during empty contact cleanup: ${errorMessage}`);
    console.error('Error during empty contact cleanup:', error);
  }

  return result;
}

/**
 * Destroys all notes that are not associated with any contacts
 * @returns Promise<CleanupResult> - Result of the cleanup operation
 */
export async function destroyUnusedNotes(): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedCount: 0,
    deletedIds: [],
    errors: []
  };

  try {
    console.log('Starting cleanup of unused notes...');

    // Get all note IDs that are currently associated with contacts
    const { data: usedNoteIds, error: usedError } = await supabase
      .from('contact_notes')
      .select('note_id');

    if (usedError) {
      result.errors.push(`Error fetching used note IDs: ${usedError.message}`);
      return result;
    }

    // Extract unique note IDs that are in use
    const usedIds = new Set(
      usedNoteIds?.map(relation => relation.note_id) || []
    );

    console.log(`Found ${usedIds.size} notes currently associated with contacts`);

    // Get all notes
    const { data: allNotes, error: allError } = await supabase
      .from('notes')
      .select('id');

    if (allError) {
      result.errors.push(`Error fetching all notes: ${allError.message}`);
      return result;
    }

    if (!allNotes) {
      console.log('No notes found');
      return result;
    }

    // Find unused notes
    const unusedNotes = allNotes.filter(
      note => !usedIds.has(note.id)
    );

    console.log(`Found ${unusedNotes.length} unused notes`);

    if (unusedNotes.length === 0) {
      console.log('No unused notes to delete');
      return result;
    }

    // Delete unused notes
    const unusedIds = unusedNotes.map(note => note.id);
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .in('id', unusedIds);

    if (deleteError) {
      result.errors.push(`Error deleting notes: ${deleteError.message}`);
      return result;
    }

    result.deletedCount = unusedNotes.length;
    result.deletedIds = unusedIds;

    console.log(`Successfully deleted ${unusedNotes.length} unused notes`);
    console.log('Deleted note IDs:', unusedIds);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Unexpected error during note cleanup: ${errorMessage}`);
    console.error('Error during note cleanup:', error);
  }

  return result;
}

/**
 * Destroys all notes that have empty title and text
 * @returns Promise<CleanupResult> - Result of the cleanup operation
 */
export async function destroyEmptyNotes(): Promise<CleanupResult> {
  const result: CleanupResult = {
    deletedCount: 0,
    deletedIds: [],
    errors: []
  };

  try {
    console.log('Starting cleanup of empty notes...');

    // Get all notes
    const { data: allNotes, error: allError } = await supabase
      .from('notes')
      .select('id, title, text');

    if (allError) {
      result.errors.push(`Error fetching notes: ${allError.message}`);
      return result;
    }

    if (!allNotes) {
      console.log('No notes found');
      return result;
    }

    console.log(`Found ${allNotes.length} total notes`);

    // Find empty notes (both title and text are empty or null)
    const emptyNotes = allNotes.filter(note => {
      const hasTitle = note.title && note.title.trim() !== '';
      const hasText = note.text && note.text.trim() !== '';
      
      // Note is considered empty if both title and text are empty
      return !hasTitle && !hasText;
    });

    console.log(`Found ${emptyNotes.length} empty notes`);

    if (emptyNotes.length === 0) {
      console.log('No empty notes to delete');
      return result;
    }

    // Delete empty notes
    const emptyIds = emptyNotes.map(note => note.id);
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .in('id', emptyIds);

    if (deleteError) {
      result.errors.push(`Error deleting empty notes: ${deleteError.message}`);
      return result;
    }

    result.deletedCount = emptyNotes.length;
    result.deletedIds = emptyIds;

    console.log(`Successfully deleted ${emptyNotes.length} empty notes`);
    console.log('Deleted note IDs:', emptyIds);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Unexpected error during empty note cleanup: ${errorMessage}`);
    console.error('Error during empty note cleanup:', error);
  }

  return result;
}

/**
 * Helper function to get usage statistics for occupations and organizations
 * @returns Promise<{occupations: {total: number, used: number, unused: number}, organizations: {total: number, used: number, unused: number}}>
 */
export async function getEntityUsageStats(): Promise<{
  occupations: { total: number; used: number; unused: number };
  organizations: { total: number; used: number; unused: number };
}> {
  try {
    // Get occupation stats
    const [occupationStats, organizationStats] = await Promise.all([
      getOccupationUsageStats(),
      getOrganizationUsageStats()
    ]);

    return {
      occupations: occupationStats,
      organizations: organizationStats
    };
  } catch (error) {
    console.error('Error getting entity usage stats:', error);
    throw error;
  }
}

/**
 * Helper function to get occupation usage statistics
 */
async function getOccupationUsageStats(): Promise<{ total: number; used: number; unused: number }> {
  const { data: usedOccupationIds, error: usedError } = await supabase
    .from('contacts')
    .select('occupation_id')
    .not('occupation_id', 'is', null);

  if (usedError) throw usedError;

  const usedIds = new Set(
    usedOccupationIds
      ?.map(contact => contact.occupation_id)
      .filter(id => id !== null) || []
  );

  const { data: allOccupations, error: allError } = await supabase
    .from('occupations')
    .select('id');

  if (allError) throw allError;

  const total = allOccupations?.length || 0;
  const used = usedIds.size;
  const unused = total - used;

  return { total, used, unused };
}

/**
 * Helper function to get organization usage statistics
 */
async function getOrganizationUsageStats(): Promise<{ total: number; used: number; unused: number }> {
  const { data: usedOrganizationIds, error: usedError } = await supabase
    .from('contacts')
    .select('organization_id')
    .not('organization_id', 'is', null);

  if (usedError) throw usedError;

  const usedIds = new Set(
    usedOrganizationIds
      ?.map(contact => contact.organization_id)
      .filter(id => id !== null) || []
  );

  const { data: allOrganizations, error: allError } = await supabase
    .from('organizations')
    .select('id');

  if (allError) throw allError;

  const total = allOrganizations?.length || 0;
  const used = usedIds.size;
  const unused = total - used;

  return { total, used, unused };
}
