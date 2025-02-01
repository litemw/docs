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

Основной сущностью LiteMW является [роутер](router) и обработчики запросов (хэндлеры), которые он создаёт при
определении маршрута, рассмотрим пример простейшего приложения:
```ts
import { createRouter } from '@litemw/router';
import Koa from 'koa';

const router = createRouter('/api');

router
  .get('/endpoint')
  .use((ctx) => {
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
```ts {12,19,23}
const router =
  createRouter('/api')
    .use((ctx) => {
      return {someDataFromRouter: 3000}
    })

router
  .get('/endpoint')
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
([например при отлове ошибок](TODO)).

## Метаданные 

> [!Tip]
> В большинстве случаев использование метаданных понадобится для сбора информации для OpenAPI схемы, 
> что уже присутствует в модуле [OpenAPI](openapi)

Хэндлер и роутер обладают полями **metadata**, которые можно использовать, чтобы
определить метаинформацию о хэнделере или роутере.
Сами мидлвейры не имеют метаданных, но имеют опциональное поле *metaCallback*, 
которому можно присвоить хук для установки метаданных в хэндлер и роутер; которые в свою очередь
имеют поле metadata (по умолчанию инициализованное пустым объектом). 
Это выглядит следующим образом:

```ts
export function someMw(): Middleware<{...}, {...}> {
  const mw: Middleware = async (ctx: Context) => {
    return { ... };
  };
  mw[MetaKeys.metaCallback] = (router, handler) => {
    router.meta = ...
    if (handler) handler.meta = ...
  };

  return mw;
}
```

Также мидлвейр имеет аналогичное булево поле *ignoreMiddleware*, которое можно установить чтобы мидлвейр не 
выполнялся в основном потоке обработке, а выполнился только единожды его мета-коллбэк:
```ts
export function someMw(): Middleware<{...}, {...}> {
  const mw: Middleware = () => void 0 // инициализируем noop функцию 
  mw[MetaKeys.metaCallback] = (router, handler) => {
    router.meta = ...
    if (handler) handler.meta = ...
  };
  mw[MetaKeys.ignoreMiddleware] = true // мидлвейр не будет выполнятся при обработке запроса
  
  return mw;
}
```

Это может быть полезно в случае когда нам нужна только мета-информация.