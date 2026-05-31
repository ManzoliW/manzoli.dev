import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './pages/**/*.vue',
    './app.vue',
    './nuxt.config.ts',
  ],
  theme: {
    extend: {
      colors: {
        page: '#e8e2d3',
        paper: '#f5f1e6',
        ink: '#1a1612',
        teal: '#003c33',
        coral: '#ff7759',
        rule: '#1a16121a',
        muted: '#1a161266',
      },
      fontFamily: {
        serif: ['Newsreader', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
}
