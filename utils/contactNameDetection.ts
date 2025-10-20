import { Contact } from '../contexts/ContactContext';
import { generateEmbedding, searchWithPgVector } from '../app/api/utils/semanticSearch';

export interface DetectedContact {
  name: string;
  contact: Contact;
  similarity: number;
  originalText: string;
}

export interface NameDetectionResult {
  processedText: string;
  detectedContacts: DetectedContact[];
}

/**
 * Detect contact names in text using pgvector search
 */
export async function detectContactNames(
  text: string,
  contacts: Contact[],
  similarityThreshold: number = 0.7
): Promise<NameDetectionResult> {
  // Early return for empty cases
  if (!text.trim() || contacts.length === 0) {
    return { processedText: text, detectedContacts: [] };
  }

  // Quick check: if no contacts have names that could match, skip processing
  const hasPotentialMatches = contacts.some(contact => 
    contact.name && contact.name.trim().length > 0
  );
  if (!hasPotentialMatches) {
    return { processedText: text, detectedContacts: [] };
  }

  try {
    // First, use the existing name detection API to extract potential names
    const nameDetectionResponse = await fetch('/api/detect-names', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!nameDetectionResponse.ok) {
      console.error('Name detection API failed:', nameDetectionResponse.statusText);
      return detectContactNamesSimple(text, contacts);
    }

    const responseData = await nameDetectionResponse.json();

    const { names } = responseData;

    if (!names || names.length === 0) {
      return {
        processedText: text,
        detectedContacts: []
      };
    }

    // Get user ID from sessionStorage (set by ContactContext on auth)
    const userId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;

    if (!userId) {
      return detectContactNamesSimple(text, contacts);
    }

    // Use pgvector search to find matching contacts
    const detectedContacts: DetectedContact[] = [];
    let processedText = text;
    
    for (const detectedName of names) {
      try {
        // Generate embedding for the detected name
        const nameEmbedding = await generateEmbedding(detectedName);

        // Use pgvector to search for similar contacts
        const searchResults = await searchWithPgVector(detectedName, userId, 10, similarityThreshold);

        // Filter to only contact entities and find best match
        const contactResults = searchResults.filter(result => result.entityType === 'contact');

        if (contactResults.length > 0) {
          // Take the best match (highest similarity)
          const bestMatch = contactResults[0];

          // Find the actual contact object from our contacts array
          const matchingContact = contacts.find(c => c.id === bestMatch.entityId);

          if (matchingContact) {
            detectedContacts.push({
              name: matchingContact.name,
              contact: matchingContact,
              similarity: bestMatch.similarity,
              originalText: detectedName
            });

            // Replace the detected name with contact reference token
            const contactToken = `{{contact:${matchingContact.id}}}`;
            processedText = processedText.replace(
              new RegExp(detectedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
              contactToken
            );
          }
        }
      } catch (error) {
        console.error(`Failed to process detected name "${detectedName}":`, error);

        // Fallback to simple text matching for this name
        const simpleMatch = contacts.find(contact =>
          contact.name.toLowerCase().includes(detectedName.toLowerCase()) ||
          detectedName.toLowerCase().includes(contact.name.toLowerCase())
        );

        if (simpleMatch) {
          detectedContacts.push({
            name: simpleMatch.name,
            contact: simpleMatch,
            similarity: 1.0, // Perfect match for simple text matching
            originalText: detectedName
          });

          // Replace the detected name with contact reference token
          const contactToken = `{{contact:${simpleMatch.id}}}`;
          processedText = processedText.replace(
            new RegExp(detectedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
            contactToken
          );
        }
      }
    }

    return {
      processedText,
      detectedContacts
    };

  } catch (error) {
    console.error('Contact name detection failed:', error);
    return detectContactNamesSimple(text, contacts);
  }
}

/**
 * Alternative simple text-based matching for fallback
 */
export function detectContactNamesSimple(
  text: string,
  contacts: Contact[]
): NameDetectionResult {
  if (!text.trim() || contacts.length === 0) {
    return {
      processedText: text,
      detectedContacts: []
    };
  }

  const detectedContacts: DetectedContact[] = [];
  let processedText = text;

  // Simple case-insensitive matching
  for (const contact of contacts) {
    const contactName = contact.name.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Check for exact matches
    if (textLower.includes(contactName)) {
      const regex = new RegExp(contact.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      if (regex.test(text)) {
        detectedContacts.push({
          name: contact.name,
          contact: contact,
          similarity: 1.0,
          originalText: contact.name
        });

        // Replace with contact reference token
        processedText = processedText.replace(regex, `{{contact:${contact.id}}}`);
      }
    }
  }

  return {
    processedText,
    detectedContacts
  };
}
