/**
 * Embedding sync utilities for lifecycle management
 * Handles generating, storing, and syncing embeddings for database entities
 */

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding, buildEntityContent } from './semanticSearch';

export interface EmbeddingParams {
  userId: string;
  entityType: 'contact' | 'note' | 'commitment' | 'subject' | 'relationship' | 'organization' | 'occupation' | 'sentiment';
  entityId: string;
  content: string;
  metadata?: any;
}

export interface SyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

/**
 * Generate and store embedding for a single entity
 */
export async function generateAndStoreEmbedding(params: EmbeddingParams): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anon) {
    console.warn('Supabase credentials missing, skipping embedding generation');
    return;
  }

  try {
    const supabase = createClient(url, anon, { auth: { persistSession: false } });
    
    // Generate embedding
    const embedding = await generateEmbedding(params.content);
    
    // Store in embeddings table
    const { error } = await supabase.from('embeddings').upsert({
      id: `${params.entityType}_${params.entityId}`,
      user_id: params.userId,
      entity_type: params.entityType,
      entity_id: params.entityId,
      embedding: embedding,
      content: params.content,
      metadata: params.metadata || {},
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error('Failed to store embedding:', error);
      throw error;
    }
    
    console.log(`Generated embedding for ${params.entityType}:${params.entityId}`);
  } catch (error) {
    console.error('Failed to generate and store embedding:', error);
    throw error;
  }
}

/**
 * Build searchable content string for different entity types
 */
export function buildEntityContentForEmbedding(entityType: string, entityData: any, relatedData?: any): string {
  return buildEntityContent(entityType, entityData, relatedData);
}

/**
 * Sync all embeddings for a user (called on sign-in)
 */
