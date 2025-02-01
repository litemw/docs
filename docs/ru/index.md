---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "LiteMW"
  text: "Экосистема для построения серверного API"
  tagline: Полностью типизированная обработка запросов.
  actions:
    - theme: brand
      text: Начать
      link: ru/guide/introduction
    - theme: alt
      text: API
      link: ru/api
    - theme: alt
      text: Примеры
      link: ru/examples
  image:
    src: /litemw3d.png
    alt: LiteMW    

features:
  - title: Прозрачность
    details: В основе LiteMW лежит привычный паттерн middleware, что позволяет с лёгкостью отслеживать порядок обработки запросов
  - title: Типизация
    details: LiteMW решает проблему отслеживания состояния контекста обработчиков с помощью статической типизации
  - title: Прогрессивность
    details: Экосистема LiteMW последовательно предоставляет инструменты разного уровня от маршрутизатора до Swagger 
---

