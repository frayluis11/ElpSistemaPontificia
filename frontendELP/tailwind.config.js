/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de colores ELP Pontificia
        primary: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937', // Color primario principal
          900: '#111827',
        },
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Color secundario principal
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24', // Color acento principal
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        background: {
          DEFAULT: '#f3f4f6', // Fondo general
          paper: '#ffffff',
          dark: '#1f2937',
        },
        text: {
          primary: '#111827', // Texto principal
          secondary: '#4b5563',
          muted: '#6b7280',
          inverse: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // Tipografía personalizada
        'title': ['24px', { lineHeight: '32px', fontWeight: '700' }], // Títulos
        'subtitle': ['18px', { lineHeight: '28px', fontWeight: '500' }], // Subtítulos
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }], // Texto normal
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }], // Texto pequeño
      },
      spacing: {
        // Espaciado personalizado
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'button': '8px', // Bordes redondeados para botones
      },
      boxShadow: {
        'button': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}