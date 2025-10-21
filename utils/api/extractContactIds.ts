import { extractContactIdsFromText as extractContactIds } from '../contactReference';

/**
 * Extract contact IDs from note text that contains {{contact:uuid}} references
 * @deprecated Use extractContactIdsFromText from utils/contactReference.ts instead
 */
export function extractContactIdsFromText(text: string): string[] {
  return extractContactIds(text);
}
