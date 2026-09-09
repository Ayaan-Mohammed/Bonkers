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
      borderRadius: {
        'nlip-sm': 'var(--radius-sm)',
        'nlip': 'var(--radius)',
      },
      maxWidth: {
        'nlip-wrap': 'var(--wrap)',
      },
      boxShadow: {
        'amber-glow': '0 0 24px var(--color-amber-glow)',
        'subtle': '0 8px 32px rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
};

export default config;
