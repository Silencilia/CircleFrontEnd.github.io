/** @type {import('tailwindcss').Config} */
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
    },
  },
  plugins: [
    function({ addUtilities }) {
      const typographyUtilities = {
        // Display styles - Merriweather
        '.font-circledisplaylarge': {
          fontFamily: 'Merriweather, serif',
          fontSize: '3.75rem', // 6xl
          fontWeight: '400',
          lineHeight: '1',
          letterSpacing: '0',
        },
        '.font-circledisplaymedium': {
          fontFamily: 'Merriweather, serif',
          fontSize: '3rem', // 5xl
          fontWeight: '400',
          lineHeight: '1.25', // tight
        },
        '.font-circledisplaysmall': {
          fontFamily: 'Merriweather, serif',
          fontSize: '2.25rem', // 4xl
          fontWeight: '400',
          lineHeight: '1.25', // tight
        },

        // Headline styles - Merriweather
        '.font-circleheadlinelarge': {
          fontFamily: 'Merriweather, serif',
          fontSize: '1.875rem', // 3xl
          fontWeight: '400',
          lineHeight: '2.5rem', // leading-10
        },
        '.font-circleheadlinemedium': {
          fontFamily: 'Merriweather, serif',
          fontSize: '1.875rem', // 3xl
          fontWeight: '400',
          lineHeight: '2.25rem', // leading-9
        },
        '.font-circleheadlinesmall': {
          fontFamily: 'Merriweather, serif',
          fontSize: '1.5rem', // 2xl
          fontWeight: '400',
          lineHeight: '2rem', // leading-8
        },
        '.font-circleheadlineextra-small': {
          fontFamily: 'Merriweather, serif',
          fontSize: '1rem', // base
          fontWeight: '400',
          lineHeight: '1.75rem', // leading-7
        },

        // Body styles - Inter
        '.font-circlebodylarge': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1rem', // base
          fontWeight: '400',
          lineHeight: '1.5rem', // leading-6
          letterSpacing: '0.025em', // tracking-wide
        },
        '.font-circlebodymedium': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.875rem', // sm
          fontWeight: '400',
          lineHeight: '1.25rem', // leading-5
          letterSpacing: '0.025em', // tracking-wide
        },
        '.font-circlebodymedium-draft': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.875rem', // sm
          fontWeight: '400',
          fontStyle: 'italic',
          lineHeight: '1.25rem', // leading-5
          letterSpacing: '0.025em', // tracking-wide
        },
        '.font-circlebodymedium-highlight': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.875rem', // sm
          fontWeight: '400',
          fontStyle: 'italic',
          textDecoration: 'underline',
          lineHeight: '1.25rem', // leading-5
          letterSpacing: '0.025em', // tracking-wide
        },
        '.font-circlebodysmall': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem', // xs
          fontWeight: '400',
          lineHeight: '1rem', // leading-4
          letterSpacing: '0.025em', // tracking-wide
        },

        // Label styles - Inter
        '.font-circlelabellarge': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.875rem', // sm
          fontWeight: '500', // medium
          lineHeight: '1.25rem', // leading-5
          letterSpacing: '0', // tracking-normal
        },
        '.font-circlelabelmedium': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem', // xs
          fontWeight: '500', // medium
          lineHeight: '1rem', // leading-4
          letterSpacing: '0.05em', // tracking-wider
        },
        '.font-circlelabelsmall': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem', // xs
          fontWeight: '500', // medium
          lineHeight: '1rem', // leading-4
          letterSpacing: '0.05em', // tracking-wider
        },

        // Title styles - Inter
        '.font-circletitlelarge': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1.25rem', // xl
          fontWeight: '400',
          lineHeight: '1.75rem', // leading-7
        },
        '.font-circletitlemedium': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1rem', // base
          fontWeight: '500', // medium
          lineHeight: '1.5rem', // leading-6
          letterSpacing: '0', // tracking-normal
        },
        '.font-circletitlesmall': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.875rem', // sm
          fontWeight: '500', // medium
          lineHeight: '1.25rem', // leading-5
          letterSpacing: '0', // tracking-normal
        },
      };

      addUtilities(typographyUtilities);
    }
  ],
}