export async function syncUserEmbeddings(userId: string): Promise<SyncResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anon) {
    console.warn('Supabase credentials missing, skipping embedding sync');
    return { created: 0, updated: 0, skipped: 0, errors: 0 };
  }

  const result: SyncResult = { created: 0, updated: 0, skipped: 0, errors: 0 };
  
  try {
    const supabase = createClient(url, anon, { auth: { persistSession: false } });
    
    // Fetch only contacts and notes data (root entities)
    const [
      { data: contacts, error: contactsError },
      { data: notes, error: notesError }
    ] = await Promise.all([
      supabase.from('contacts').select('*').eq('user_id', userId),
      supabase.from('notes').select('*').eq('user_id', userId)
    ]);

    // Fetch all related data for comprehensive content building
    const [
      { data: subjects, error: subjectsError },
      { data: relationships, error: relationshipsError },
      { data: organizations, error: organizationsError },
      { data: occupations, error: occupationsError },
      { data: sentiments, error: sentimentsError },
      { data: commitments, error: commitmentsError },
      { data: contactRelationships, error: contactRelationshipsError },
      { data: contactSubjects, error: contactSubjectsError },
      { data: contactNotes, error: contactNotesError },
      { data: noteSentiments, error: noteSentimentsError }
    ] = await Promise.all([
      supabase.from('subjects').select('*').eq('user_id', userId),
      supabase.from('relationships').select('*').eq('user_id', userId),
      supabase.from('organizations').select('*').eq('user_id', userId),
      supabase.from('occupations').select('*').eq('user_id', userId),
      supabase.from('sentiments').select('*').eq('user_id', userId),
      supabase.from('commitments').select('*').eq('user_id', userId),
      supabase.from('contact_relationships').select('*'),
      supabase.from('contact_subjects').select('*'),
      supabase.from('contact_notes').select('*'),
      supabase.from('note_sentiments').select('*')
    ]);

    // Check for errors
    const errors = [contactsError, notesError, subjectsError, relationshipsError, 
                   organizationsError, occupationsError, sentimentsError, 
                   commitmentsError, contactRelationshipsError, contactSubjectsError,
                   contactNotesError, noteSentimentsError].filter(Boolean);
    
    if (errors.length > 0) {
      console.error('Errors fetching user data for sync:', errors);
      result.errors = errors.length;
      return result;
    }

    // Prepare related data for content building with junction table data
    const relatedData = {
      contacts: contacts || [],
      notes: notes || [],
      subjects: subjects || [],
      relationships: relationships || [],
      organizations: organizations || [],
      occupations: occupations || [],
      sentiments: sentiments || [],
      commitments: commitments || [],
      contactRelationships: contactRelationships || [],
      contactSubjects: contactSubjects || [],
      contactNotes: contactNotes || [],
      noteSentiments: noteSentiments || []
    };

    // Process only contacts and notes (root entities that contain all other data)
    const entityTypes = [
      { name: 'contact', data: contacts || [] },
      { name: 'note', data: notes || [] }
    ];
    
    console.log(`[embeddingSync] Processing ${entityTypes.reduce((sum, et) => sum + et.data.length, 0)} root entities (${contacts?.length || 0} contacts, ${notes?.length || 0} notes)`);
    console.log(`[embeddingSync] Related data counts:`, {
      subjects: subjects?.length || 0,
      relationships: relationships?.length || 0,
      organizations: organizations?.length || 0,
      occupations: occupations?.length || 0,
      sentiments: sentiments?.length || 0,
      commitments: commitments?.length || 0,
      contactRelationships: contactRelationships?.length || 0,
      contactSubjects: contactSubjects?.length || 0,
      contactNotes: contactNotes?.length || 0,
      noteSentiments: noteSentiments?.length || 0
    });

    // Process entities in batches to avoid rate limits
    const batchSize = 10;
    for (const entityType of entityTypes) {
      for (let i = 0; i < entityType.data.length; i += batchSize) {
        const batch = entityType.data.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(async (entity: any) => {
            try {
              // Check if embedding already exists
              const { data: existing } = await supabase
                .from('embeddings')
                .select('id, updated_at')
                .eq('id', `${entityType.name}_${entity.id}`)
                .single();

              const content = buildEntityContentForEmbedding(entityType.name, entity, relatedData);
              if (!content.trim()) {
                result.skipped++;
                return;
              }

              // Generate embedding
              const embedding = await generateEmbedding(content);
              
              // Store or update embedding
              const { error } = await supabase.from('embeddings').upsert({
                id: `${entityType.name}_${entity.id}`,
                user_id: userId,
                entity_type: entityType.name,
                entity_id: entity.id,
                embedding: embedding,
                content: content,
                metadata: { 
                  entityName: entity.name || entity.content?.substring(0, 50) || 'Unknown',
                  createdAt: entity.created_at || new Date().toISOString()
                },
                updated_at: new Date().toISOString()
              });

              if (error) {
                console.error(`Failed to store embedding for ${entityType.name}:${entity.id}:`, error);
                result.errors++;
              } else {
                if (existing) {
                  result.updated++;
                } else {
                  result.created++;
                }
              }
            } catch (error) {
              console.error(`Error processing ${entityType.name}:${entity.id}:`, error);
              result.errors++;
            }
          })
        );

        // Small delay between batches to respect rate limits
        if (i + batchSize < entityType.data.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    return result;
    
  } catch (error) {
    console.error('Failed to sync user embeddings:', error);
    result.errors++;
    return result;
  }
}

/**
 * Delete embedding for deleted entity
 */
export async function deleteEmbedding(entityId: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anon) {
    console.warn('Supabase credentials missing, skipping embedding deletion');
    return;
  }

  try {
    const supabase = createClient(url, anon, { auth: { persistSession: false } });
    
    const { error } = await supabase
      .from('embeddings')
      .delete()
      .eq('entity_id', entityId);

    if (error) {
      console.error('Failed to delete embedding:', error);
      throw error;
    }
    
    console.log(`Deleted embedding for entity: ${entityId}`);
  } catch (error) {
    console.error('Failed to delete embedding:', error);
    throw error;
  }
}

/**
 * Check if embeddings exist for a user
 */
export async function hasEmbeddingsForUser(userId: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anon) {
    return false;
  }

  try {
    const supabase = createClient(url, anon, { auth: { persistSession: false } });
    
    const { data, error } = await supabase
      .from('embeddings')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (error) {
      console.error('Error checking embeddings:', error);
      return false;
    }
    
    return (data && data.length > 0);
  } catch (error) {
    console.error('Failed to check embeddings:', error);
    return false;
  }
}
