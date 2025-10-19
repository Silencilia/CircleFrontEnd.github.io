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
 * Search using pgvector embeddings table with retry logic
 * Tries progressively lower thresholds if no results are found
 */
export async function searchWithPgVector(
  query: string,
  userId: string,
  topK: number = 20,
  threshold: number = 0.5
): Promise<SearchResult[]> {
  console.log('[semanticSearch] Starting pgvector search with retry logic:', { query, userId, topK, threshold });
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anon) {
    console.warn('[semanticSearch] Supabase credentials missing, falling back to on-the-fly search');
    return [];
  }

  // Define retry thresholds - progressively lower to catch more results
  const retryThresholds = [threshold, 0.4, 0.3];
  
  try {
    const supabase = createClient(url, anon, { auth: { persistSession: false } });
    
    // Generate embedding for the query (only once)
    console.log('[semanticSearch] Generating query embedding...');
    const queryEmbedding = await generateEmbedding(query);
    console.log('[semanticSearch] Query embedding generated, length:', queryEmbedding.length);
    
    // Try each threshold until we get results
    for (let i = 0; i < retryThresholds.length; i++) {
      const currentThreshold = retryThresholds[i];
      console.log(`[semanticSearch] Attempt ${i + 1}/${retryThresholds.length} with threshold ${currentThreshold}`);
      
      const { data, error } = await supabase.rpc('match_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: currentThreshold,
        match_count: topK,
        filter_user_id: userId
      });

      if (error) {
        console.error(`[semanticSearch] pgvector search error with threshold ${currentThreshold}:`, error);
        continue; // Try next threshold
      }

      const resultCount = data?.length || 0;
      console.log(`[semanticSearch] Threshold ${currentThreshold} returned ${resultCount} results`);

      if (resultCount > 0) {
        console.log('[semanticSearch] pgvector search successful:', {
          threshold: currentThreshold,
          resultCount,
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
      }
    }

    console.log('[semanticSearch] All threshold attempts failed, returning empty results');
    return [];
  } catch (error) {
    console.error('[semanticSearch] Failed to search with pgvector:', error);
    return [];
  }
}

/**
 * Resolve contact tokens in text for AI context
 * Converts {{contact:uuid}} tokens to actual contact names
 */
function resolveContactTokensForAI(text: string, contacts: any[]): string {
  if (!text) return text;
  const re = /\{\{\s*contact\s*:\s*([^}]+)\s*\}\}/g;
  return text.replace(re, (_match, idStr) => {
    const id = idStr.trim();
    const contact = contacts?.find(c => c.id === id);
    return contact?.name ?? `[Contact ${id}]`;
  });
}

/**
 * Build searchable content string for different entity types
 * Only generates content for contacts and notes - all other entity data is embedded within these
 */
