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

Пайпы представляют собой удобную абстракцию для построения конвейров по работе 
с данными. Это параметризовання функция, к которой можно добавить другой пайп
совместимый по типу.

> [!Tip]
> Все вышеописанные мидлвейры в качестве дополнительного аргумента
принимают пайп.

Примерный интерфейс пайпа:
```ts
type Pipe<I, O> = {
  (value: I): O;
  pipe<T>(pipe: PipeOrFunction<O, T>): Pipe<I, T>;
  flatPipe<T>(pipe: PipeOrFunction<Awaited<O>, T>): Pipe<I, Promise<T>>;
  metadata: any
}
```

Мы можем видеть сигнатуру вызова: пайп при вызове на объекте типа *I* возвращает некоторый объект
типа  *O*.

Метод **pipe** позволяет присоединить к пайпу другой пайп или обычную функцию, 
принимающие возвращаемый тип исходногой пайпа и возвращающий новый тип.

Метод **flatPipe** сделан для более удобной работы с асинхронными данными:
присоединяемый пайп получает "распакованный" промис. Также пайп явно содержит поле с **метаданными**.

Рассмотрим пример работы пайпов:
```ts
const toStringPipe = pipe(
  (s: any) => Promise.resolve(String(s))
)  // асинхронный пайп (возвращает промис)

const somePipe = pipe((s: string) => s.trim())   // кастомный калбэк
  .pipe(parseInt)             // передача стандартной функции - парсим число 
  .pipe((n) => n * 10)        // умножаем на 10
  .pipe(toStringPipe)         // передача пайпа - асинхронно переводим в строку
  .flatPipe((s) => s.length); // берём длину

(await somePipe('  1234  ')) // === 5
```

### Пишем валидацию с помощью pipe

Параметризация пайпов позволяет нам использовать их в вышеописанных мидлвейрах для преобразования
и валидации данных.

Рассмотрим пример валидации query параметров с помощью пайпов.

```ts
const validateString = pipe((data: any) => {
  if (typeof data === 'string') {
    return data
  } else {
    throw new Error('Must be string')
  }
})

const router = createRouter('/api')
router
  .post('/endpoint')
  .use(useQuery('queryKey', validateString))
  .use((ctx) => {
    ctx.state.queryKey // string
  });
```

В данном примере validateString пайп проверяет тип передаваомого объекта и возвращает всегда **string**,
так как в противном случае он выбрасывает ошибкe. Эту ошибку потребуется 
обработать либо вернуть пользователю в другом мидлвейре - 
такой подход имеет ряд недостатков, поэтому альтернативой может быть явный возврат
объекта ошибки, в таком случае тип объекта будет **string | Error**.

