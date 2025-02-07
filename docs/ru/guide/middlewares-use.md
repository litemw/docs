---
outline: deep
title: Обработчики
---

# Мидлвейры и работа с ними

В данном разделе представлены мидлвейры для основных
потребностей при обработке запросов, способы их валидации;
пайпы - механизм для обработки и валидации данных;
и дополнительные возможности мидлвейров.


## Стандартные обработчики

В модуле **@litemw/middlewares** содержатся стандартные мидлвейры для обработки запросов:
- useBody  - предоставляют доступ к телу запроса (требует [bodyparser](https://www.npmjs.com/package/koa-bodyparser))
- useParam - к параметрам пути url
- useQuery - к query параметрам
- useFile  - и файлам

Рассмотрим примеры их использования

### useBody
```ts
const router = createRouter('/api')
router
  .post('/endpoint')
  .use(useBody())
  .use((ctx) => {
    ctx.state.body // any
  });
// ... 

import bodyParser from 'koa-bodyparser';

const app = new Koa();
app.use(bodyParser())
app.use(router.routes());
app.listen(3000)
```

В результате useBody добавил в состояние контекста поле *body* типа **any**.

### useParam
```ts
const router = createRouter('/api')
router
  .post('/endpoint/:id')
  .use(useParam('id'))
  .use((ctx) => {
    ctx.state.id // string | undefined
  });
```

useParam добавил в состояние контекста поле *id* типа **string**
(либо **undefined** в случае если параметр не найден).
При использовании одного аргумента, как в данном случае **'id'**
название параметра в url-строке и в объекте контекста будут совпадать.
Если их имена различаются - можно передать второй аргумент, который определит
название параметра в строке, например:
```ts
const router = createRouter('/api')
router
  .post('/endpoint/:some-id')
  .use(useParam('id', 'some-id'))
  .use((ctx) => {
    ctx.state.id // string | undefined
  });
```

В данном примере url параметр **:some-id** будет доступен в поле *id*.

### useQuery
Аналогичное поведение у **useQuery**, но данные берутся из query-параметров
и могут быть массивом строк

::: code-group
```ts [one-key.ts]
const router = createRouter('/api')
router
  .post('/endpoint')
  .use(useQuery('queryKey'))
  .use((ctx) => {
    ctx.state.queryKey // string | string[] | undefined
  });
```
```ts [different-key.ts]
const router = createRouter('/api')
router
  .post('/endpoint')
  .use(useQuery('queryKey', 'query-key')) 
  .use((ctx) => {
    ctx.state.queryKey // string | string[] | undefined
  });
```
:::

### useFiles
useFiles предоставляет функции идентичные  
[multer](https://www.google.com/search?q=multer&oq=multer&gs_lcrp=EgZjaHJvbWUqBggAEEUYOzIGCAAQRRg7MgYIARBFGDsyBggCEEUYPDIGCAMQRRg8MgYIBBBFGDzSAQc2MTVqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8)

Сам useFiles принимает [опции multer](https://www.npmjs.com/package/multer#multeropts).
И возвращает набор функции multer-а.
Пример со всеми функциями:

```ts
router
  .post('/endpoint-with-file')
  .use(useFiles().single('oneFile'))
  .use(useFiles().fields([{name: 'file1', maxCount: 1}, {name: 'file2', maxCount: 2}]))
  .use(useFiles().array('filesArray'))
  .use(useFiles().any())
  .use((ctx) => {
    ctx.state.oneFile    // multer.File
    ctx.state.file1      // multer.File[]
    ctx.state.file2      // multer.File[]
    ctx.state.filesArray // multer.File[]
    ctx.state.files      // multer.File[]  (из any())
  });

```

## Метаданные

> [!Tip]
> В большинстве случаев использование метаданных понадобится для сбора информации для OpenAPI схемы,
> что уже присутствует в модуле [OpenAPI](openapi-use)

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

## Пайпы (pipes)

> [!Warning]
> Work in progress
