// Common dimensions and spacing variables used throughout the Circle app
export const LAYOUT = {
  CARD_HEIGHTS: {
    CONTACT_INFO: '72px',
    OCCUPATION: '20px',
    ORGANIZATION: '20px',
    BIRTH_DATE: '20px',
    SUBJECTS: '45px',
    NOTES_SECTION: '40px',
  },
  
  SPACING: {
    GAP_SMALL: 'gap-[5px]',
    GAP_MEDIUM: 'gap-[10px]',
    GAP_LARGE: 'gap-[20px]',
  },
  
  EDITING_MODE_PADDING: {
    X: 'px-2', // 20px horizontal padding (px-5 = 20px)
    Y: 'py-1', // 20px vertical padding (py-5 = 20px)
  },
} as const;

// Export individual categories for easier imports
export const CARD_HEIGHTS = LAYOUT.CARD_HEIGHTS;
export const SPACING = LAYOUT.SPACING;
export const EDITING_MODE_PADDING = LAYOUT.EDITING_MODE_PADDING;

// Color variables for tag controls
export const COLORS = {
  DELETE_TAG_FILL: '#FBF7F3',
  DELETE_TAG_STROKE: '#E76835',
} as const;