export function buildEntityContent(entityType: string, entityData: any, relatedData?: any): string {
  switch (entityType) {
    case 'contact':
      const contact = entityData;
      const occupation = relatedData?.occupations?.find((o: any) => o.id === contact.occupation_id);
      const organization = relatedData?.organizations?.find((o: any) => o.id === contact.organization_id);
      
      // Get relationships and subjects through junction tables
      const contactRelationshipIds = relatedData?.contactRelationships
        ?.filter((cr: any) => cr.contact_id === contact.id)
        ?.map((cr: any) => cr.relationship_id) || [];
      const relationships = relatedData?.relationships?.filter((r: any) => contactRelationshipIds.includes(r.id));
      
      const contactSubjectIds = relatedData?.contactSubjects
        ?.filter((cs: any) => cs.contact_id === contact.id)
        ?.map((cs: any) => cs.subject_id) || [];
      const subjects = relatedData?.subjects?.filter((s: any) => contactSubjectIds.includes(s.id));
      
      // Format birthday if available (check both birth_date object and individual fields)
      const formatBirthday = (contact: any): string => {
        const parts = [];
        
        // Check if birth_date is an object
        if (contact.birth_date?.year) {
          parts.push(contact.birth_date.year.toString());
          if (contact.birth_date.month) parts.push(contact.birth_date.month.toString().padStart(2, '0'));
          if (contact.birth_date.day) parts.push(contact.birth_date.day.toString().padStart(2, '0'));
        }
        // Check individual fields
        else if (contact.birth_year) {
          parts.push(contact.birth_year.toString());
          if (contact.birth_month) parts.push(contact.birth_month.toString().padStart(2, '0'));
          if (contact.birth_day) parts.push(contact.birth_day.toString().padStart(2, '0'));
        }
        
        return parts.length > 0 ? `Born: ${parts.join('-')}` : '';
      };
      
      // Build comprehensive contact content including all related data
      const occupationOrg = [
        occupation?.title,
        organization?.name ? `at ${organization.name}` : ''
      ].filter(Boolean).join(' ');
      
      const content = [
        contact.name,
        occupationOrg || '',
        relationships?.length > 0 ? `Relationships: ${relationships.map((r: any) => r.label).join(', ')}` : '',
        subjects?.length > 0 ? `Subjects: ${subjects.map((s: any) => s.label).join(', ')}` : '',
        formatBirthday(contact),
      ].filter(Boolean).join(' | ');
      
      return content;

    case 'note':
      const note = entityData;
      
      // Get contacts and sentiments through junction tables
      const noteContactIds = relatedData?.contactNotes
        ?.filter((cn: any) => cn.note_id === note.id)
        ?.map((cn: any) => cn.contact_id) || [];
      const noteContacts = relatedData?.contacts?.filter((c: any) => noteContactIds.includes(c.id));
      
      const noteSentimentIds = relatedData?.noteSentiments
        ?.filter((ns: any) => ns.note_id === note.id)
        ?.map((ns: any) => ns.sentiment_id) || [];
      const noteSentiments = relatedData?.sentiments?.filter((s: any) => noteSentimentIds.includes(s.id));
      
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
      
      // Resolve contact UUIDs in note text to actual names
      const resolvedText = resolveContactTokensForAI(note.text || '', relatedData?.contacts || []);
      
      // Build comprehensive note content including all related data
      return [
        note.title ? `Title: ${note.title}` : '',
        resolvedText,
        noteContacts?.length > 0 ? `With: ${noteContacts.map((c: any) => c.name).join(', ')}` : '',
        noteSentiments?.length > 0 ? `Sentiments: ${noteSentiments.map((s: any) => s.label).join(', ')}` : '',
        formatDate(note.date),
        formatTime(note.time_value),
        note.created_at ? `Recorded: ${note.created_at}` : ''
      ].filter(Boolean).join(' | ');

    // Only contacts and notes should have embeddings - all other entity types return empty string
    case 'commitment':
    case 'subject':
    case 'relationship':
    case 'organization':
    case 'occupation':
    case 'sentiment':
      return '';

    default:
      return '';
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
    
    // Collect only contacts and notes (root entities that contain all other data)
    const rootEntityTypes = ['contacts', 'notes'];
    rootEntityTypes.forEach((key) => {
      const entities = localData[key as keyof LocalData];
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

    console.log('[semanticSearch] Total root entities to process:', allEntities.length, '(contacts and notes only)');

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

  // If user ID is provided, try pgvector first with retry logic
  if (userId) {
    console.log('[semanticSearch] Using pgvector search with retry logic');
    const pgVectorResults = await searchWithPgVector(query, userId, topK);
    if (pgVectorResults.length > 0) {
      console.log('[semanticSearch] pgvector search successful, returning results');
      return pgVectorResults;
    } else {
      console.log('[semanticSearch] pgvector search with retry logic returned no results');
    }
  }

  // Fallback: if no embeddings exist yet, we'll need to fetch data and search on-the-fly
  // This will be handled by the retrieveRelevantData function
  console.log('[semanticSearch] No search method available, returning empty results');
  return [];
}
