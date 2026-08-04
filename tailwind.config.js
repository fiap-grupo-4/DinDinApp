const { hairlineWidth } = require('nativewind/theme')

const designColors = {
  gray: {
    100: 'var(--gray-100)',
    200: 'var(--gray-200)',
    300: 'var(--gray-300)',
    400: 'var(--gray-400)',
    500: 'var(--gray-500)',
    600: 'var(--gray-600)',
    700: 'var(--gray-700)',
    800: 'var(--gray-800)',
    900: 'var(--gray-900)',
  },
  success: {
    100: 'var(--success-100)',
    200: 'var(--success-200)',
    300: 'var(--success-300)',
    400: 'var(--success-400)',
    500: 'var(--success-500)',
    600: 'var(--success-600)',
  },
  info: {
    100: 'var(--info-100)',
    200: 'var(--info-200)',
    300: 'var(--info-300)',
    400: 'var(--info-400)',
    500: 'var(--info-500)',
    600: 'var(--info-600)',
  },
  warning: {
    100: 'var(--warning-100)',
    200: 'var(--warning-200)',
    300: 'var(--warning-300)',
    400: 'var(--warning-400)',
    500: 'var(--warning-500)',
    600: 'var(--warning-600)',
  },
  danger: {
    100: 'var(--danger-100)',
    200: 'var(--danger-200)',
    300: 'var(--danger-300)',
    400: 'var(--danger-400)',
    500: 'var(--danger-500)',
    600: 'var(--danger-600)',
  },
  brand: {
    100: 'var(--brand-100)',
    200: 'var(--brand-200)',
    300: 'var(--brand-300)',
    400: 'var(--brand-400)',
    500: 'var(--brand-500)',
    600: 'var(--brand-600)',
    700: 'var(--brand-700)',
    800: 'var(--brand-800)',
  },
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './App.tsx',
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        lato: ['var(--font-lato)'],
      },
      fontSize: {
        'body-sm': ['var(--text-body-sm)', { lineHeight: 'var(--leading-body)' }],
        'body-md': ['var(--text-body-md)', { lineHeight: 'var(--leading-body)' }],
        'body-lg': ['var(--text-body-lg)', { lineHeight: 'var(--leading-body)' }],
        'heading-xs': [
          'var(--text-heading-xs)',
          { lineHeight: 'var(--leading-heading)' },
        ],
        'heading-sm': [
          'var(--text-heading-sm)',
          { lineHeight: 'var(--leading-heading)' },
        ],
        'heading-md': [
          'var(--text-heading-md)',
          { lineHeight: 'var(--leading-heading)' },
        ],
        'heading-lg': [
          'var(--text-heading-lg)',
          { lineHeight: 'var(--leading-heading)' },
        ],
        'heading-xl': [
          'var(--text-heading-xl)',
          { lineHeight: 'var(--leading-heading)' },
        ],
      },
      lineHeight: {
        body: 'var(--leading-body)',
        heading: 'var(--leading-heading)',
      },
      colors: {
        background: 'var(--color-background)',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        ...designColors,
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require('tailwindcss-animate')],
}
