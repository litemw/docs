import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "LiteMW documentation",
  description: "LiteMW documentation site",
  themeConfig: {
    siteTitle: "Documentation",
    logo: {src: "/litemw.png", alt: "LiteMW"},
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {text: 'Guide', link: './guide'},
      {text: 'API', link: './api'},
      {text: 'Examples', link: './examples'}
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          {text: 'Markdown Examples', link: '/markdown-examples'},
          {text: 'Runtime API Examples', link: '/api-examples'}
        ]
      }
    ],

    socialLinks: [
      {icon: 'github', link: 'https://github.com/litemw'}
    ],

    search: {
      provider: 'local'
    }
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    ru: {
      label: 'Русский',
      lang: 'ru',
      link: '/ru/index',
      title: "LiteMW документация",
      description: "LiteMW документация",

      themeConfig: {
        siteTitle: "Документация",
        logo: {src: "/litemw.png", alt: "LiteMW"},
        // https://vitepress.dev/reference/default-theme-config
        nav: [
          {text: 'Справочник', link: 'ru/guide/getting-started'},
          {text: 'API', link: 'ru/api'},
          {text: 'Примеры', link: 'ru/examples'}
        ],

        sidebar: {
          '/ru/guide/': {
            base: '/ru/guide/',
            items: [
              {text: 'Начало работы', link: 'getting-started'},
              {
                text: 'Модули',
                items: [
                  {text: 'Роутер', link: 'router'},
                  {text: 'Обработчики', link: 'middlewares'},
                  {text: 'OpenAPI', link: 'openapi'},
                ]
              },
            ]
          }
        },

        socialLinks: [
          {icon: 'github', link: 'https://github.com/litemw'}
        ],

        search: {
          provider: 'local',
        }
      },
    }
  }
})
