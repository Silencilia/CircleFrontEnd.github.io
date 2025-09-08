// Common text strings used throughout the Circle app
export const STRINGS = {
  // Navigation
  NAV: {
    CIRCLE: 'Circle',
    MEMO: 'Memo',
    CONTACTS: 'Contacts',
    USER: 'User',
    DEV: 'Dev',
  },
  
  // Contact-related
  CONTACT: {
    NO_OCCUPATION: 'No occupation',
    NO_SUBJECTS: 'No subjects assigned',
    NOTES_COUNT: (count: number) => `${count} notes`,
    OVERFLOW_INDICATOR: (count: number) => `+${count}`,
    NO_BIRTH_DATE: '',
    NO_ORGANIZATION: '',
  },
  
  // Loading states
  LOADING: {
    CONTACTS: 'Loading contacts...',
  },
  
  // Placeholder text
  PLACEHOLDERS: {
    SEARCH: 'Search contacts...',
    NO_RESULTS: 'No contacts found',
    NO_DATA: 'No data available',
    TALK_TO_CIRCLE: 'Record anything...',
  },
  
  // Error messages
  ERRORS: {
    LOAD_FAILED: 'Failed to load contacts',
    SAVE_FAILED: 'Failed to save contact',
    PARSE_FAILED: 'Failed to parse saved data',
  },
  
  // UI Elements
  UI: {
    EDIT: 'Edit',
    DELETE: 'Delete',
    ADD: 'Add',
    SAVE: 'Save',
    CANCEL: 'Cancel',
    CLOSE: 'Close',
    MENU: 'Menu',
  },
  
  // Relationship categories
  RELATIONSHIPS: {
    PERSONAL: 'personal',
    PROFESSIONAL: 'professional',
    ROMANTIC: 'romantic',
  },
  
  // Subject categories
  SUBJECTS: {
    ACTIVITY: 'activity',
    INTEREST: 'interest',
    HOBBY: 'hobby',
    ORGANIZATION: 'organization',
  },
} as const;

// Greeting messages for the Circle app
export const GREETINGS = [
  "Any news from your friends?",
  "Who did you meet today?",
  "How can I help with your relationships?",
  "What's new with your contacts?",
  "Ready to strengthen your social connections?",
] as const;



// Export individual categories for easier imports
export const NAV_STRINGS = STRINGS.NAV;
export const CONTACT_STRINGS = STRINGS.CONTACT;
export const LOADING_STRINGS = STRINGS.LOADING;
export const ERROR_STRINGS = STRINGS.ERRORS;
export const UI_STRINGS = STRINGS.UI;

// Date formatting utilities that avoid timezone conversions
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export function formatYyyyMmDdToLong(dateStr: string): string {
  // Expecting 'YYYY-MM-DD'; parse without using Date to avoid TZ shifts
  const m = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(dateStr);
  if (!m) return dateStr;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return dateStr;
  const monthName = MONTH_NAMES[mo - 1];
  return `${monthName} ${d}, ${y}`;
}

// Replace template tokens like {{contact:ID}} with the contact's current name
import { Contact } from '../contexts/ContactContext';
export function resolveContactTokens(text: string, contacts: Contact[]): string {
  if (!text) return text;
  const re = /\{\{\s*contact\s*:\s*(\d+)\s*\}\}/g;
  return text.replace(re, (_match, idStr) => {
    const id = Number(idStr);
    const contact = contacts?.find(c => c.id === id);
    return contact?.name ?? _match;
  });
}
