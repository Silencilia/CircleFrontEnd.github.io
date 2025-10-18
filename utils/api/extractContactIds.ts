/**
 * Extract contact IDs from note text that contains {{contact:uuid}} references
 */
export function extractContactIdsFromText(text: string): string[] {
  if (!text) return [];

  const contactIds = new Set<string>();
  const regex = /\{\{\s*contact\s*:([^}]+)\s*\}\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const contactId = match[1].trim();
    if (contactId) {
      contactIds.add(contactId);
    }
  }

  return Array.from(contactIds);
}
