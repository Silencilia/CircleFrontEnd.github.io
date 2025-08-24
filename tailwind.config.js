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
        'display-small': ['36px', '44px'],
        'headline-xs': ['16px', '28px'],
        'title-medium': ['16px', '24px'],
        'body-medium': ['14px', '20px'],
        'label-large': ['14px', '20px'],
        'label-small': ['11px', '16px'],
      },
      letterSpacing: {
        '0.15': '0.15px',
        '0.25': '0.25px',
        '0.5': '0.5px',
        '0.1': '0.1px',
      }
    },
  },
  plugins: [],
}
