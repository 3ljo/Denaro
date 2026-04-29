import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-orbitron)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        denaro: {
          bg: '#050810',
          panel: '#0a1322',
          cyan: '#7dd3fc',
          gold: '#fbbf24',
        },
      },
      keyframes: {
        scan: {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '10%':  { opacity: '0.9' },
          '90%':  { opacity: '0.9' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        flicker: {
          '0%,18%,22%,25%,53%,57%,100%': { opacity: '1' },
          '20%,24%,55%':                  { opacity: '0.55' },
        },
        glowPulse: {
          '0%,100%': { opacity: '0.35' },
          '50%':     { opacity: '0.7' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        scan:       'scan 7s linear infinite',
        float:      'float 7s ease-in-out infinite',
        flicker:    'flicker 4s linear infinite',
        glowPulse:  'glowPulse 4s ease-in-out infinite',
        shimmer:    'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
