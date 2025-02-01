import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "LiteMW documentation",
  description: "LiteMW documentation site",
  head: [
    ['link', {rel: 'icon', href: '/favicon.ico'}]
  ],

  themeConfig: {
    siteTitle: "Documentation",
    logo: {src: "/litemw.png", alt: "LiteMW"},
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {text: 'Guide', link: '/guide/introduction'},
      {text: 'API', link: '/api'},
      {text: 'Examples', link: '/examples'}
    ],

    sidebar: {
      '/guide/': {
        base: '/guide/',
        items: [
          {
            text: 'Getting started',
            items: [
              {text: 'Introduction', link: 'introduction'},
              {text: 'Why LiteMW', link: 'why-litemw'},
              {text: 'Installation', link: 'start'}
            ]
          },
          {
            text: 'Modules',
            items: [
              {text: 'Router', link: 'router'},
              {text: 'Middlewares', link: 'middlewares'},
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
      link: '/ru',
      title: "LiteMW документация",
      description: "LiteMW документация",

      themeConfig: {
        siteTitle: "Документация",
        logo: {src: "/litemw.png", alt: "LiteMW"},
        // https://vitepress.dev/reference/default-theme-config
        nav: [
          {text: 'Справочник', link: 'ru/guide/introduction'},
          {text: 'API', link: 'ru/api'},
          {text: 'Примеры', link: 'ru/examples'}
        ],

        sidebar: {
          '/ru/guide/': {
            base: '/ru/guide/',
            items: [
              {
                text: 'Начало работы',
                items: [
                  {text: 'Введение', link: 'introduction'},
                  {text: 'Почему LiteMW', link: 'why-litemw'},
                  {text: 'Подготовка', link: 'start'}
                ]
              },
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
