# State & Reactivity

Reactivity is a core concept in Rumious. It enables the UI to update automatically when your application state changes. With a simple yet powerful reactive system, Rumious ensures efficient DOM updates while keeping your code declarative and easy to manage.


---

### 1. What is State?

State is a reactive data holder that stores dynamic values. When a state value is updated, Rumious automatically triggers all relevant UI updates or watchers.

You can create reactive state variables using the `createState()` function.

Example:

```typescript
import { createState } from 'rumious';

let count = createState<number>(0);
```


### 2. Setting and Updating State

To change the value of a state, use `.set(value)`:

```typescript
count.set(10);
```

To perform calculations or transformations before updating the state, use `.update(callback)`:

```typescript
count.update(prev => prev + 1);
```

> The callback receives the current value and should return the new value.


### 3. Reading State

Use `.get()` to access the current value of a state:

```typescript
console.log(count.get()); // Outputs: 10
```

### 4. Binding State to UI

You can insert a state directly into TSX using {}. Rumious automatically unwraps and subscribes to the state:

```typescript
<h1>Count: {count}</h1>
```

Any updates to count will automatically re-render this UI fragment.

Full Example:

```typescript
import { createApp, createState } from 'rumious';

const count = createState<number>(0);

const app = createApp({ root: document.getElementById('root') });

setInterval(() => {
  count.update(n => n + 1);
}, 1000);

app.render(<h1>Count: {count}</h1>);

```

### 5. Watching State

You can register a callback to run whenever the state changes using `watch()`:

```typescript
import { watch } from 'rumious';

watch(count, () => {
  console.log("Count changed:", count.get());
});

```

To stop watching, use `unwatch(state, callback)`.

### 6. Forcing Reactions

Sometimes you may need to force a reaction even when the state hasn’t changed. Use `.trigger()` for this purpose:

```typescript
count.trigger(); // Forces UI update and watchers to run
```
