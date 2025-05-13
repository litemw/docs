---
outline: deep
title: Creating an Application
---

# Creating an Application

This section demonstrates a simple program using
<span class="text-brand-1">LiteMW</span>,
covers the features of our middlewares with usage examples,
router capabilities, and working with context state.

## First Program

Let's look at the minimal code to start an application.

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

Here, the createRouter function from the @litemw/router package is used
to create a LiteMW router. It accepts optional arguments: a prefix that
will be applied to each child handler
and options identical to those of the Koa router. Schematically, 
its type can be represented as:

```ts
function createRouter<...>(
  prefix?: string,
  opts?: RouterOptions
): Router<...>;
```

In reality, its type is more complex because the prefix and methods 
parameterize the router type for compile-time checks.

The **RouterOptions** interface is as follows:
```ts
interface IRouterOptions {
  prefix?: string | undefined;     // Prefix
  methods?: string[] | undefined;  // Methods
  sensitive?: boolean | undefined; // Case sensitivity
  strict?: boolean | undefined;    // Strict checking (considering the number of slashes)
}
```

The router also implements the *IBaseRouter* interface from the **@koa/router** library
and contains the base router in the koaRouter field:
```ts
const router = createRouter()...  // satisfies IBaseRouter
type T = typeof router.koaRouter  // KoaRouter
```

## Middleware Principles

In LiteMW, middlewares are used both for building handlers and routers via the
**use(...)** method.
Each middleware populates the context state during request processing.
**Schematically**, the method type can be represented as:
```ts
function use<NewState extends State, Return>(
  mw: (ctx {..., state: NewState}, next: NextFunction) => Return
): RouterOrHandler<State & Return>;
```

Where:
- `State` is the current state type of the router or handler,
- `NewState` is the state type expected by the middleware,
- `Return` is the middleware's return type.

After execution, the middleware's returned value is added 
to the context state (overwriting existing properties).
The **use** method returns the same router or handler but parameterized with a new type.

## Examples

Let's look at a few middleware usage examples.
Suppose we want to parse the request body in the parseBody middleware and validate it in *validateBody*:
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

*parseBody* extracts data from the request (very schematically) 
and returns a string **someBody** in the context state.
*validateBody* performs validation on the **someBody** field and returns nothing.
As we can see, *parseBody* expects any incoming state type, 
while validateBody assumes the context state must contain the **someBody** field.

Let's try using them:
```ts
const router = createRouter('/api');

router.get('/endpoint')
  .use(parseBody)     // Ok
  .use(validateBody)  // Ok
  .use((ctx) => {
    console.log(ctx.state.someBody); // string
  })
```

During request processing, the body will be retrieved, validated, and printed.
But what if we swap their order?
```ts
const router = createRouter('/api');

router.get('/endpoint')
  .use(validateBody)  // TS2345: Argument of type ... is not assignable to ...
  .use(parseBody)     
  .use((ctx) => {
    console.log(ctx.state.someBody); // string
})
```
We'll see a compilation error because the state type lacks the fields expected by the middleware.
A similar error occurs if parseBody is removed entirely.

## Nested Routers
The router's use method can connect another router with an optional prefix.
```ts
const v1Router = createRouter('/v1')
... // some definitions
const latestRouter = createRouter()
... // some definitions

const apiRouter = createRouter('/api')
apiRouter.use(v1Router)
apiRouter.use('/latest', latestRouter)
```

Note that the router's middlewares will be applied in the request processing chain of nested routers
but won't be reflected in their type. Therefore, 
it's recommended to connect routers only to a main router.

## Default State
Even without any middlewares, the context state will contain:
- **router**: Available in both router and handler middlewares.
- **handler**: Available only in handler middlewares.

These provide access to prefix, route, and all router/handler properties.
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

## State Augmentation
For global middlewares that provide context content available in all subsequent middlewares,
you can augment the state type as follows:
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

The specified fields will be available in all handlers.
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

## Handling chain interruption

Sometimes you may need to interrupt the request processing chain.
This can be done by calling the cancel() method on the next object.

Example:

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

When accessing */api/endpoint*,
the string **'Interrupted'** will be returned. After *next.cancel()*,
subsequent middlewares **won't execute**, and control returns 
to previous middlewares where next was called.

Console output:
> First midddleware
>
> Interrupted
>
> After first middleware

This mechanism is useful when you need to terminate request processing
but still execute previous middlewares in the chain.
An alternative is throwing an exception, 
which requires a try/catch block in one of the preceding middlewares.