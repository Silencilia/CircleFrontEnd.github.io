/**
 * Database context formatter for converting database records into LLM-readable text
 */

import { Contact, Note, Subject, Relationship, Organization, Occupation, Sentiment, Commitment } from '../../../contexts/ContactContext';

export interface FormattedContext {
  contacts: Contact[];
  notes: Note[];
  subjects: Subject[];
  relationships: Relationship[];
  organizations: Organization[];
  occupations: Occupation[];
  sentiments: Sentiment[];
  commitments: Commitment[];
}

export interface SearchResult {
  id: string;
  entityType: string;
  entityId: string;
  content: string;
  metadata?: any;
  similarity: number;
}

/**
 * Format a single contact with related data
 */
export function formatContact(contact: Contact, relatedData: FormattedContext): string {
  const occupation = relatedData.occupations.find(o => o.id === contact.occupation_id);
  const organization = relatedData.organizations.find(o => o.id === contact.organization_id);
  const relationships = relatedData.relationships.filter(r => contact.relationship_ids?.includes(r.id));
  const subjects = relatedData.subjects.filter(s => contact.subject_ids?.includes(s.id));
  const notes = relatedData.notes.filter(n => n.contact_ids?.includes(contact.id));
  
  const parts = [
    contact.name,
    occupation ? `(${occupation.title}${organization ? ` at ${organization.name}` : ''})` : '',
    relationships.length > 0 ? `Relationships: ${relationships.map(r => r.label).join(', ')}` : '',
    subjects.length > 0 ? `Subjects: ${subjects.map(s => s.label).join(', ')}` : '',
    contact.last_interaction ? `Last interaction: ${contact.last_interaction}` : '',
    notes.length > 0 ? `Related notes: ${notes.length}` : ''
  ].filter(Boolean);
  
  return parts.join(' | ');
}

/**
 * Format a single note with related data
 */
export function formatNote(note: Note, relatedData: FormattedContext): string {
  const contacts = relatedData.contacts.filter(c => note.contact_ids?.includes(c.id));
  const sentiments = relatedData.sentiments.filter(s => note.sentiment_ids?.includes(s.id));
  const commitments = relatedData.commitments.filter(c => c.contact_ids?.some(id => note.contact_ids?.includes(id)));
  
  const parts = [
    `[${note.created_at}]`,
    contacts.length > 0 ? `With: ${contacts.map(c => c.name).join(', ')}` : '',
    note.text,
    sentiments.length > 0 ? `Sentiments: ${sentiments.map(s => s.label).join(', ')}` : '',
    commitments.length > 0 ? `Commitments: ${commitments.length}` : ''
  ].filter(Boolean);
  
  return parts.join(' | ');
}

/**
 * Format a single commitment with related data
 */
export function formatCommitment(commitment: Commitment, relatedData: FormattedContext): string {
  const contacts = relatedData.contacts.filter(c => commitment.contact_ids?.includes(c.id));
  
  const parts = [
    commitment.text,
    contacts.length > 0 ? `With: ${contacts.map(c => c.name).join(', ')}` : '',
    commitment.time ? `Due: ${commitment.time}` : '',
    commitment.is_trashed ? `Status: trashed` : 'Status: active'
  ].filter(Boolean);
  
  return parts.join(' | ');
}

/**
 * Count approximate tokens in text (rough estimation)
 */
export function countTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit within token limit
 */
export function truncateToTokenLimit(text: string, maxTokens: number): string {
  const currentTokens = countTokens(text);
  if (currentTokens <= maxTokens) {
    return text;
  }
  
  // Calculate target character count
  const targetChars = Math.floor(maxTokens * 4 * 0.9); // Use 90% of limit for safety
  return text.substring(0, targetChars) + '...';
}

/**
 * Format database context from search results and full data
 */
