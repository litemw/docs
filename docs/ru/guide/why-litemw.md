---
outline: deep
title: Почему LiteMW
---

# Почему LiteMW

## Техническая основа
<span class="text-brand-1">LiteMW</span>
построен на основе библиотеки
[koa](https://koajs.com/)
и других библиотек из экосистемы koa, таких как koa-router.

Данный выбор обусловлен простотой и модульностью koa, а так же тем, что koa поддерживает
асинхронные мидлвейры.

## Гибкость

<span class="text-brand-1">LiteMW</span>
даёт полную свободу при выборе инструментов сборки и запуска приложения. Примеры организации приложения
с популярными сборщиками и средами вы можете найти в разделе
[сборка и запуск](tsc).

## Концепция
Основным "строительным блоком" в
<span class="text-brand-1">LiteMW</span>
является мидлвейр, это функция обработки аналогичная мидлвейру koa, но с некоторыми особенностями,
схематично её можно представить следующим образом:

```ts
type Middleware<State, Return> = 
    (ctx: {..., state: State}, next: ...) => Return
```

Наш мидлвейр параметризован типом состояния, что позволяет в процессе понять какие объекты существуют в контексте,
а также возвращает параметризованный тип, который будет использован для дальнейшего наполнения контекста.

Основной сущностью
<span class="text-brand-1">LiteMW</span>
является роутер и обработчики запросов (хэндлеры), которые он создаёт при
определении маршрута, рассмотрим пример простейшего приложения:

### {#simple-app}
```ts
import { createRouter } from '@litemw/router';
import Koa from 'koa';

const router = createRouter('/api');

router.get('/endpoint', (ctx) => {
    console.log(`Get request handled`);
    ctx.body = 'response'
})

const app = new Koa();
app.use(router.routes());
app.listen(3000)
```

В примитивном варианте роутер практически не отличается от аналогичного роутера из **koa-router**, и имплементирует
его основные методы.

Рассмотрим более сложный пример:
```ts {10,17,21}
const router = createRouter('/api')
    .use((ctx) => {
      return {someDataFromRouter: 3000}
    })

router.get('/endpoint')
  .use((ctx) => {
    console.log(
      "Check data from router",
      ctx.state.someDataFromRouter // number
    )   
    return {someDataFromHandler: 'some_string'}
  })
  .use((ctx) => {
    console.log(
      "Check data from router",
      ctx.state.someDataFromRouter // number
    )
    console.log(
      "Check data from previous step",
      ctx.state.someDataFromHandler // string
    )
    ctx.body = 'response'
  })
```

Одним из отличий от мидлвейров koa является то, что мы возвращаем объект, которым "наполняем" состояние,
таким образом
<span class="text-indigo-2">Typescript</span> знает какой тип состояния на текущем шаге.
Также вызов **next()** опционален, и чаще всего потребуется когда вы захотите
чтобы последующие обработчики выполнились перед вашим кодом
([например при отлове ошибок](middlewares-use).
