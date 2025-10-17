/**
 * Relevant data retrieval orchestrator
 * Main function that coordinates semantic search and data formatting
 */

import { createClient } from '@supabase/supabase-js';
import { searchRelevantData, LocalData, SearchResult } from './semanticSearch';
import { formatDatabaseContext, formatAllData, FormattedContext } from './formatDbContext';

/**
 * Fetch all data from Supabase for a user
 */
async function fetchAllUserData(userId: string): Promise<FormattedContext | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anon) {
    console.warn('Supabase credentials missing');
    return null;
  }

  try {
    const supabase = createClient(url, anon, { auth: { persistSession: false } });
    
    // Fetch all data in parallel
    const [
      { data: contacts, error: contactsError },
      { data: notes, error: notesError },
      { data: subjects, error: subjectsError },
      { data: relationships, error: relationshipsError },
      { data: organizations, error: organizationsError },
      { data: occupations, error: occupationsError },
      { data: sentiments, error: sentimentsError },
      { data: commitments, error: commitmentsError }
    ] = await Promise.all([
      supabase.from('contacts').select('*').eq('user_id', userId),
      supabase.from('notes').select('*').eq('user_id', userId),
      supabase.from('subjects').select('*').eq('user_id', userId),
      supabase.from('relationships').select('*').eq('user_id', userId),
      supabase.from('organizations').select('*').eq('user_id', userId),
      supabase.from('occupations').select('*').eq('user_id', userId),
      supabase.from('sentiments').select('*').eq('user_id', userId),
      supabase.from('commitments').select('*').eq('user_id', userId)
    ]);

    // Check for errors
    const errors = [contactsError, notesError, subjectsError, relationshipsError, 
                   organizationsError, occupationsError, sentimentsError, 
                   commitmentsError].filter(Boolean);
    
    if (errors.length > 0) {
      console.error('Errors fetching user data:', errors);
      return null;
    }

    return {
      contacts: contacts || [],
      notes: notes || [],
      subjects: subjects || [],
      relationships: relationships || [],
      organizations: organizations || [],
      occupations: occupations || [],
      sentiments: sentiments || [],
      commitments: commitments || []
    };
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return null;
  }
}

/**
 * Convert local data to FormattedContext format
 */
function convertLocalDataToFormattedContext(localData: LocalData): FormattedContext {
  return {
    contacts: localData.contacts || [],
    notes: localData.notes || [],
    subjects: localData.subjects || [],
    relationships: localData.relationships || [],
    organizations: localData.organizations || [],
    occupations: localData.occupations || [],
    sentiments: localData.sentiments || [],
    commitments: localData.commitments || []
  };
}

/**
 * Main function to get relevant context for AI processing
 */
