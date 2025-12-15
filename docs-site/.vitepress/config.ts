import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: '@affino/menu',
  description: 'Headless Vue & React menu primitives with intent-aware pointers.',
  cleanUrls: true,
  lastUpdated: true,
  vite: {
    server: {
      host: true,      // 0.0.0.0
      port: 4174,
      strictPort: true
    }
  },
  sitemap: {
    hostname: 'https://ui.unitlab.io'
  },
  themeConfig: {
    siteTitle: 'Affino Menu',
    nav: [
      { text: 'Overview', link: '/menu/' },
      { text: 'Getting Started', link: '/menu/getting-started' },
      { text: 'Examples', link: '/menu/examples' },
      { text: 'Styling', link: '/menu/styling-and-animation' },
      { text: 'React Adapter', link: '/menu/react' },
      { text: 'Advanced', link: '/menu/advanced' },
      { text: 'Playground', link: 'https://ui.unitlab.io' }
    ],
    sidebar: {
      '/menu/': [
        { text: 'Overview', link: '/menu/' },
        { text: 'Getting Started', link: '/menu/getting-started' },
        { text: 'Examples', link: '/menu/examples' },
        { text: 'Styling & Animation', link: '/menu/styling-and-animation' },
        { text: 'React Adapter', link: '/menu/react' },
        { text: 'Advanced', link: '/menu/advanced' }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/affinio/affinio' }
    ],
    footer: {
      message: 'MIT Licensed',
      copyright: '© ' + new Date().getFullYear() + ' Affino'
    }
  }
})