На этом примере заметно преимущество использования пайпов: помимо выполнения своей логики
их параметры типов могут быть использованы, чтобы вывести тип объекта в контексте
(напомним что без данного пайпа тип *queryKey* был **string | string[] | undefined**.


### Стандартные пайпы

В LiteMW существует ряд пайпов для решения частых задач, среди них:
парсинг данных, валидация, и выброс исключения при получении ошибки.
Рассмотрим их:

#### Парсинг

```ts
function parseIntPipe(radix = 10): Pipe<unknown, number | ParseError>

function parseFloatPipe() : Pipe<unknown, number | ParseError>

function parseBoolPipe(): Pipe<unknown, boolean | ParseError> 

function defaultValuePipe<D, T = D>(defaultVal: D): Pipe<T | null | undefined, T | D | ParseError>

function parseEnumPipe<E>(en: E): Pipe<unknown, E | ParseError>

function parseJSONPipe<T = any>(): Pipe<unknown, T | ParseError>
```

Все пайпы для парсинга возвращают некоторый тип (иногда параметрический) либо ошибку, сделано это для
более гибкой обработки ошибок, так как данную ошибку можно проверить как явно, так и бросить её в 
качестве исключения.

#### Исключения
```ts
function throwPipe<...>(): Pipe<Input, Exclude<Input, ErrorType>> 
```

Опустив параметры типа мы можем видеть что *throwPipe* возвращает пайп, который
принимает некоторый тип-сумму а возвращает этот тип без типа ошибок.
Внутри осуществляет проверку значения и выбрасывает ошибку, если приходит значение с типом ошибки.

Рассмотрим усовершенствованный пример из предыдущего шага:

```ts
const validateString = pipe((data: any) => {
  if (typeof data === 'string') {
    return data
  } else {
    return new Error('Must be string')
  }
}) // Pipe<any, string | Error>

const router = createRouter('/api')
router
  .post('/endpoint')
  .use(useQuery(
    'queryKey', 
    validateString.pipe(throwPipe)
  ))
  .use((ctx) => {
    ctx.state.queryKey // string
  });
```

Теперь несмотря на то, что пайп validateString возвращает тип-сумму строки и ошибки,
*throwPipe* обрабатывает этот тип и выбрасывает исключение с этой ошибкой.

#### Валидация

Для валидации существует пайп *validatePipe*,

```ts
export function validatePipe<C>(
  schema: z.Schema<C>,
  options: ...
): Pipe<any, Promise<C | z.ZodError>>;

export function validatePipe<C extends object>(
  schema: ClassSchema<C>,
  options: ...
): Pipe<any, Promise<C | ClassValidatorError>>;
```

Он принимает схемы библиотеки
[**zod**](https://zod.dev/?id=ecosystem)
и схемы
[**class-validator**](https://github.com/typestack/class-validator), и их параметры валидации.
На основе этих схем также выводится возвращаемый тип.

Рассмотрим пример их использования:

::: code-group
```ts [with-zod.ts]
const bodySchema = z.object({
  name: z.string(),
  age: z.number(),
  status: z.boolean(),
});

const router = createRouter('/api')

router
  .get('/endpoint')
  .use(
    useBody(validatePipe(bodySchema).pipe(throwPipe))
  )
  .use((ctx) => {
    ctx.body // {name: string, age: number, status: boolean}
  });
```
```ts [with-classes.ts]
class BodySchemaClass {
  @IsString()
  name: string;
  @IsNumber()
  age: number;
  @IsBoolean()
  status: boolean;
}

const router = createRouter('/api')

router
  .post('/endpoint')
  .use(
    useBody(validatePipe(BodySchemaClass).pipe(throwPipe))
  )
  .use((ctx) => {
    ctx.body // {name: string, age: number, status: boolean}
  });
```
:::

## Обработка ошибок

В предыдущих примерах мы возвращали ошибки или выбрасывали исключения при обработке запросов.

Как мы можем обработать ошибки:
- Возвращать алгебраический тип данных с ошибкой (например **string | Error**). Такой подход позволит
обработать ошибку в следующим мидлвейре и например вернуть ответ пользователю.
- Бросить исключение (например с помощью *throwPipe*), в таком случае это исключение потребуется отловить.

Рассмотрим примеры обработки ошибок для этих сценариев:

::: code-group
```ts [manual-processing.ts]
const router = createRouter('/api')

router
  .get('/endpoint')
  .use(
    useBody(validatePipe(bodySchema))
  ).use((ctx, next) => {
    if (ctx.body instanceof Error) {
      context.status = err.status ?? 500;
      context.body = 'Internal server Error';
    } else {
      return next()
    }
  })...
```
```ts [throwing.ts]
const router = createRouter('/api')
  .use(async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      context.status = err.status ?? 500;
      context.body = 'Internal server Error';
    }
  })

router
  .get('/endpoint')
  .use(
    useBody(validatePipe(bodySchema).pipe(throwPipe))
  )...
```
:::

Для обработки исключений мы регистрируем мидлвейр (он может быть и в главном роутере),
который вызывает следующий мидлвейр *next()*, обёрнутый в конструкцию
**try catch**. Далее в блоке *catch* мы устанавливаем статус и сообщение об ошибке.
Дополнительно может быть произведено логгирование.

Обратите внимание, что если вы вызываете *next()*, **необходимо** ждать его выполнения 
с помощью **await**, либо возвращать его с помощью **return**, иначе
обработка запроса прекратится на вашем мидлвейре.