# Plugins
Plugins allow you to implement your own endpoints, aggregators or preservers for the Amadeus project.

## Create
To create a plugin run:

```sh
npm install @amadeus-music/core @amadeus-music/util
npm install -D vite
```
> Note that `@amadeus-music/util` package is optional, but might be useful for your plugin development.

Now add a build script to your `package.json`:
```json
"scripts": {
  "build": "vite build -c node_modules/@amadeus-music/core/plugin.config.cjs"
},
```

To start developing your plugin create an `index.ts` file and register your plugin there:
```ts
import { register } from "@amadeus-music/core";
import { name, version } from "./package.json";

const { ... } = register({ name, version });
```

`register` function returns an sdk bound to your plugin. A simple use case would be:
```ts
import { register } from "@amadeus-music/core";
import { name, version } from "./package.json";

const { init, stop, info } = register({ name, version });

init((config) => {
  info(`Plugin initialized with ${JSON.stringify(config)}!`);
});

stop(() => {
  info("Plugin stopped!");
});
```
> Note that `@amadeus-music/core` reexports everything from [libfun](https://www.npmjs.com/package/libfun) and [superstruct](https://www.npmjs.com/package/superstruct) as these are common shared dependencies.

Amadeus plugin system uses [pools](../packages/libfun/README.md#pool) to manage events for your plugin.