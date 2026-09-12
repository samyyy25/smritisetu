/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Forest Teal
        brand: {
          50: '#EAF6F3',
          100: '#D5EEE7',
          200: '#ACDDCE',
          300: '#7EC7B2',
          400: '#4FAA93',
          500: '#2A8E76',
          600: '#147260',
          700: '#0D5C4D', // Core Brand Primary
          800: '#0B4A3E',
          900: '#07382E', // Deep Sidebar
          950: '#04221C',
        },
        // Backgrounds
        surface: {
          cream: '#FAF7F2',       // Warm cream background for landing/overview
          'cream-subtle': '#F4EFEA',
          app: '#F6F7F9',         // Clean patient app card surface
          card: '#FFFFFF',
          border: 'rgba(0, 0, 0, 0.06)',
        },
        // Soft Pastel Accents for Action Cards and Quiz Options
        pastel: {
          pink: {
            bg: '#FDEEE9',
            border: '#FBD8CE',
            text: '#C23D32',
            icon: '#E05345',
          },
          mint: {
            bg: '#EAF6F4',
            border: '#CEEBE6',
            text: '#0D5C4D',
            icon: '#0D5C4D',
          },
          lavender: {
            bg: '#F3EEF9',
            border: '#E1D5F2',
            text: '#6D28D9',
            icon: '#7C3AED',
          },
          peach: {
            bg: '#FEF5E7',
            border: '#FCE6C7',
            text: '#B45309',
            icon: '#D97706',
          },
          blue: {
            bg: '#EDF5FE',
            border: '#D3E7FC',
            text: '#1D4ED8',
            icon: '#2563EB',
          },
          rose: {
            bg: '#FDEEF1',
            border: '#F9D6DE',
            text: '#BE123C',
            icon: '#E11D48',
          },
        },
        // Status Colors (Badges, Stat Cards, Alerts)
        status: {
          stable: {
            DEFAULT: '#10B981',
            bg: '#EAF8F1',
            border: '#A7E8C7',
            text: '#065F46',
            badge: '#D1FAE5',
          },
          monitor: {
            DEFAULT: '#F59E0B',
            bg: '#FEF7E6',
            border: '#FDE29A',
            text: '#92400E',
            badge: '#FEF3C7',
          },
          attention: {
            DEFAULT: '#EF4444',
            bg: '#FDECEC',
            border: '#F9BFC1',
            text: '#991B1B',
            badge: '#FEE2E2',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -1px rgba(11, 79, 66, 0.04), 0 1px 3px -1px rgba(0, 0, 0, 0.02)',
        'soft-card': '0 4px 20px -2px rgba(11, 79, 66, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'soft-elevated': '0 10px 30px -4px rgba(11, 79, 66, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'soft-float': '0 16px 40px -6px rgba(11, 79, 66, 0.12), 0 6px 16px -3px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '28px',
      },
    },
  },
  plugins: [],
}
