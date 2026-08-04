import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1280px' } },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-display)', 'ui-serif', 'Georgia'],
        jp: ['var(--font-jp)', 'ui-serif'],
      },
      colors: {
        sumi: { 50: '#f6f5f3', 100: '#e9e7e2', 200: '#cfcbc1', 300: '#a8a195', 400: '#7c7466', 500: '#574f43', 600: '#3d362c', 700: '#2a251e', 800: '#1c1813', 900: '#100d0a' },
        akane: { 50: '#fff1f1', 100: '#ffe0e0', 200: '#ffc1c1', 300: '#ff9595', 400: '#ff5d5d', 500: '#f0303b', 600: '#cf1a2c', 700: '#a81426', 800: '#841322', 900: '#5d101d' },
        shiro: { 50: '#fdfcf9', 100: '#f7f5ef', 200: '#ece6d7', 300: '#dcd1b3' },
        match: { 50: '#f3faf5', 100: '#dff4e5', 200: '#bfe8cc', 300: '#8fd4a7', 400: '#56b87e', 500: '#2f9a5c', 600: '#1f7a47', 700: '#1a6039', 800: '#174d2f', 900: '#0d2c1b' },
        sora: { 50: '#f1f6ff', 100: '#dde8ff', 200: '#bcd2ff', 300: '#8eb1ff', 400: '#5d8aff', 500: '#3868f7', 600: '#224ee0', 700: '#1c3cb0', 800: '#1a3389', 900: '#152665' },
        kinari: '#fdfcf9',
      },
      boxShadow: {
        ink: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px -12px rgba(28,24,19,0.18)',
        brush: '0 2px 0 rgba(28,24,19,0.06), 0 12px 32px -16px rgba(28,24,19,0.22)',
        glow: '0 0 0 1px rgba(56,104,247,0.25), 0 8px 30px -8px rgba(56,104,247,0.35)',
      },
      backgroundImage: {
        'paper-grain': "radial-gradient(rgba(28,24,19,0.04) 1px, transparent 1px)",
        'sumi-grad': "linear-gradient(180deg, #fdfcf9 0%, #f7f5ef 100%)",
      },
      keyframes: {
        floatIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        floatIn: 'floatIn .4s ease-out both',
        shimmer: 'shimmer 2.2s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
