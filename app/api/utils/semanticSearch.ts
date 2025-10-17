/**
 * Semantic search utilities for finding relevant database content
 * Uses OpenAI embeddings with pgvector for fast similarity search
 */

import { createClient } from '@supabase/supabase-js';

const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings';

// Types for search results
export interface SearchResult {
  id: string;
  entityType: 'contact' | 'note' | 'commitment' | 'subject' | 'relationship' | 'organization' | 'occupation' | 'sentiment';
  entityId: string;
  content: string;
  metadata?: any;
  similarity: number;
}

export interface LocalData {
  contacts: any[];
  notes: any[];
  subjects: any[];
  relationships: any[];
  organizations: any[];
  occupations: any[];
  sentiments: any[];
  commitments: any[];
}

/**
 * Generate embedding using OpenAI's text-embedding-3-small model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI embedding error: ${errorText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Search using pgvector embeddings table
 */
export async function searchWithPgVector(
  query: string,
  userId: string,
  topK: number = 20,
  threshold: number = 0.5
): Promise<SearchResult[]> {
  console.log('[semanticSearch] Starting pgvector search:', { query, userId, topK, threshold });
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anon) {
    console.warn('[semanticSearch] Supabase credentials missing, falling back to on-the-fly search');
    return [];
  }

  try {
    const supabase = createClient(url, anon, { auth: { persistSession: false } });
    
    // Generate embedding for the query
    console.log('[semanticSearch] Generating query embedding...');
    const queryEmbedding = await generateEmbedding(query);
    console.log('[semanticSearch] Query embedding generated, length:', queryEmbedding.length);
    
    // Use the match_embeddings SQL function
    console.log('[semanticSearch] Calling match_embeddings function...');
    const { data, error } = await supabase.rpc('match_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: topK,
      filter_user_id: userId
    });

    if (error) {
      console.error('[semanticSearch] pgvector search error:', error);
      return [];
    }

    console.log('[semanticSearch] pgvector search results:', {
      resultCount: data?.length || 0,
      results: data?.map((r: any) => ({ entityType: r.entity_type, entityId: r.entity_id, similarity: r.similarity })) || []
    });

    // Map the results to match the SearchResult interface
    return (data || []).map((item: any) => ({
      id: item.id,
      entityType: item.entity_type,  // Map snake_case to camelCase
      entityId: item.entity_id,
      content: item.content,
      metadata: item.metadata,
      similarity: item.similarity
    }));
  } catch (error) {
    console.error('[semanticSearch] Failed to search with pgvector:', error);
    return [];
  }
}

/**
 * Build searchable content string for different entity types
 */
