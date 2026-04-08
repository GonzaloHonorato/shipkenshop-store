/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  safelist: [
    // Colores para categorías
    'text-red-400',
    'text-purple-400', 
    'text-green-400',
    'text-amber-400',
    'bg-red-600',
    'bg-purple-600',
    'bg-green-600', 
    'bg-amber-600',
    'border-red-500',
    'border-purple-500',
    'border-green-500',
    'border-amber-500',
    // Gradientes para botones
    'from-red-600',
    'to-orange-600',
    'from-red-700',
    'to-orange-700',
    'from-purple-600',
    'to-indigo-600',
    'from-purple-700', 
    'to-indigo-700',
    'from-green-600',
    'to-teal-600',
    'from-green-700',
    'to-teal-700',
    'from-amber-600',
    'to-orange-600',
    'from-amber-700',
    'to-orange-700',
    'from-green-600',
    'to-emerald-600',
    'from-green-700',
    'to-emerald-700',
    'from-blue-600',
    'to-indigo-600',
    'from-blue-700',
    'to-indigo-700',
    // Gradientes para backgrounds
    'from-red-800',
    'via-red-800',
    'from-purple-800',
    'via-purple-800',
    'from-green-800',
    'via-green-800',
    'from-blue-800',
    'via-blue-800',
    'from-amber-800',
    'via-amber-800',
    // Borders adicionales
    'border-blue-500',
  ],
  theme: {
    extend: {
      // Colores personalizados de ShikenShop
      colors: {
        purple: {
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
        },
        pink: {
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
        gray: {
          800: '#1f2937',
          900: '#111827',
        }
      },
      // Animaciones custom
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

