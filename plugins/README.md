# Plugins
Plugins allow you to implement your own endpoints, aggregators or preservers for the Amadeus project.

## Create
To create a plugin run:

```sh
npm install @amadeus-music/core @amadeus-music/util
npm install -D vite
```
> Note that `@amadeus-music/util` package is optional, but might be useful for your plugin development.

Now create a `vite.config.cjs`, and put there:
```js
export default require("@amadeus-music/core/plugin/config.cjs")();
```
> You might optionally provide a name for your plugin (the default is your package name from `package.json`), and custom vite config override. To do so, you should specify them as parameters to the config function call (like `...("MyPlugin", {});`).

You might also want to add a build script to your `package.json`:
```json
"build": "vite build"
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

Amadeus plugin system uses [pools](../packages/libfun/README.md#pool) to manage events for your plugin.