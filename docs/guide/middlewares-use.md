---
outline: deep
title: Middlewares
---

# Middlewares and Their Usage

This section covers middlewares for common request processing needs, validation methods, 
pipes - a mechanism for data processing and validation, and additional middleware capabilities.

## Standard Middlewares

The **@litemw/middlewares** module contains standard middlewares for request processing:
- useBody - provides access to request body (requires [bodyparser](https://www.npmjs.com/package/koa-bodyparser))
- useParam - for URL path parameters
- useQuery - for query parameters
- useFile - for file uploads

Let's examine usage examples:

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

Here, useBody added a *body* field of type **any** to the context state.

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

useParam added an *id* field of type **string** (or **undefined** if parameter is missing).
When using a single argument like **'id'**, the URL parameter name matches the context object property.
For different names, pass a second argument:

```ts
const router = createRouter('/api')
router
  .post('/endpoint/:some-id')
  .use(useParam('id', 'some-id'))
  .use((ctx) => {
    ctx.state.id // string | undefined
  });
```

Here, URL parameter **:some-id** will be available in the *id* field.

### useQuery
**useQuery** behaves similarly but works with query parameters which can be string arrays:

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
useFiles provides functionality identical to  
[multer](https://www.npmjs.com/package/multer)

It accepts [multer options](https://www.npmjs.com/package/multer#multeropts)
and returns multer functions. Example with all functions:

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
    ctx.state.files      // multer.File[] (from any())
  });
```

## Metadata

> [!Tip]
> Metadata is primarily used for OpenAPI schema generation, which is already implemented in the [OpenAPI](openapi-use) module

Handlers and routers have **metadata** fields for storing meta-information.
Middlewares don't have metadata but can set an optional *metaCallback* hook
to populate metadata in handlers/routers:

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

Middlewares can also set *ignoreMiddleware* to true to skip execution during request processing,
only running the meta callback:

```ts
export function someMw(): Middleware<{...}, {...}> {
  const mw: Middleware = () => void 0 // initialize with noop function 
  mw[MetaKeys.metaCallback] = (router, handler) => {
    router.meta = ...
    if (handler) handler.meta = ...
  };
  mw[MetaKeys.ignoreMiddleware] = true // middleware won't execute during requests
  
  return mw;
}
```

This is useful when only metadata is needed.

## Pipes

Pipes provide a convenient abstraction for building data processing pipelines.
They are parameterized functions that can chain compatible pipes.

> [!Tip]
> All above-mentioned middlewares accept pipes as optional arguments.

Basic pipe interface:
```ts
type Pipe<I, O> = {
  (value: I): O;
  pipe<T>(pipe: PipeOrFunction<O, T>): Pipe<I, T>;
  flatPipe<T>(pipe: PipeOrFunction<Awaited<O>, T>): Pipe<I, Promise<T>>;
  metadata: any
}
```

The **pipe** method chains another pipe or regular function.
**flatPipe** simplifies working with async data by unwrapping promises.

Example:
```ts
const toStringPipe = pipe(
  (s: any) => Promise.resolve(String(s))
)  // async pipe (returns promise)

const somePipe = pipe((s: string) => s.trim())   // custom callback
  .pipe(parseInt)             // standard function - parse number
  .pipe((n) => n * 10)        // multiply by 10
  .pipe(toStringPipe)         // chain pipe - async string conversion
  .flatPipe((s) => s.length); // get length

(await somePipe('  1234  ')) // === 5
```

### Validation with Pipes

Pipes can be used with middlewares for data transformation and validation.

Query parameter validation example:
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

Here the validateString pipe ensures the type is always **string** by throwing on invalid input.

### Standard Pipes

LiteMW includes pipes for common tasks:

#### Parsing
```ts
function parseIntPipe(radix = 10): Pipe<unknown, number | ParseError>
function parseFloatPipe(): Pipe<unknown, number | ParseError>
function parseBoolPipe(): Pipe<unknown, boolean | ParseError>
function defaultValuePipe<D, T = D>(defaultVal: D): Pipe<T | null | undefined, T | D | ParseError>
function parseEnumPipe<E>(en: E): Pipe<unknown, E | ParseError>
function parseJSONPipe<T = any>(): Pipe<unknown, T | ParseError>
```

Parsing pipes return either the parsed type or an error for flexible error handling.

#### Exceptions convertions
```ts
function throwPipe<...>(): Pipe<Input, Exclude<Input, ErrorType>> 
```

throwPipe returns a pipe that removes error types by throwing exceptions:

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

#### Validation

The validatePipe works with:
- [zod](https://zod.dev/?id=ecosystem) schemas
- [class-validator](https://github.com/typestack/class-validator) schemas

Example usage:

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

## Error Handling

Previous examples showed returning errors or throwing exceptions.

Error handling approaches:
- Return algebraic types (e.g. **string | Error**) for explicit error handling
- Throw exceptions (via *throwPipe*) requiring try/catch blocks

Examples:

::: code-group
```ts [manual-processing.ts]
const router = createRouter('/api')

router
  .get('/endpoint')
  .use(useBody(validatePipe(bodySchema)))
  .use((ctx, next) => {
    if (ctx.body instanceof Error) {
      context.status = err.status ?? 500;
      context.body = 'Internal server Error';
      next.cancel()
    } 
  })
  .use(ctx => {...})
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

Note: When calling *next()*, you **must** await it or return it,
otherwise request processing will terminate at your middleware.
