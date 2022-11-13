# LibFun
*Make functional programming fun!*

Libfun provides you with the following (🌳 shakable) primitives:
  - [Monads](#monad)
  - [Pipes](#pipe)
  - [Pools](#pool)

## Monad
Out of all functional libraries, LibFun finally provides you with monads done **the JavaScript** way! This means 100% compatibility and interoperability with native promises!

```ts
// TypeSafe!
await maybe(42)                        // Monad<number, [Maybe]>
  .then((x) => Promise.resolve(x * 2)) // Monad<number, [Maybe, Future]>
  .then((x) => x + 1)                  // Monad<number, [Maybe, Future]>
  .unwrap();                           // Promise<number>
```

LibFun gives you a flexible primitive to easily make you own monads, as well as gives you some common ones out of the box (these might be used as examples or inspirations for you application specific implementations). Built-in monads are:
<details><summary><b>🤔 Maybe</b></summary>

```ts
maybe(null).catch(() => 42).unwrap() // 42
```
</details>

<details><summary><b>🔀 Spread</b></summary>

```ts
spread([1,2,3]).then((x) => x + 1).unwrap() // [2,3,4]
```
</details>

<details><summary><b>📡 Stream</b></summary>

```ts
const numbers = stream(1)
  .then((x) => x * 2)
  .then(console.log); // Logs: 2
numbers.push(2); // Logs: 4
numbers.push(3); // Logs: 6
```
</details>

<details><summary><b>🌯 Wrap</b> <i>(helper)</i></summary>

```ts
const unsafe = () => { throw new Error(); };
wrap(unsafe)().catch(() => 42).unwrap() // 42
```
</details>


Or you can make your own:
```ts
const logger = monad((value, fn) => {
  const updated = fn(value);
  console.log(updated);
  return updated;
});
```

## Pipe
Naming stuff is hard. This is why we love pipes! Here are some reasons why you should love them even more:
<details><summary><b>⚒️ <code>pipe</code> and <code>pipeline</code> patterns to cover all your use cases</b></summary>

```ts
const transform = pipeline(
  (x: string) => x.toUpperCase(),
  (x) => x.split(" "),
)
transform("hello world");

pipe("hello world")(
  (x) => x.toUpperCase(),
  (x) => x.split(" "),
);
```
</details>

<details><summary><b>⚛️ 1st class support for monads (including promises)</b></summary>

```ts
await pipe(Promise.resolve([1,2,3]))(
  spread,
  (x) => x + 1
) // [2,3,4]
```
</details>

<details><summary><b>🔒 type-safety and automatic inference</b></summary>

```ts
pipe(1)(
  (x) => x.toString(),
// ^ number
  (x) => [x]
// ^ string
)
```
</details>

<details><summary><b>🐛 provides <code>fallback</code> and <code>expose</code> utilities for error handling</b></summary>

```ts
const unsafe = () => { throw new Error(); };

pipe(42)(
  unsafe,
  fallback((e) => e.message), // Can accept a function
  unsafe,
  fallback("oops"),           // Or just a value
  (x) => x.toUpperCase()
); //OOPS

pipe(unsafe())(
  ...expose // Creates a discriminated union:
);          //   { data: undefined, error: Error }
```
</details>


## Pool
Pools are LibFun's event handling solution. Here is a basic example:
```ts
// Get `pool` from global controller
const { pool } = pools();
// Register an event with id `event`
const event = pool<(x: number) => number>("event");

// Add an `event` handler
event((x) => x * 2);
// Call the event
const result = event(42);

// Result is an asynchronous iterator
for await (const item of result) {
  console.log(item); // 84
}
```

Why should you use pools? Let's look at a more complex example:
```ts
// More global controls
const { pool, count, close } = pools();
// Advanced pool options
const event = pool("event", {
  concurrency: 1, // One execution at a time
  timeout: 3000, // Max execution time (in ms)
  rate: 25, // Max number of calls per minute
  cache: 3, // Cache last 3 calls
});

// First class generator support
event(function *() {
  yield 1;
  // Safe asynchronous workflow
  const number = yield* async(fetch(...));
  yield number;
  yield 2;
});
// Register multiple handlers
event(() => 42);

// Useful generator helpers
await first(event()); // 1
await take(event()); // [1, 42, *number*, 2]

event.abort(); // Abort execution at ANY TIME!

count();       // 1
event.close(); // Close current pool
close();       // Close ALL the pools
count();       // 0
```

Still not convinced? Let's look at all the features in more detail:
<details><summary>💳 <b>Assign pools unique id</b></summary>

```ts
const event1 = pool("event");
const event2 = pool("event");
// Pools are distinguished by id
event1 === event2 // true
```
</details>

<details><summary>🙅‍♂️ <b>Abort asynchronous flow at any time</b></summary>

```ts
const stuff = pool("stuff");

// Pools use generators instead of asynchronous 
//   functions to be abortable at any time
stuff(function *() {
  // Instead of `await /* promise */` you do:
  const awaited = yield* async(/* promise */);
  // Note: this does NOT actually yield out of the generator.
  //   You can yield the value yourself if you want to:
  yield awaited;
});

take(stuff()).then(x => /* [] */)
// Result will be empty,   ↑
//   since we have aborted immediately:
stuff.abort();
```
</details>

<details><summary>🤹‍♂️ <b>Limit pool concurrency</b></summary>

```ts
const api = pool("api", { concurrency: 1 });
api(function *() {
  yield* async(/* expensive api call */);
});

take(api()).then(/* do stuff */);
take(api()).then(/* this will not resolve until the first call finishes */);
```
</details>

<details><summary>⏬ <b>Rate pool events per minute</b></summary>

```ts
const api = pool("api", { rate: 10 });
api(function *() {
  yield* async(/* expensive api call */);
});

// The api will get called NO more than 10 calls per minute!
while (true) { api(); }
```
</details>

<details><summary>⌛ <b>Set execution timeouts</b></summary>

```ts
const task = pool("task", { timeout: 5000 });
task(function *() {
  yield* async(/* long task */);
})

// The pool will abort if the task takes longer than 5 seconds
task();
```
</details>

<details><summary>📦 <b>Split pools, handlers and callers in groups</b></summary>

```ts
const init = pool("init", { group: "main" });
// Sometimes it's useful to split a pool into groups
const plugin1Init = init.bind({ group: "plugin1" });
const plugin2Init = init.bind({ group: "plugin2" });

init(function *() {/* main init stuff */});
plugin1Init(function *() {/* plugin 1 init stuff */});
plugin2Init(function *() {/* plugin 2 init stuff */});

init(); // Main starts ALL the initializations

// You can use groups to filter your actions:
init.abort({ group: "plugin1" }); // Abort all "plugin1" execution
init.abort({ handler: "plugin1" }); // Abort executions handles by plugin1
init.abort({ caller: "plugin1" }); // Abort executions called by plugin1
```
</details>

<details><summary>🌌 <b>Globally control all your running pools</b></summary>

```ts
const all = pools();
all.pool(id); // Create a pool
all.schedule("*", when); // Schedule execution for all pools
all.status("event"); // Get a status of the pool with id "event"
all.abort(); // Abort all the executing pools
all.drain(); // Drain (abort + cancel pending) all the pools
all.close(); // Close (drain + clear handlers) all the pools
all.count(); // Count all the pools (with handlers)
all.catch(handler) // Catch errors from all the pools
```
</details>

<details><summary>🥅 <b>Catch the errors</b></summary>

```ts
const bad = pool("bad");

bad(() => { throw new Error("oops"); });
bad.catch((e) => console.error(e));

await take(bad()); // Does NOT throw, resolves with: []
```
</details>

<details><summary>🔎 <b>Trace event chains when an error is caught</b></summary>

```ts
const first = pool("first");
const second = pool("second");

second(() => { throw new Error("oops"); });
first(function *() {
  // We use the `map` helper instead of `for await`
  yield* map(second(), (item) => {
    yield item;
  });
});

// When we catch an error, we know what pools have called us:
second.catch((error) => {
  error.trace; // ["first", "second"]
});

first();
```
</details>

<details><summary>💾 <b>Cache handler results</b></summary>

```ts
const lookup = pool<(query: string) => Data>("lookup", {
  cache: 10, // Cache last 10 queries
});
lookup(function *(query) {/* some expensive lookup */});

lookup("hello"); // lookup is called
lookup("world"); // lookup is called
lookup("hello"); // from CACHE!
```
</details>

<details><summary>📅 <b>Schedule deferred or repeated tasks</b></summary>

```ts
const task = pool<(data: any) => any>("task");
task(function *(data) {/* some task */});

// Execute after a second
task.schedule({relative: 1000})(data);
// Execute at 6 am
task.schedule({absolute: new Date().setHours(6)})(data);
// Execute every day at 10 am
const day = 1000 * 60 * 60 * 24;
const time = new Date(0).setHours(10);
task.schedule({absolute: time, interval: day})(data);
```
</details>
