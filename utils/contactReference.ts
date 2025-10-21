import { Contact } from '../contexts/ContactContext';

/**
 * Centralized contact reference utilities for consistent handling across the application
 */

// Standard regex pattern for contact references
export const CONTACT_REFERENCE_REGEX = /\{\{\s*contact\s*:([^}]+)\s*\}\}/g;

// Contact Reference Styling Constants
export const CONTACT_REFERENCE_STYLES = {
  base: 'font-circlebodymedium-highlight text-circle-primary cursor-pointer rounded-sm',
  mobile: 'font-circlebodysmall-highlight text-circle-primary cursor-pointer rounded-sm',
  editable: 'data-contact-ref="true" contenteditable="false"',
  attributes: {
    contactRef: 'data-contact-ref',
    contactId: 'data-contact-id'
  }
} as const;

// Force Tailwind to include these classes by referencing them
// This ensures the CSS classes are generated even when used through constants
const _tailwindClasses = 'font-circlebodymedium-highlight font-circlebodysmall-highlight';

export interface ContactReferenceMatch {
  fullMatch: string;
  contactId: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Find all contact references in text and return detailed match information
 */
export function findContactReferences(text: string): ContactReferenceMatch[] {
  const matches: ContactReferenceMatch[] = [];
  let match: RegExpExecArray | null;
  
  // Reset regex lastIndex to ensure consistent results
  CONTACT_REFERENCE_REGEX.lastIndex = 0;
  
  while ((match = CONTACT_REFERENCE_REGEX.exec(text)) !== null) {
    matches.push({
      fullMatch: match[0],
      contactId: match[1].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }
  
  return matches;
}

/**
 * Extract contact IDs from text containing contact references
 */
export function extractContactIdsFromText(text: string): string[] {
  if (!text) return [];
  
  const contactIds = new Set<string>();
  const matches = findContactReferences(text);
  
  matches.forEach(match => {
    if (match.contactId) {
      contactIds.add(match.contactId);
    }
  });
  
  return Array.from(contactIds);
}

/**
 * Format text with contact references as clickable HTML spans for editing
 */
export function formatTextWithContactReferences(
  text: string,
  contacts: Contact[]
): string {
  return text.replace(CONTACT_REFERENCE_REGEX, (match, contactId) => {
    const contact = contacts.find(c => c.id === contactId.trim());
    const contactName = contact ? contact.name : `{{contact:${contactId}}}`;
    
    return `<span class="${CONTACT_REFERENCE_STYLES.base}" ${CONTACT_REFERENCE_STYLES.attributes.contactRef}="true" ${CONTACT_REFERENCE_STYLES.attributes.contactId}="${contactId.trim()}" contenteditable="false">${contactName}</span>`;
  });
}

/**
 * Convert HTML content back to UUID format for saving
 * More efficient regex-based approach instead of DOM manipulation
 */
export function convertHtmlToUuidFormat(html: string): string {
  // Replace contact spans with UUID format using regex
  const spanRegex = /<span[^>]*data-contact-ref="true"[^>]*data-contact-id="([^"]*)"[^>]*>([^<]*)<\/span>/g;
  
  return html.replace(spanRegex, (match, contactId, contactName) => {
    return `{{contact:${contactId}}}`;
  });
}

/**
 * Resolve contact tokens to human-readable names for AI/display purposes
 */
export function resolveContactTokensForAI(text: string, contacts: Contact[]): string {
  if (!text) return text;
  
  return text.replace(CONTACT_REFERENCE_REGEX, (match, contactId) => {
    const contact = contacts.find(c => c.id === contactId.trim());
    return contact?.name ?? `[Contact ${contactId.trim()}]`;
  });
}

/**
 * Check if text contains any contact references
 */
export function hasContactReferences(text: string): boolean {
  CONTACT_REFERENCE_REGEX.lastIndex = 0;
  return CONTACT_REFERENCE_REGEX.test(text);
}

/**
 * Count the number of contact references in text
 */
export function countContactReferences(text: string): number {
  return findContactReferences(text).length;
}
