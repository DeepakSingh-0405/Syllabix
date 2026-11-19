/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base: 'var(--color-surface-base)',
          muted: 'var(--color-surface-muted)',
          interactive: 'var(--color-surface-interactive)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          disabled: 'var(--color-text-disabled)',
        },
        border: {
          default: 'var(--color-border-default)',
          interactive: 'var(--color-border-interactive)',
          focus: 'var(--color-border-focus)',
        },
        status: {
          error: 'var(--color-status-error)',
          errorSurface: 'var(--color-status-errorSurface)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
          strong: 'rgb(var(--color-accent-strong-rgb) / <alpha-value>)',
          cyan: 'rgb(var(--color-accent-cyan-rgb) / <alpha-value>)',
          green: 'rgb(var(--color-accent-green-rgb) / <alpha-value>)',
        },
      },
      spacing: {
        'space-1': 'var(--space-1)',
        'space-2': 'var(--space-2)',
        'space-3': 'var(--space-3)',
        'space-4': 'var(--space-4)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'full': 'var(--radius-full)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'arial', 'sans-serif'],
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'focus': 'var(--shadow-focus)',
      },
      transitionDuration: {
        'fast': 'var(--motion-duration-fast)',
        'base': 'var(--motion-duration-base)',
        'slow': 'var(--motion-duration-slow)',
      },
    },
  },
  plugins: [],
}
