/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        workday: {
          navy: '#30AFFF',
          dark: '#249CEE',
          orange: '#F26522',
          pill: '#E9ECF0',
          text: '#4A5568',
          surface: '#FFFFFF',
        },
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#f57c42',
          500: '#F26522',
          600: '#d85618',
          700: '#bf450e',
          800: '#9a3412',
          900: '#7c2d12',
        },
        amber: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#f97316',
          500: '#F26522',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        slate: {
          50: '#F8FAFC',
          100: '#001E46', // Workday Deep Navy headings
          200: '#0B254A', // Workday Navy secondary
          300: '#334155', // Slate body text
          400: '#4A5568', // Workday muted subtitle
          500: '#64748B',
          600: '#94A3B8',
          700: '#CBD5E1', // Input borders
          750: '#E2E8F0', // Inner card borders
          800: '#E2E8F0', // Clean light borders
          850: '#F8FAFC', // Table headers & subtle panels
          900: '#FFFFFF', // Clean white card surfaces
          950: '#FFFFFF', // Basic white canvas background
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
