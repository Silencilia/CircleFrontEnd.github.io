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
        'inter': ['Inter', 'sans-serif'],
        'merriweather': ['Merriweather', 'serif'],
      },
      fontSize: {
        // Display styles - Merriweather
        'display-large': ['57px', '64px'],
        'display-medium': ['45px', '52px'],
        'display-small': ['36px', '44px'],
        
        // Headline styles - Merriweather
        'headline-large': ['32px', '40px'],
        'headline-medium': ['28px', '36px'],
        'headline-small': ['24px', '32px'],
        'headline-xs': ['16px', '28px'],
        
        // Title styles - Inter
        'title-large': ['22px', '28px'],
        'title-medium': ['16px', '24px'],
        'title-small': ['14px', '20px'],
        
        // Body styles - Inter
        'body-large': ['16px', '24px'],
        'body-medium': ['14px', '20px'],
        'body-small': ['12px', '16px'],
        
        // Label styles - Inter
        'label-large': ['14px', '20px'],
        'label-medium': ['12px', '16px'],
        'label-small': ['11px', '16px'],
      },
      letterSpacing: {
        '0.15': '0.15px',
        '0.25': '0.25px',
        '0.5': '0.5px',
        '0.1': '0.1px',
        '0.4': '0.4px',
        '-0.25': '-0.25px',
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
      }
    },
  },
  plugins: [],
}
