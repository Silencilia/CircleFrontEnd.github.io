/** @type {import('tailwindcss').Config} */
const {
  NAV_BAR_HEIGHT_MOBILE,
  NAV_BAR_HEIGHT_DESKTOP,
  COMMITMENT_GALLERY_HEIGHT_EXPANDED_MOBILE,
  COMMITMENT_GALLERY_HEIGHT_EXPANDED_DESKTOP,
  COMMITMENT_GALLERY_HEIGHT_COLLAPSED_MOBILE,
  COMMITMENT_GALLERY_HEIGHT_COLLAPSED_DESKTOP,
  TITLE_HEIGHT_DESKTOP,
  TITLE_HEIGHT_MOBILE,
  SEARCH_BAR_HEIGHT_MOBILE,
  SEARCH_BAR_HEIGHT_DESKTOP,
} = require('./utils/designConstants');

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'circle': {
          'neutral': '#FBF7F3',
          'neutral-variant': '#F0EDE7',
          'primary': '#262B35',
          'secondary': '#E76835',
          'white': '#FFFFFF',
        }
      },
      fontFamily: {
        'merriweather': ['Merriweather', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      spacing: {
        'xs': '5px',    // Extra small spacing
        'sm': '10px',   // Small spacing
        'md': '15px',   // Medium spacing
        'lg': '20px',   // Large spacing
        'xl': '30px',   // Extra large spacing
        'btn-lg': '36px', // Button large size
      },
      borderRadius: {
        'xs': '6px',    // Extra small radius
        'sm': '12px',   // Small radius
        'md': '15px',   // Medium radius
        'lg': '25px',   // Large radius
      },
      gap: {
        'xs': '2px',    // Extra small gap
        'xm': '5px',    // Medium gap
        'md': '10px',   // Large gap
        'lg': '15px',   // Extra large gap
        'xl': '20px',  // 2X large gap
        '2xl': '25px',  // 3X large gap
        '3xl': '30px',  // 4X large gap
        '4xl': '40px',  // 5X large gap
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const typographyUtilities = {
        // Display styles - Merriweather
        '.font-circledisplaylarge': {
          fontFamily: 'Merriweather, serif',
          fontSize: '60px', // 3.75rem
          fontWeight: '400',
          lineHeight: '60px', // 1
          letterSpacing: '0',
        },
        '.font-circledisplaymedium': {
          fontFamily: 'Merriweather, serif',
          fontSize: '48px', // 3rem
          fontWeight: '400',
          lineHeight: '60px', // 1.25
        },
        '.font-circledisplaysmall': {
          fontFamily: 'Merriweather, serif',
          fontSize: '36px', // 2.25rem
          fontWeight: '400',
          lineHeight: '45px', // 1.25
        },

        // Headline styles - Merriweather
        '.font-circleheadlinelarge': {
          fontFamily: 'Merriweather, serif',
          fontSize: '30px', // 1.875rem
          fontWeight: '400',
          lineHeight: '40px', // 2.5rem
        },
        '.font-circleheadlinemedium': {
          fontFamily: 'Merriweather, serif',
          fontSize: '30px', // 1.875rem
          fontWeight: '400',
          lineHeight: '36px', // 2.25rem
        },
        '.font-circleheadlinesmall': {
          fontFamily: 'Merriweather, serif',
          fontSize: '24px', // 1.5rem
          fontWeight: '400',
          lineHeight: '32px', // 2rem
        },
        '.font-circleheadlineextra-small': {
          fontFamily: 'Merriweather, serif',
          fontSize: '20px', // 1.25rem
          fontWeight: '400',
          lineHeight: '28px', // 1.75rem
        },

        // Body styles - Inter
        '.font-circlebodylarge': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px', // 1rem
          fontWeight: '400',
          lineHeight: '24px', // 1.5rem
          letterSpacing: '0.025em', // tracking-wide
        },
        '.font-circlebodymedium': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px', // 0.875rem
          fontWeight: '400',
          lineHeight: '20px', // 1.25rem
          letterSpacing: '0.025em', // tracking-wide
        },
        '.font-circlebodymedium-draft': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px', // 0.875rem
          fontWeight: '400',
          fontStyle: 'italic',
          lineHeight: '20px', // 1.25rem
          letterSpacing: '0.025em', // tracking-wide
        },
        '.font-circlebodymedium-highlight': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px', // 0.875rem
          fontWeight: '400',
          fontStyle: 'italic',
          textDecoration: 'underline',
          lineHeight: '20px', // 1.25rem
          letterSpacing: '0.025em', // tracking-wide
        },
        '.font-circlebodysmall': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px', // 0.75rem
          fontWeight: '400',
          lineHeight: '16px', // 1rem
          letterSpacing: '0.025em', // tracking-wide
        },

        // Label styles - Inter
        '.font-circlelabellarge': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px', // 0.875rem
          fontWeight: '500', // medium
          lineHeight: '20px', // 1.25rem
          letterSpacing: '0', // tracking-normal
        },
        '.font-circlelabelmedium': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px', // 0.75rem
          fontWeight: '500', // medium
          lineHeight: '16px', // 1rem
          letterSpacing: '0.05em', // tracking-wider
        },
        '.font-circlelabelsmall': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px', // 0.75rem
          fontWeight: '500', // medium
          lineHeight: '16px', // 1rem
          letterSpacing: '0.05em', // tracking-wider
        },
        // Title styles - Inter
        '.font-circletitlelarge': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '20px', // 1.25rem
          fontWeight: '400',
          lineHeight: '28px', // 1.75rem
        },
        '.font-circletitlemedium': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px', // 1rem
          fontWeight: '500', // medium
          lineHeight: '24px', // 1.5rem
          letterSpacing: '0', // tracking-normal
        },
        '.font-circletitlesmall': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px', // 0.875rem
          fontWeight: '500', // medium
          lineHeight: '20px', // 1.25rem
          letterSpacing: '0', // tracking-normal
        },
      };

      addUtilities(typographyUtilities);
    },
    function({ addUtilities }) {
      const tagUtilities = {
        '.tg': {
          width: 'fit-content',
          height: '20px',
          padding: '0px 5px',
          gap: '5px',
          borderRadius: '6px',
          '& svg': {
            width: '15px',
            height: '15px',
            strokeWidth: '1.5px',
          },
        },
      };

      addUtilities(tagUtilities);
    },
    function({ addUtilities }) {    
      const buttonUtilities = {
        '.btn-tg': {
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& svg': {
            width: '10px',
            height: '10px',
          },
        },
        '.btn-sm': {
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& svg': {
            width: '16px',
            height: '16px',
          },
        },
        '.btn-sm-txt': {
          width: 'fit-content',
          height: '20px',
          padding: '0 5px',
          gap: '5px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& svg': {
            width: '16px',
            height: '16px',
          },
        },
        '.btn-md': {
          width: '30px',
          height: '30px',
          padding: '0 5px',
          gap: '5px',
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& svg': {
            width: '20px',
            height: '20px',
          },
        },
        '.btn-lg': {
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& svg': {
            width: '22px',
            height: '22px',
          },
        },
        '.btn-nav': {
          width: '60px',
          height: '60px',
          borderRadius: '12px',
          gap: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& svg': {
            width: '30px',
            height: '30px',
          },
        },
      };

      addUtilities(buttonUtilities);
    },
    function({ addUtilities }) {
      const containerUtilities = {
        '.ctn-srch': {
          height: '30px',
          padding: '0 5px',
          gap: '5px',
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'start',
          '& input, & span': {
            height: '20px',
          },
          '& button': {
            width: '30px',
            height: '30px',
          },
          '& svg': {
            width: '20px',
            height: '20px',
          },
        },

        '.ctn-fltr': {
          width: '240px',
          height: '30px',
          padding: '0 5px',
          gap: '5px',
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'full',
          '& input, & span': {
            height: '20px',
          },
          '& button': {
            width: '30px',
            height: '30px',
          },
          '& svg': {
            width: '20px',
            height: '20px',
          },
        },
      };

      addUtilities(containerUtilities);
    },
    function({ addUtilities }) {
      const gridLayoutUtilities = {
        '.grid-cols-btn-layout': {
          'grid-template-columns': '36px 1fr 36px',
          'padding': '6px'
        },
        '.grid-rows-btn-layout': {
          'grid-template-rows': 'auto 36px',
          'padding': '21px 6px 6px 6px',
          'gap': '10px'
        },
        '.textarea-wrapped': {
          'min-height': '20px',
          'height': 'fit-content',
          'max-height': '120px',
          'padding': '0px 15px'
        },
        '.textarea-unwrapped': {
          'min-height': '20px',
          'height': 'auto',        // Change from '36px' to 'auto'
          'max-height': '36px' 
        },
        '.textarea-container-unwrapped': {
          'display': 'flex',
          'align-items': 'center',
          'height': '36px'
        }
      };

      addUtilities(gridLayoutUtilities);
    },
    function({ addUtilities }) {
      const pageUtilities = {
        '.nav-bar': {
          height: NAV_BAR_HEIGHT_MOBILE,  // Default mobile height
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // Automatically switch to desktop height at 640px+
          [`@media (min-width: 640px)`]: {
            height: NAV_BAR_HEIGHT_DESKTOP,
          },
        },

        '.title': {
          height: TITLE_HEIGHT_MOBILE,  // Default mobile height
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // Automatically switch to desktop height at 640px+
          [`@media (min-width: 640px)`]: {
            height: TITLE_HEIGHT_DESKTOP,
          },
        },

        '.search-bar': {
          height: SEARCH_BAR_HEIGHT_MOBILE,  // Default mobile height
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          maxWidth: '900px',
          alignItems: 'center',
          paddingLeft: '30px',  // px-xl value
          paddingRight: '30px', // px-xl value
          gap: '20px',  // gap-lg value (20px)
          // Automatically switch to desktop height at 640px+
          [`@media (min-width: 640px)`]: {
            height: SEARCH_BAR_HEIGHT_DESKTOP,
          },
        },

        '.commitment-gallery-expanded': {
          height: COMMITMENT_GALLERY_HEIGHT_EXPANDED_MOBILE,  // Default mobile height
          width: '100%',
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'top',
          // Automatically switch to desktop height at 640px+
          [`@media (min-width: 640px)`]: {
            height: COMMITMENT_GALLERY_HEIGHT_EXPANDED_DESKTOP,
          },
        },
        '.commitment-gallery-collapsed': {
          height: COMMITMENT_GALLERY_HEIGHT_COLLAPSED_MOBILE,  // Default mobile height
          width: '100%',
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'top',
          // Automatically switch to desktop height at 640px+
          [`@media (min-width: 640px)`]: {
            height: COMMITMENT_GALLERY_HEIGHT_COLLAPSED_DESKTOP,
          },
        },
      };

      addUtilities(pageUtilities);
    }
  ],
}