export function buildEntityContent(entityType: string, entityData: any, relatedData?: any): string {
  console.log(`[buildEntityContent] Processing ${entityType}:${entityData.id}`);

  switch (entityType) {
    case 'contact':
      const contact = entityData;
      const occupation = relatedData?.occupations?.find((o: any) => o.id === contact.occupation_id);
      const organization = relatedData?.organizations?.find((o: any) => o.id === contact.organization_id);
      const relationships = relatedData?.relationships?.filter((r: any) => contact.relationship_ids?.includes(r.id));
      const subjects = relatedData?.subjects?.filter((s: any) => contact.subject_ids?.includes(s.id));
      
      // Format birthday if available
      const formatBirthday = (birthDate?: any): string => {
        if (!birthDate) return '';
        const parts = [];
        if (birthDate.year) parts.push(birthDate.year.toString());
        if (birthDate.month) parts.push(birthDate.month.toString().padStart(2, '0'));
        if (birthDate.day) parts.push(birthDate.day.toString().padStart(2, '0'));
        return parts.length > 0 ? `Born: ${parts.join('-')}` : '';
      };
      
      const content = [
        contact.name,
        occupation?.title,
        organization?.name,
        relationships?.map((r: any) => r.label).join(' '),
        subjects?.map((s: any) => s.label).join(' '),
        formatBirthday(contact.birth_date), // Include birth date for age/personality context
        contact.last_interaction ? `last interaction ${contact.last_interaction}` : '',
      ].filter(Boolean).join(' ');
      
      console.log(`[buildEntityContent] Contact ${contact.name}: ${content.substring(0, 100)}...`);
      
      return content;

    case 'note':
      const note = entityData;
      const noteContacts = relatedData?.contacts?.filter((c: any) => note.contact_ids?.includes(c.id));
      const noteSentiments = relatedData?.sentiments?.filter((s: any) => note.sentiment_ids?.includes(s.id));
      
      // Format date if available (actual event date, not created_at)
      const formatDate = (date?: any): string => {
        if (!date) return '';
        const parts = [];
        if (date.year) parts.push(date.year.toString());
        if (date.month) parts.push(date.month.toString().padStart(2, '0'));
        if (date.day) parts.push(date.day.toString().padStart(2, '0'));
        return parts.length > 0 ? `Date: ${parts.join('-')}` : '';
      };
      
      // Format time if available
      const formatTime = (time?: any): string => {
        if (!time) return '';
        return `Time: ${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
      };
      
      console.log(`[buildEntityContent] Note ${note.id}: ${note.title || 'Untitled'} - ${note.text?.substring(0, 50) || 'No text'}...`);
      
      return [
        note.title || '', // Include title
        note.text || '', // Use 'text' field from Note interface
        noteContacts?.map((c: any) => c.name).join(' '),
        noteSentiments?.map((s: any) => s.label).join(' '), // Use 'label' for sentiments
        formatDate(note.date), // Include actual event date
        formatTime(note.time_value), // Include actual event time
        note.created_at ? `recorded ${note.created_at}` : '', // Clarify this is recording time, not event time
      ].filter(Boolean).join(' ');

    case 'commitment':
      const commitment = entityData;
      const commitmentContacts = relatedData?.contacts?.filter((c: any) => commitment.contact_ids?.includes(c.id));
      
      return [
        commitment.text, // Use 'text' instead of 'description'
        commitmentContacts?.map((c: any) => c.name).join(' '),
        commitment.time ? `due ${commitment.time}` : '', // Use 'time' instead of 'due_date'
        commitment.is_trashed ? `Status: trashed` : 'Status: active' // Use 'is_trashed' instead of 'status'
      ].filter(Boolean).join(' ');

    case 'subject':
      return entityData.name || '';

    case 'relationship':
      return entityData.name || '';

    case 'organization':
      return entityData.name || '';

    case 'occupation':
      return entityData.name || '';

    case 'sentiment':
      return entityData.name || '';

    default:
      return JSON.stringify(entityData);
  }
}

/**
 * Search through local data using on-the-fly embeddings
 */
export async function searchOnTheFly(
  query: string,
  localData: LocalData,
  topK: number = 20
): Promise<SearchResult[]> {
  try {
    console.log('[semanticSearch] Starting on-the-fly search:', { query, topK });
    
    // Generate embedding for the query
    console.log('[semanticSearch] Generating query embedding for on-the-fly search...');
    const queryEmbedding = await generateEmbedding(query);
    console.log('[semanticSearch] Query embedding generated, length:', queryEmbedding.length);
    
    const allEntities: Array<{ entityType: string; entityId: string; entityData: any; relatedData: LocalData }> = [];
    
    // Collect all entities with their related data
    Object.entries(localData).forEach(([key, entities]) => {
      if (Array.isArray(entities)) {
        console.log(`[semanticSearch] Processing ${key}: ${entities.length} entities`);
        entities.forEach(entity => {
          allEntities.push({
            entityType: key.slice(0, -1), // Remove 's' from plural
            entityId: entity.id,
            entityData: entity,
            relatedData: localData
          });
        });
      }
    });

    console.log('[semanticSearch] Total entities to process:', allEntities.length);

    // Generate embeddings for all entities and calculate similarities
    const results: SearchResult[] = [];
    
    for (const entity of allEntities) {
      try {
        const content = buildEntityContent(entity.entityType, entity.entityData, entity.relatedData);
        if (!content.trim()) {
          console.log(`[semanticSearch] Skipping empty content for ${entity.entityType}:${entity.entityId}`);
          continue;
        }
        
        const entityEmbedding = await generateEmbedding(content);
        const similarity = cosineSimilarity(queryEmbedding, entityEmbedding);
        
        results.push({
          id: `${entity.entityType}_${entity.entityId}`,
          entityType: entity.entityType as any,
          entityId: entity.entityId,
          content,
          metadata: { originalData: entity.entityData },
          similarity
        });
      } catch (error) {
        console.error(`[semanticSearch] Failed to process entity ${entity.entityId}:`, error);
      }
    }

    console.log('[semanticSearch] On-the-fly search results:', {
      totalProcessed: results.length,
      topResults: results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5)
        .map(r => ({ entityType: r.entityType, entityId: r.entityId, similarity: r.similarity }))
    });

    // Sort by similarity and return top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
      
  } catch (error) {
    console.error('[semanticSearch] Failed to search on-the-fly:', error);
    return [];
  }
}

/**
 * Main search function that tries pgvector first, falls back to on-the-fly
 */
export async function searchRelevantData(
  query: string,
  userId?: string,
  localData?: LocalData,
  topK: number = 20
): Promise<SearchResult[]> {
  console.log('[semanticSearch] searchRelevantData called:', { query, userId: userId || 'none', hasLocalData: !!localData, topK });
  
  // If local data is provided, use on-the-fly search
  if (localData) {
    console.log('[semanticSearch] Using on-the-fly search with local data');
    return searchOnTheFly(query, localData, topK);
  }

  // If user ID is provided, try pgvector first
  if (userId) {
    console.log('[semanticSearch] Using pgvector search with userId');
    const pgVectorResults = await searchWithPgVector(query, userId, topK);
    if (pgVectorResults.length > 0) {
      console.log('[semanticSearch] pgvector search successful, returning results');
      return pgVectorResults;
    } else {
      console.log('[semanticSearch] pgvector search returned no results');
    }
  }

  // Fallback: if no embeddings exist yet, we'll need to fetch data and search on-the-fly
  // This will be handled by the retrieveRelevantData function
  console.log('[semanticSearch] No search method available, returning empty results');
  return [];
}
