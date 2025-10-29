// Centralized local/session storage keys for offline mode

export const LS_KEYS = {
  CONTACTS: 'circle_contacts',
  SUBJECTS: 'circle_subjects',
  ORGANIZATIONS: 'circle_organizations',
  OCCUPATIONS: 'circle_occupations',
  RELATIONSHIPS: 'circle_relationships',
  SENTIMENTS: 'circle_sentiments',
  NOTES: 'circle_notes',
  COMMITMENTS: 'circle_commitments',
} as const;

export const SESSION_KEYS = {
  IS_INITIAL_VISIT: 'circle_isInitialVisit',
  WELCOME_DIALOG_PAGE: 'circle_welcomeDialogPage',
} as const;


