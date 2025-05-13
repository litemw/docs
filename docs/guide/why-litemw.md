---
outline: deep
title: Why LiteMW
---

# Why LiteMW

## Technical Foundation
<span class="text-brand-1">LiteMW</span>
is built on the [koa](https://koajs.com/) library and other 
libraries from the koa ecosystem, such as @koa/router.

This choice is due to the simplicity and modularity of koa, 
as well as its support for asynchronous middlewares.

## Flexibility

<span class="text-brand-1">LiteMW</span>
provides complete freedom in choosing build tools and application 
runtime environments. Examples of organizing applications with popular 
build tools and environments can be found in the [build and run](run-methods) section.

## Concept
The primary "building block" in
<span class="text-brand-1">LiteMW</span>
is middleware—a processing function similar to koa middleware but with some unique features. 
Schematically, it can be represented as follows:

```ts
type Middleware<State, Return> = 
    (ctx: {..., state: State}, next: ...) => Return
```

Our middleware is parameterized by the state type, which helps
determine what objects exist in the context during execution. 
It also returns a parameterized type that will be used to further populate the context.

The core entities of
<span class="text-brand-1">LiteMW</span>
are the router and the request handlers (handlers) it
creates when defining a route. Let's look at an example of a simple application:
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

In its simplest usecase, the router is almost 
the same **@koa/router** and implements its core methods.

Now, let's examine a more complex example:
```ts
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

One of the differences from koa middlewares is that we return an object that 
"populates" the state, allowing
<span class="text-indigo-2">Typescript</span> 
to know the current state type at each step. 
Additionally, calling next() is optional and is mostly 
needed when you want subsequent handlers to execute before your code 
(e.g., for [error handling](middlewares-use)).