export async function getRelevantContext(
  userQuery: string,
  userId?: string,
  localData?: LocalData,
  topK: number = 20
): Promise<string> {
  try {
    console.log('[retrieveRelevantData] Starting context retrieval:', {
      userQuery,
      userId: userId || 'none',
      hasLocalData: !!localData,
      topK
    });

    let allData: FormattedContext | null = null;
    let searchResults: SearchResult[] = [];

    // Determine data source
    if (localData) {
      // Offline mode: use local data
      console.log('[retrieveRelevantData] Using local data mode');
      allData = convertLocalDataToFormattedContext(localData);
      console.log('[retrieveRelevantData] Local data counts:', {
        contacts: allData.contacts.length,
        notes: allData.notes.length,
        subjects: allData.subjects.length,
        relationships: allData.relationships.length,
        organizations: allData.organizations.length,
        occupations: allData.occupations.length,
        sentiments: allData.sentiments.length,
        commitments: allData.commitments.length
      });
      searchResults = await searchRelevantData(userQuery, userId, localData, topK);
    } else if (userId) {
      // Online mode: fetch from Supabase
      console.log('[retrieveRelevantData] Using online mode, fetching from Supabase');
      allData = await fetchAllUserData(userId);
      if (allData) {
        console.log('[retrieveRelevantData] Fetched data counts:', {
          contacts: allData.contacts.length,
          notes: allData.notes.length,
          subjects: allData.subjects.length,
          relationships: allData.relationships.length,
          organizations: allData.organizations.length,
          occupations: allData.occupations.length,
          sentiments: allData.sentiments.length,
          commitments: allData.commitments.length
        });
        
        // Try semantic search first
        console.log('[retrieveRelevantData] Attempting semantic search with pgvector');
        searchResults = await searchRelevantData(userQuery, userId, undefined, topK);
        console.log('[retrieveRelevantData] Semantic search results:', {
          resultCount: searchResults.length,
          results: searchResults.map(r => ({ entityType: r.entityType, entityId: r.entityId, similarity: r.similarity }))
        });
        
        // If no search results (empty embeddings table), fall back to on-the-fly search
        if (searchResults.length === 0) {
          console.log('[retrieveRelevantData] No embeddings found, performing on-the-fly search');
          const localDataForSearch: LocalData = {
            contacts: allData.contacts,
            notes: allData.notes,
            subjects: allData.subjects,
            relationships: allData.relationships,
            organizations: allData.organizations,
            occupations: allData.occupations,
            sentiments: allData.sentiments,
            commitments: allData.commitments
          };
          searchResults = await searchRelevantData(userQuery, userId, localDataForSearch, topK);
          console.log('[retrieveRelevantData] On-the-fly search results:', {
            resultCount: searchResults.length,
            results: searchResults.map(r => ({ entityType: r.entityType, entityId: r.entityId, similarity: r.similarity }))
          });
        }
      } else {
        console.log('[retrieveRelevantData] Failed to fetch user data from Supabase');
      }
    } else {
      console.log('[retrieveRelevantData] No userId or localData provided');
    }

    // If no data available, return empty context
    if (!allData) {
      console.warn('[retrieveRelevantData] No data available for context generation');
      return 'No data available.';
    }

    // Format the context
    if (searchResults.length > 0) {
      // Use search results to format relevant data
      console.log('[retrieveRelevantData] Formatting context from search results');
      const formattedContext = formatDatabaseContext(searchResults, allData);
      console.log('[retrieveRelevantData] Formatted context length:', formattedContext.length);
      return formattedContext;
    } else {
      // Fallback: format all data (truncated)
      console.log('[retrieveRelevantData] No search results, using fallback - formatting all data');
      const formattedContext = formatAllData(allData, 4000); // Use smaller limit for fallback
      console.log('[retrieveRelevantData] Fallback context length:', formattedContext.length);
      return formattedContext;
    }

  } catch (error) {
    console.error('Failed to get relevant context:', error);
    return 'Error retrieving data.';
  }
}

/**
 * Get context for specific entity types only
 */
export async function getRelevantContextForTypes(
  userQuery: string,
  entityTypes: string[],
  userId?: string,
  localData?: LocalData,
  topK: number = 20
): Promise<string> {
  try {
    const fullContext = await getRelevantContext(userQuery, userId, localData, topK);
    
    // Filter context to only include specified entity types
    const lines = fullContext.split('\n');
    const filteredLines: string[] = [];
    let currentSection = '';
    let includeCurrentSection = false;
    
    for (const line of lines) {
      if (line.startsWith('=== ') && line.endsWith(' ===')) {
        currentSection = line.toLowerCase();
        includeCurrentSection = entityTypes.some(type => 
          currentSection.includes(type.toLowerCase())
        );
      }
      
      if (includeCurrentSection || !line.startsWith('===')) {
        filteredLines.push(line);
      }
    }
    
    return filteredLines.join('\n');
  } catch (error) {
    console.error('Failed to get filtered context:', error);
    return 'Error retrieving filtered data.';
  }
}

/**
 * Check if embeddings table has data for a user
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
