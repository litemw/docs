---
outline: deep
title: Создание приложения
---

# Создание приложения

В данном разделе показан пример простейшей программы с использованием
<span class="text-brand-1">LiteMW</span>,
рассмотрены особенности наших мидлвейров и примеры работы с ними;
возможности роутеров, и возможности работы с состоянием контекста.


## Первая программа

Рассмотрим минимальный код для запуска приложения.

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

Здесь используется функция **createRouter** из пакета **@litemw/router**
для создания LiteMW роутера, она принимает
опциональные аргументы: префикс, который будет применён к каждому дочернему обработчику 
и опции идентичные опциям Koa роутера, схематично представим её тип:

```ts
function createRouter<...>(
  prefix?: string,
  opts?: RouterOptions
): Router<...>;
```

В реальности её тип сложнее, так как префикс и методы параметризуют тип роутера для проверок
на этапе компиляции.

В свою очередь **RouterOptions** имеет следующий интерфейс:
```ts
interface IRouterOptions {
  prefix?: string | undefined;     // Префикс
  methods?: string[] | undefined;  // Методы
  sensitive?: boolean | undefined; // Чувствительность к регистру
  strict?: boolean | undefined;    // Строгая проверка (с учётом количества слэшэй)
}
```

Также роутер имплементирует интерфейс *IBaseRouter* из библиотеки koa-router 
и в поле *koaRouter* содержит базовый роутер 
```ts
const router = createRouter()...  // satisfies IBaseRouter
type T = typeof router.koaRouter  // KoaRouter
```


## Принципы мидлвейров

В LiteMW мидлвейры используются как для построения хэндлеров, так и роутеров с помощью
метода **use(...)**.
Каждый мидлвейр наполняет состояние контекста во время обработки запроса.
**Схематично** можем представить тип метода следующим образом:
```ts
function use<NewState extends State, Return>(
  mw: (ctx {..., state: NewState}, next: NextFunction) => Return
): RouterOrHandler<State & Return>;
```

Где State - текущий тип состояния роутера или хэндлер, NewState - тип состояния, которое
ожидает мидлвейр, Return - возвращаемый тип мидлвейра.
После выполнения мидлвейра в цепочке обработки возвращённое значение добавится
в состояние контекста (с перезаписью существующих свойств).
Применение метода **use** вернёт нам тот же самый роутер или хэндлер, но параметризованный
другим типом.

## Примеры

Рассмотрим несколько примеров использования мидлвейров.
Предположим мы хотим распарсить тело запроса в мидлвейре *parseBody* и 
провалидировать в *validateBody*:

###
```ts
const parseBody: Middleware<any, { someBody: string }> = async (ctx) => {
  const someBody = '';
  await new Promise(resolve => {
     ctx.req.on('data', (chunk) => {/* collect body to string */});
     ctx.req.on('end', resolve)
  })
  return { someBody };
};

const validateBody: Middleware<{ someBody: string }> = (ctx) => {
  // do validation
};
```

*parseBody* достаёт данные из запроса (очень схематично) и возвращает в состояние контекста
некоторую строку **someBody**.
*validateBody* осуществляет некоторую валидацию поля **someBody** и не возвращает ничего.
Как мы можем видеть *parseBody* ожидает любой входящий тип состояния, а
*validateBody* предполагает что в состоянии контекста должно быть поле **someBody**. 

Попробуем их использовать:
```ts
const router = createRouter('/api');

router.get('/endpoint')
  .use(parseBody)     // Ok
  .use(validateBody)  // Ok
  .use((ctx) => {
    console.log(ctx.state.someBody); // string
  })
```

При обработке запроса тело будет получено, провалидировано и распечатано.
Но что будет если поменять их порядок местами?
```ts {4}
const router = createRouter('/api');

router.get('/endpoint')
  .use(validateBody)  // TS2345: Argument of type ... is not assignable to ...
  .use(parseBody)     
  .use((ctx) => {
    console.log(ctx.state.someBody); // string
  })
```

Мы увидим ошибку компиляции, так как в типе состояния нету полей, которые ожидает мидлвейр.
Аналогичная ошибка будет если убрать *parseBody* вообще.

## Вложенность роутеров

Метод *use* роутера можно использовать для подключения другого роутера, с опциональным префиксом.
```ts
const v1Router = createRouter('/v1')
... // some definitions
const latestRouter = createRouter()
... // some definitions

const apiRouter = createRouter('/api')
apiRouter.use(v1Router)
apiRouter.use('/latest', latestRouter)
```

Обратите внимание, что мидлвейры роутера будут применены в цепочке обработки запросов
вложенных роутеров, но не будут отражены в их типе, поэтому рекомендуется
подключать роутеры только к некоторому главному роутеру.

## Состояние по-умолчанию

В состоянии контекста даже при отсутсвии каких-либо мидлвейров уже будут поля
**router**, который доступен в мидвейрах как роутера, так и хэндлера;
и **handler**, который доступен только в мидлвейрах хэндлера.
Из них можно получить информацию о префиксе, маршруте и всём что 
есть в роутере и хэндлере соответственно.

```ts
const router = createRouter('/api')
  .use(ctx => {
    ctx.router // <Router>
  });

router.get('/endpoint', (ctx) => {
  ctx.router // <Router>
  ctx.handler // <RouteHandler>
})
``` 

## Аугментация состояния

Если вам потребуются глобальные мидлвейры, которые предоставляют содержание контекста,
доступное в любых последующих мидлвейрах, вы можете сделать аугментацию типа состояния 
следующим образом:
::: code-group
```ts [types/litemw.d.ts]
declare module '@litemw/router' {
  interface DefaultState {
    someString: string;
    someNumber: number;
  }
}
```
:::

Указанные поля будут доступны во всех обработчиках.
```ts
const router = createRouter('/api')
  .use(ctx => {
    ctx.someString // string
    ctx.someNumber // string
  });

router.get('/endpoint', (ctx) => {
  ctx.someString // string
  ctx.someNumber // string
})
``` 

## Завершение обработки 

В некоторых случаях может возникнуть потребность в прерывании цепочки обработки запроса.
Сделать это можно с помощью вызова метода **cancel()** у объекта *next*.

Рассмотрим пример:

```ts
const router = createRouter('/api')
  .use(async (ctx, next) => {
    console.log('First middleware')
    await next()
    console.log('After first middleware')
  })
  .use((ctx, next) => {
    console.log("Interrupted")
    ctx.body = "Interrupted"
    next.cancel()
  })
  .use(ctx => {
    ... // do some work
  });

router.get('/endpoint', (ctx) => {
  ...
})
```

При обращении по адресу */api/endpoint*
будет возвращена строка **'Interrupted'**, то есть после вызова *next.cancel()*
последующие мидлвейры выполнены **не будут**, а управление вернётся 
к предыдущим мидлвейрам где был вызван next.

В консоли будет выведено:
> First midddleware
> 
> Interrupted
> 
> After first middleware

Данный механизм может быть полезен, когда требуется прервать обработку запроса, 
но при этом выполнить предудущие мидлвейры в цепочке. 
Альтернатива этому - выброс исключения, которое потребует блока 
try/catch в одном из предыдущих мидлвейров. 