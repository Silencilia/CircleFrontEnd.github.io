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
  console.log('=== detectContactNames called ===');
  console.log('text:', text);
  console.log('contacts.length:', contacts.length);
  console.log('similarityThreshold:', similarityThreshold);

  if (!text.trim() || contacts.length === 0) {
    console.log('Early return: empty text or no contacts');
    return {
      processedText: text,
      detectedContacts: []
    };
  }

  try {
    console.log('=== Calling name detection API ===');
    // First, use the existing name detection API to extract potential names
    const nameDetectionResponse = await fetch('/api/detect-names', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    console.log('Name detection API response status:', nameDetectionResponse.status);
    console.log('Name detection API response ok:', nameDetectionResponse.ok);

    if (!nameDetectionResponse.ok) {
      console.error('Name detection API failed:', nameDetectionResponse.statusText);
      console.log('Falling back to simple contact name detection');
      return detectContactNamesSimple(text, contacts);
    }

    const responseData = await nameDetectionResponse.json();
    console.log('Name detection API response data:', responseData);

    const { names } = responseData;

    if (!names || names.length === 0) {
      console.log('No names detected by API');
      return {
        processedText: text,
        detectedContacts: []
      };
    }

    console.log('Detected potential names:', names);

    // Get user ID from sessionStorage (set by ContactContext on auth)
    const userId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
    console.log('Retrieved userId from sessionStorage:', userId);
    console.log('typeof window:', typeof window);
    console.log('sessionStorage available:', typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined');

    if (!userId) {
      console.log('❌ No user ID available, falling back to simple detection');
      return detectContactNamesSimple(text, contacts);
    }

    // Use pgvector search to find matching contacts
    const detectedContacts: DetectedContact[] = [];
    let processedText = text;

    console.log('=== Starting pgvector search ===');
    for (const detectedName of names) {
      console.log(`Processing detected name: "${detectedName}"`);
      try {
        // Generate embedding for the detected name
        console.log(`Generating embedding for: "${detectedName}"`);
        const nameEmbedding = await generateEmbedding(detectedName);
        console.log(`Generated embedding for "${detectedName}", length:`, nameEmbedding.length);

        // Use pgvector to search for similar contacts
        console.log(`🔍 Searching pgvector for contacts similar to "${detectedName}"`);
        console.log(`Search parameters: query="${detectedName}", userId="${userId}", topK=10, threshold=${similarityThreshold}`);

        const searchResults = await searchWithPgVector(detectedName, userId, 10, similarityThreshold);
        console.log(`📊 pgvector search returned ${searchResults.length} results for "${detectedName}"`);
        console.log('Search results details:', searchResults.map(r => ({
          entityType: r.entityType,
          entityId: r.entityId,
          content: r.content.substring(0, 100) + '...',
          similarity: r.similarity
        })));

        // Filter to only contact entities and find best match
        const contactResults = searchResults.filter(result => result.entityType === 'contact');
        console.log(`🎯 Found ${contactResults.length} contact results`);
        console.log('Contact results:', contactResults.map(r => ({
          entityId: r.entityId,
          content: r.content.substring(0, 100) + '...',
          similarity: r.similarity
        })));

        if (contactResults.length > 0) {
          // Take the best match (highest similarity)
          const bestMatch = contactResults[0];
          console.log(`Best match: ${bestMatch.content} (similarity: ${bestMatch.similarity})`);

          // Find the actual contact object from our contacts array
          const matchingContact = contacts.find(c => c.id === bestMatch.entityId);

          if (matchingContact) {
            console.log(`Found matching contact: "${matchingContact.name}"`);
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
            console.log(`Replaced "${detectedName}" with "${contactToken}"`);
          } else {
            console.log(`Contact not found in local contacts array: ${bestMatch.entityId}`);
          }
        } else {
          console.log(`No contact matches found for "${detectedName}"`);
        }
      } catch (error) {
        console.error(`Failed to process detected name "${detectedName}":`, error);
        console.log(`Falling back to simple matching for "${detectedName}"`);

        // Fallback to simple text matching for this name
        const simpleMatch = contacts.find(contact =>
          contact.name.toLowerCase().includes(detectedName.toLowerCase()) ||
          detectedName.toLowerCase().includes(contact.name.toLowerCase())
        );

        if (simpleMatch) {
          console.log(`Simple match found for "${detectedName}" -> "${simpleMatch.name}"`);
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
          console.log(`Replaced "${detectedName}" with "${contactToken}"`);
        } else {
          console.log(`No simple match found for "${detectedName}"`);
        }
      }
    }

    console.log('Contact name detection results:', {
      originalText: text,
      processedText,
      detectedContacts: detectedContacts.map(dc => ({
        originalText: dc.originalText,
        contactName: dc.name,
        similarity: dc.similarity
      }))
    });

    return {
      processedText,
      detectedContacts
    };

  } catch (error) {
    console.error('Contact name detection failed:', error);
    console.log('Falling back to simple contact name detection');
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
