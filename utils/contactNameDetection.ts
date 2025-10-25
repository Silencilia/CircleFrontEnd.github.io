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

// New classification utility to map detected human names to existing contacts or new names
export interface ClassifiedExistingMatch {
  contact: Contact;
  original: string; // original detected string form
  snippet: string; // short context
}

export interface ClassifiedNewName {
  name: string;
  snippet: string;
}

export interface ClassifiedNamesResult {
  existing: ClassifiedExistingMatch[];
  newOnes: ClassifiedNewName[];
}

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

  // initials handling, e.g., "J S" vs "John Smith"
  const initials = tC.every((t) => t.length === 1);
  if (initials && tC.length <= tN.length) {
    let matched = 0;
    for (let i = 0; i < tC.length && i < tN.length; i++) {
      if (tC[i][0] === tN[i][0]) matched++;
    }
    if (matched === tC.length) return true;
  }

  return false;
}

export function classifyDetectedNames(
  detected: Array<{ name: string; occurrences: Array<{ snippet: string }> }>,
  contacts: Contact[]
): ClassifiedNamesResult {
  const existing: ClassifiedExistingMatch[] = [];
  const newOnes: ClassifiedNewName[] = [];

  for (const d of detected) {
    const original = d.name;
    const snippet = d.occurrences?.[0]?.snippet || original;

    // find best fuzzy match
    let best: Contact | undefined;
    for (const c of contacts) {
      if (isFuzzyMatch(original, c.name)) {
        best = c;
        break;
      }
    }

    if (best) {
      existing.push({ contact: best, original, snippet });
    } else {
      newOnes.push({ name: original, snippet });
    }
  }

  // Deduplicate by contact/name preserving order
  const seenC = new Set<string>();
  const dedupExisting = existing.filter((e) => {
    const k = e.contact.id;
    if (seenC.has(k)) return false;
    seenC.add(k);
    return true;
  });

  const seenN = new Set<string>();
  const dedupNew = newOnes.filter((n) => {
    const k = normalizeName(n.name);
    if (seenN.has(k)) return false;
    seenN.add(k);
    return true;
  });

  return { existing: dedupExisting, newOnes: dedupNew };
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
