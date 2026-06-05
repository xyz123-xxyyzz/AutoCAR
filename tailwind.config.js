/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        luxury: {
          black: '#050505',
          dark: '#111111',
          grey: '#222222',
          light: '#F5F5F7',
          gold: '#D4AF37', // A classy muted gold for VIP
          accent: '#E5E5E5'
        }
      },
      boxShadow: {
        'embossed': '20px 20px 40px #d1d5db, -20px -20px 40px #ffffff',
        'embossed-hover': '25px 25px 50px #c2c8d1, -25px -25px 50px #ffffff',
        'inner-embossed': 'inset 10px 10px 20px #e2e8f0, inset -10px -10px 20px #ffffff',
      },
      backgroundImage: {
        'convex': 'linear-gradient(145deg, #ffffff, #e5e7eb)',
        'concave': 'linear-gradient(145deg, #e5e7eb, #ffffff)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      }
    },
  },
  plugins: [],
}
