---
outline: deep
title: Установка
---

# Установка
В данном разделе перечислены основные пакеты
<span class="text-brand-1">LiteMW</span>
и способы их установки.

## Роутер
Для начала работы вам понадобятся только два модуля: **koa** и 
**@litemw/router**
этого достаточно для [примеров из предыдщуего шага](why-litemw#simple-app). 
Более подробное описание роутера смотрите в [разделе создание приложения](first-app).
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
> Опционально вы можете использовать и [**@koa/router**](https://www.npmjs.com/package/@koa/router), 
> **@litemw/router** использует его внутри и делегирует все его методы.

## Мидлвейры
Модуль 
[@litemw/middlewares](middlewares-use)
содержит базовые мидлвейры для работы с параметрами URL, query-параметрами, телом запроса и файлами,
также в нём содержатся пайпы (pipes) - сущности для создания конвейров обработки данных. 

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

Для использования миддлвейра *useBody* и *useFiles* вам понадобится библиотека 
[**koa-bodyparser**](https://www.npmjs.com/package/koa-bodyparser)
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

Опционально для валидации вы можете использовать библиотеки 
[**zod**](https://zod.dev/?id=ecosystem)
или
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

И для дополнительных возможностей по работе с OpenAPI схемами для этих библиотек
вы можете использовать
[zod-openapi](https://www.npmjs.com/package/zod-openapi)
и
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

Модуль 
[OpenAPI](openapi-use) предоставляет инструменты для генерации OpenAPI схемы 
на основе ваших роутеров, которая в последствии может быть использована
например для SwaggerUI.

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