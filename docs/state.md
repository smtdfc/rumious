# State Overview

In Rumious, a **State** is a special object that represents dynamic data and can change over the lifecycle of an application. It allows reactivity across the UI by notifying relevant parts when data changes.

---

## Creating a State

```typescript
import { createState } from '@rumious/core';

let state = createState<string>('hello');
```

---

## Modifying State

- **Set a value:**

  ```typescript
  state.set('new value');
  ```

  Sets a new value and triggers reactivity.

- **Get current value:**

  ```typescript
  const value = state.get();
  ```

- **Update with calculation:**

  ```typescript
  state.update((val) => val + ' world');
  ```

  Useful when you want to derive a new value from the current state.

- **Set silently (no reactivity):**

  ```typescript
  state.setInSlient('muted value');
  ```

  Use when you want to change the state without triggering listeners or UI updates.

- **Force reactivity manually:**

  ```typescript
  state.forceReactive();
  ```

  Manually triggers any observers/listeners, even if the value hasn't changed.

---

## Using State in JSX

When used inside JSX, the state will automatically trigger DOM updates when its value changes:

```typescript
import {
  Fragment,
  createApp,
  createState
} from '@rumious/core';

const app = createApp({
  root: document.body
});

const count = createState<number>(0);

app.setRootLayout(
  <Fragment>
    <span>{count}</span>
    <button on:click={() => count.update(v => v + 1)}>Increase</button>
  </Fragment>
);

app.start();
```

---

## Watching a State

You can manually register listeners to react to state changes using `watch`:

```typescript
import { watch } from '@rumious/core';

watch(count, (newVal) => {
  console.log('New count:', newVal);
});
```

This is useful when you want to perform side effects when the state updates.
