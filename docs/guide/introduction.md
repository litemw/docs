---
outline: deep
title: Introduction
---

# Introduction

## What is LiteMW
<span class="text-brand-1">LiteMW</span>
is a set of related libraries for developing server applications with
<span class="text-indigo-2">TypeScript</span>
**/**
<span class="text-brand-3">JavaScript</span>.

The core concept of LiteMW is building request processing workflows
based on middleware handlers.
This mechanism is also used by libraries such as:
[express](https://expressjs.com/),
[koa](https://koajs.com/),
[fastify](https://fastify.dev/),
and many others, including those in other languages and environments.

## Middleware Handlers
Middlewares provide flexible integration capabilities for combining
prepared functions into applications, such as: authentication and authorization,
validation, and logging.

If you've worked with frameworks like express, you might have encountered
libraries like **bodyparser, passport, helmet, multer**. All of them are
middlewares that are chained into the request processing chain before
your final handlers are reached. This way "enriches" the request context with data,
which can include the request body, user information, files, cookies, etc.

### Advantages and Disadvantages
The middleware approach (an implementation of the
["Chain of Responsibility"](https://refactoring.guru/design-patterns/chain-of-responsibility) 
pattern)
simplifies development by breaking down request processing into smaller,
functional blocks.
However, when an application accumulates many middlewares that write their data
into the processing context state (stored in objects like **req, res, res.locals, ctx**, etc.),
it becomes extremely difficult to track which data should be in the context,
even when using <span class="text-indigo-2">TypeScript</span> typing.

For most frameworks (such as **express** and **koa**), one solution is
[type augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation)
of their context type (or state like **res.locals / ctx.state**).
This works if your middleware operates globally, meaning the objects it writes
will be available in all processing chains (e.g., passport and bodyparser).

However, this isn't always the convenient case: often, certain middlewares are required
only for specific routes or controllers. In such scenarios, this solution still works,
but the context type will bloat with many optional parameters. For example,
the following code adds optional fields **rights, lessons**, and **students** to the **req** object:
::: code-group
```ts [some-file.d.ts]
declare global {
  namespace Express {
    interface Request {
      rights?: Right[]
      lessons?: Lesson[]
      students?: Student[]
      ...
    }
  }
}
```
:::

The second option is specifying types directly in the generics of your library.
For express, it would look like this:
```ts
app.get<Params,ResBody,ReqBody,ReqQuery,Locals>(
  '/api/v1/path', (req,res) => {}
)
```

Here, instead of **Params, ResBody, ReqBody, ReqQuery, and Locals**, you can specify the expected types.

In summary, typing regular middlewares requires either writing numerous augmentations
or adding boilerplate code at the usage site. This slows down development
or encourages skipping typing altogether.

## MVC Frameworks
The described problem is elegantly solved by heavy frameworks like
[Nest](https://docs.nestjs.com/)
or
[Adonis](https://docs.adonisjs.com).

In most cases, such frameworks provide a Dependency Injection container
for managing providers and controllers. Many features, like extracting request bodies
and parameters, validation, and authorization, are implemented using decorators.
For example, in Nest:
```ts
@Controller('lessons')
export class LessonsController {
  @Roles(Role.Admin)
  @UseGuards(AuthGuard)
  @UseGuards(RolesGuard)
  @Post('change/:id')
  changeLesson(
    @Param('id', ParseIntPipe) id: number,
    @Body() lessonChangeDto: LessonChangeDto
  ) {
    // return something
  }
}
```

This code creates a controller with the prefix lessons and a post request handler
for the route change/:id. It is accessible only to users with a specific role,
and the function arguments include a request parameter and a body with a schema LessonChangeDto
(the objects Role, AuthGuard, RolesGuard, and LessonChangeDto are created by the developer).

Using decorators like this allows for declarative descriptions of controllers and handlers,
but it often complicates the logic unnecessarily. For instance, in Nest, there are:
1. Middlewares
2. Pipes
3. Guards
4. Interceptor

It can be challenging to determine the exact order in which they are applied,
or you might need workarounds to bypass this order. For example, since guards execute firstly,
request body validation (if it needed in the guard) must be moved into a similar guard.

At this point, it becomes clear that all the entities mentioned above generally
operate the same way: they receive the request context, process it, and either pass
control further or terminate the processing.

## The Solution
<span class="text-brand-1">LiteMW</span>
provides simple and transparent tools based on middlewares while solving
the context typing issue ---> [Why LiteMW](why-litemw)