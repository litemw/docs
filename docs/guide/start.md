---
outline: deep
title: Installation
---

# Installation
This section lists the core packages of
<span class="text-brand-1">LiteMW</span>
and their installation methods.

## Router
To get started, you only need two modules: **koa** and
**@litemw/router**.
This is sufficient for the [examples from the previous step](why-litemw#simple-app).
For a more detailed description of the router, see the [creating an application](first-app) section.

::: code-group
```shell [npm]
npm install koa @litemw/router
```
```shell [yarn]
yarn add koa @litemw/router 
```
```shell [pnpm]
pnpm i koa @litemw/router
```
```shell [bun]
bun i koa @litemw/router  
```
:::

> [!TIP]
> Optionally, you can also use [**@koa/router**](https://www.npmjs.com/package/@koa/router).
> **@litemw/router** uses it internally and delegates all its methods.

## Middlewares

::: code-group
```shell [npm]
npm install @litemw/middlewares
```
```shell [yarn]
yarn add @litemw/middlewares
```
```shell [pnpm]
pnpm i @litemw/middlewares
```
```shell [bun]
bun i koa @litemw/middlewares
```
:::

To use the useBody and useFiles middlewares, you will need the
[**koa-bodyparser**](https://www.npmjs.com/package/koa-bodyparser).
::: code-group
```shell [npm]
npm install koa-bodyparser
```
```shell [yarn]
yarn add koa-bodyparser
```
```shell [pnpm]
pnpm i koa-bodyparser
```
```shell [bun]
bun i koa-bodyparser
```
:::

Optionally, for validation, you can use the
[**zod**](https://zod.dev/?id=ecosystem)
or
[**class-validator**](https://github.com/typestack/class-validator)

::: code-group
```shell [npm]
npm install zod
```
```shell [yarn]
yarn add zod
```
```shell [pnpm]
pnpm i zod
```
```shell [bun]
bun i zod
```
:::

::: code-group
```shell [npm]
npm install class-validator
```
```shell [yarn]
yarn add class-validator
```
```shell [pnpm]
pnpm i class-validator
```
```shell [bun]
bun i class-validator
```
:::

For additional OpenAPI schema support with these libraries, you can use
[zod-openapi](https://www.npmjs.com/package/zod-openapi)
and
[class-validator-jsonschema](https://www.npmjs.com/package/class-validator-jsonschema)

::: code-group
```shell [npm]
npm install zod-openapi
```
```shell [yarn]
yarn add zod-openapi
```
```shell [pnpm]
pnpm i zod-openapi
```
```shell [bun]
bun i zod-openapi
```
:::

::: code-group
```shell [npm]
npm install class-validator-jsonschema
```
```shell [yarn]
yarn add class-validator-jsonschema
```
```shell [pnpm]
pnpm i class-validator-jsonschema
```
```shell [bun]
bun i class-validator-jsonschema
```
:::

## OpenAPI

The
[OpenAPI](openapi-use) module provides tools for generating OpenAPI schemas
based on your routers, which can later be used, for example, with SwaggerUI.

::: code-group
```shell [npm]
npm install @litemw/openapi
```
```shell [yarn]
yarn add @litemw/openapi
```
```shell [pnpm]
pnpm i @litemw/openapi
```
```shell [bun]
bun i @litemw/openapi
```
:::