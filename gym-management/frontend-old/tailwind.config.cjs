/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Secondary color
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Success, Warning, Error colors
        success: {
          500: '#10b981',
        },
        warning: {
          500: '#f59e0b',
        },
        error: {
          500: '#ef4444',
        },
      },
      // Custom spacing scale for consistent spacing
      spacing: {
        'xs': '0.5rem',    // 8px
        'sm': '0.75rem',   // 12px
        'md': '1rem',      // 16px
        'lg': '1.5rem',    // 24px
        'xl': '2rem',      // 32px
        '2xl': '3rem',     // 48px
        '3xl': '4rem',     // 64px
      },
      // Custom icon sizing
      width: {
        'icon-xs': '1rem',     // 16px
        'icon-sm': '1.25rem',  // 20px
        'icon-md': '1.5rem',   // 24px
        'icon-lg': '2rem',     // 32px
      },
      height: {
        'icon-xs': '1rem',     // 16px
        'icon-sm': '1.25rem',  // 20px
        'icon-md': '1.5rem',   // 24px
        'icon-lg': '2rem',     // 32px
      },
      // Custom breakpoints for responsive design
      screens: {
        'sm': '414px',   // iPhone 14 Pro Max width
        'md': '768px',   // iPad Mini width
        'lg': '1024px',  // iPad Pro 11" width
        'xl': '1280px',  // Desktop
        '2xl': '1536px', // Large desktop
      },
      // Custom container padding
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
      },
    },
  },
  // Enable only the variants we need
  variants: {
    extend: {
      opacity: ['disabled'],
      backgroundColor: ['active', 'disabled'],
      textColor: ['active', 'disabled'],
      borderColor: ['active', 'focus', 'disabled'],
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // Only generate classes instead of the default global styles
    }),
  ],
}