export function formatDatabaseContext(
  searchResults: SearchResult[],
  allData: FormattedContext,
  maxTokens: number = 8000
): string {
  console.log('[formatDbContext] Formatting database context:', {
    searchResultsCount: searchResults.length,
    allDataCounts: {
      contacts: allData.contacts.length,
      notes: allData.notes.length,
      subjects: allData.subjects.length,
      relationships: allData.relationships.length,
      organizations: allData.organizations.length,
      occupations: allData.occupations.length,
      sentiments: allData.sentiments.length,
      commitments: allData.commitments.length
    },
    maxTokens
  });

  // Group results by entity type
  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.entityType]) {
      acc[result.entityType] = [];
    }
    acc[result.entityType].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  console.log('[formatDbContext] Grouped results by entity type:', Object.keys(groupedResults));

  const sections: string[] = [];
  
  // Format each entity type section
  Object.entries(groupedResults).forEach(([entityType, results]) => {
    const sortedResults = results.sort((a, b) => b.similarity - a.similarity);
    
    switch (entityType) {
      case 'contact':
        const contacts = sortedResults.map(r => {
          const contact = allData.contacts.find(c => c.id === r.entityId);
          return contact ? formatContact(contact, allData) : r.content;
        });
        if (contacts.length > 0) {
          sections.push(`=== CONTACTS (${contacts.length} found) ===\n${contacts.map((c, i) => `${i + 1}. ${c}`).join('\n')}`);
        }
        break;
        
      case 'note':
        const notes = sortedResults.map(r => {
          const note = allData.notes.find(n => n.id === r.entityId);
          return note ? formatNote(note, allData) : r.content;
        });
        if (notes.length > 0) {
          sections.push(`=== NOTES (${notes.length} found) ===\n${notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}`);
        }
        break;
        
      case 'commitment':
        const commitments = sortedResults.map(r => {
          const commitment = allData.commitments.find(c => c.id === r.entityId);
          return commitment ? formatCommitment(commitment, allData) : r.content;
        });
        if (commitments.length > 0) {
          sections.push(`=== COMMITMENTS (${commitments.length} found) ===\n${commitments.map((c, i) => `${i + 1}. ${c}`).join('\n')}`);
        }
        break;
        
      case 'subject':
        const subjects = sortedResults.map(r => {
          const subject = allData.subjects.find(s => s.id === r.entityId);
          return subject ? subject.label : r.content;
        });
        if (subjects.length > 0) {
          sections.push(`=== SUBJECTS (${subjects.length} found) ===\n${subjects.map((s, i) => `${i + 1}. ${s}`).join('\n')}`);
        }
        break;
        
      case 'relationship':
        const relationships = sortedResults.map(r => {
          const relationship = allData.relationships.find(rel => rel.id === r.entityId);
          return relationship ? relationship.label : r.content;
        });
        if (relationships.length > 0) {
          sections.push(`=== RELATIONSHIPS (${relationships.length} found) ===\n${relationships.map((r, i) => `${i + 1}. ${r}`).join('\n')}`);
        }
        break;
        
      case 'organization':
        const organizations = sortedResults.map(r => {
          const organization = allData.organizations.find(o => o.id === r.entityId);
          return organization ? organization.name : r.content;
        });
        if (organizations.length > 0) {
          sections.push(`=== ORGANIZATIONS (${organizations.length} found) ===\n${organizations.map((o, i) => `${i + 1}. ${o}`).join('\n')}`);
        }
        break;
        
      case 'occupation':
        const occupations = sortedResults.map(r => {
          const occupation = allData.occupations.find(occ => occ.id === r.entityId);
          return occupation ? occupation.title : r.content;
        });
        if (occupations.length > 0) {
          sections.push(`=== OCCUPATIONS (${occupations.length} found) ===\n${occupations.map((o, i) => `${i + 1}. ${o}`).join('\n')}`);
        }
        break;
        
      case 'sentiment':
        const sentiments = sortedResults.map(r => {
          const sentiment = allData.sentiments.find(s => s.id === r.entityId);
          return sentiment ? sentiment.label : r.content;
        });
        if (sentiments.length > 0) {
          sections.push(`=== SENTIMENTS (${sentiments.length} found) ===\n${sentiments.map((s, i) => `${i + 1}. ${s}`).join('\n')}`);
        }
        break;
    }
  });

  const formattedContext = sections.join('\n\n');
  
  console.log('[formatDbContext] Formatted context sections:', {
    sectionCount: sections.length,
    totalLength: formattedContext.length,
    sections: sections.map(s => s.substring(0, 100) + '...')
  });
  
  // Apply token limit truncation
  const finalContext = truncateToTokenLimit(formattedContext, maxTokens);
  console.log('[formatDbContext] Final context length after truncation:', finalContext.length);
  
  return finalContext;
}

/**
 * Format all data when no specific search results (fallback)
 */
export function formatAllData(allData: FormattedContext, maxTokens: number = 8000): string {
  const sections: string[] = [];
  
  if (allData.contacts.length > 0) {
    const contacts = allData.contacts.map(c => formatContact(c, allData));
    sections.push(`=== CONTACTS (${contacts.length} total) ===\n${contacts.map((c, i) => `${i + 1}. ${c}`).join('\n')}`);
  }
  
  if (allData.notes.length > 0) {
    const notes = allData.notes.map(n => formatNote(n, allData));
    sections.push(`=== NOTES (${notes.length} total) ===\n${notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}`);
  }
  
  if (allData.commitments.length > 0) {
    const commitments = allData.commitments.map(c => formatCommitment(c, allData));
    sections.push(`=== COMMITMENTS (${commitments.length} total) ===\n${commitments.map((c, i) => `${i + 1}. ${c}`).join('\n')}`);
  }
  
  const formattedContext = sections.join('\n\n');
  
  // Apply token limit truncation
  return truncateToTokenLimit(formattedContext, maxTokens);
}
