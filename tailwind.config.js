/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./popup.html",
    "./dashboard.html",
    "./sidepanel.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: '#DC143C',
          50: '#FDE8EB',
          100: '#FAD0D7',
          200: '#F5A0B3',
          300: '#F0708F',
          400: '#EB406B',
          500: '#DC143C',
          600: '#B80F30',
          700: '#8F0B25',
          800: '#66081A',
          900: '#3D040F',
        },
        black: {
          DEFAULT: '#000000',
          50: '#1a1a1a',
          100: '#0d0d0d',
          200: '#050505',
          300: '#000000',
        },
        purple: {
          glow: 'rgba(139, 92, 246, 0.3)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};