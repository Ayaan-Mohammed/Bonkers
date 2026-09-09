import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'nlip-bg': 'var(--color-bg)',
        'nlip-bg-2': 'var(--color-bg-2)',
        'nlip-surface': 'var(--color-surface)',
        'nlip-surface-hi': 'var(--color-surface-hi)',
        'nlip-border': 'var(--color-border)',
        'nlip-border-hi': 'var(--color-border-hi)',
        'nlip-text': 'var(--color-text)',
        'nlip-text-soft': 'var(--color-text-soft)',
        'nlip-text-faint': 'var(--color-text-faint)',
        'nlip-amber': 'var(--color-amber)',
        'nlip-amber-deep': 'var(--color-amber-deep)',
        'nlip-amber-glow': 'var(--color-amber-glow)',
        'nlip-paper': 'var(--color-paper)',
        'nlip-paper-line': 'var(--color-paper-line)',
        'nlip-ink': 'var(--color-ink)',
        'nlip-ink-soft': 'var(--color-ink-soft)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1.15rem' }],
        xs: ['0.84rem', { lineHeight: '1.25rem' }],
        sm: ['0.95rem', { lineHeight: '1.45rem' }],
        base: ['1.0625rem', { lineHeight: '1.65rem' }],
        lg: ['1.2rem', { lineHeight: '1.8rem' }],
        xl: ['1.35rem', { lineHeight: '1.95rem' }],
        '2xl': ['1.65rem', { lineHeight: '2.25rem' }],
        '3xl': ['2.1rem', { lineHeight: '2.55rem' }],
        '4xl': ['2.65rem', { lineHeight: '3.1rem' }],
      },
      borderRadius: {
        'nlip-sm': 'var(--radius-sm)',
        'nlip': 'var(--radius)',
      },
      maxWidth: {
        'nlip-wrap': 'var(--wrap)',
      },
      boxShadow: {
        'amber-glow': '0 0 24px var(--color-amber-glow)',
        'subtle': '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
};

export default config;
