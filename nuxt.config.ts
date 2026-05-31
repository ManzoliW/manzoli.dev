export default defineNuxtConfig({
  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN || '',
  },
  modules: ['@nuxtjs/tailwindcss', 'motion-v/nuxt', '@nuxt/fonts', '@nuxt/image', '@nuxt/eslint'],
  css: ['~/assets/css/tailwind.css'],
  components: [
    { path: '~/components/vb', pathPrefix: false },
    { path: '~/components/sections', pathPrefix: false },
    '~/components',
  ],
  fonts: {
    families: [
      { name: 'Newsreader', provider: 'google', weights: [200, 300, 400, 500, 600, 700, 800] },
      { name: 'Inter', provider: 'google', weights: [400, 500] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500] },
    ],
  },
  image: {
    domains: ['avatars.githubusercontent.com'],
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'William Manzoli — Brazilian Software Engineer',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'William Manzoli — Brazilian senior frontend engineer building calm, durable interfaces for teams that ship a lot. Based in São Paulo.',
        },
        { name: 'author', content: 'William Manzoli' },
        { name: 'theme-color', content: '#f5f1e6' },
        { name: 'robots', content: 'index, follow' },

        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'manzoli.dev' },
        { property: 'og:url', content: 'https://www.manzoli.dev' },
        {
          property: 'og:title',
          content: 'William Manzoli — Brazilian Software Engineer',
        },
        {
          property: 'og:description',
          content:
            'Senior frontend engineer in São Paulo. Micro-frontends, TypeScript, observability, design systems.',
        },
        { property: 'og:image', content: 'https://www.manzoli.dev/og.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: 'en_US' },

        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: 'William Manzoli — Brazilian Software Engineer',
        },
        {
          name: 'twitter:description',
          content:
            'Senior frontend engineer in São Paulo. Micro-frontends, TypeScript, observability, design systems.',
        },
        { name: 'twitter:image', content: 'https://www.manzoli.dev/og.png' },
      ],
      link: [
        { rel: 'canonical', href: 'https://www.manzoli.dev' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      script: [
        {
          // Blocking inline script: reads persisted color-mode from localStorage
          // and applies `dark` class to <html> before first paint to prevent FOUC.
          // VueUse's useColorMode persists under the key 'vueuse-color-scheme'.
          innerHTML: `(function(){try{var m=localStorage.getItem('vueuse-color-scheme');if(m==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          type: 'text/javascript',
        },
        {
          // Google Tag Manager
          innerHTML: `(function (w, d, s, l, i) {
            w[l] = w[l] || []; w[l].push({
              'gtm.start':
                new Date().getTime(), event: 'gtm.js'
            }); var f = d.getElementsByTagName(s)[0],
              j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
                'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
          })(window, document, 'script', 'dataLayer', 'GTM-NWGKQJF5');`,
          type: 'text/javascript',
        },
        {
          // Google tag (gtag.js)
          src: 'https://www.googletagmanager.com/gtag/js?id=G-MRC6DD50SG',
          async: true,
        },
        {
          innerHTML: `window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', 'G-MRC6DD50SG');`,
          type: 'text/javascript',
        },
      ],
      noscript: [
        {
          // Google Tag Manager (noscript)
          children: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NWGKQJF5" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          body: true,
        },
      ],
    },
  },
  nitro: { preset: 'vercel-edge' },
  compatibilityDate: '2024-03-28',
})