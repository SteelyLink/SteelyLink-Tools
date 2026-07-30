import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Design system from Kinetic Dark */
        'primary': '#c3c0ff',
        'on-primary': '#1d00a5',
        'primary-container': '#4f46e5',
        'on-primary-container': '#dad7ff',
        'inverse-primary': '#4d44e3',
        'primary-fixed': '#e2dfff',
        'primary-fixed-dim': '#c3c0ff',
        'secondary': '#4ae176',
        'on-secondary': '#003915',
        'secondary-container': '#00b954',
        'tertiary': '#ffb695',
        'surface': '#13121b',
        'surface-dim': '#13121b',
        'surface-bright': '#393842',
        'surface-container': '#1f1f28',
        'surface-container-low': '#1b1b24',
        'surface-container-high': '#2a2933',
        'surface-container-highest': '#35343e',
        'surface-container-lowest': '#0e0d16',
        'on-surface': '#e4e1ee',
        'on-surface-variant': '#c7c4d8',
        'outline': '#918fa1',
        'outline-variant': '#464555',
        'background': '#13121b',
        'on-background': '#e4e1ee',
        'surface-variant': '#35343e',
        'inverse-surface': '#e4e1ee',
        'inverse-on-surface': '#302f39',
        'error': '#ffb4ab',
        'error-container': '#93000a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['32px', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '700' }],
        'h3': ['18px', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.6', letterSpacing: '-0.01em', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', letterSpacing: '0em', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
