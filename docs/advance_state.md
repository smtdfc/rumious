# Advanced State Management in Rumious

In Rumious, state is the foundation of reactivity — it enables your application to update UI and logic dynamically in response to data changes. While the basic usage of `createState()` allows you to set and retrieve values, Rumious provides an extended state API through the `RumiousState<T>` class, offering a wide range of powerful tools for managing complex data flows.

This section will walk you through the advanced state manipulation features available in Rumious, including object and array operations, subscription management, and low-level reactive triggers.


---

### Basic Structure

```typescript
const state = createState<T>(initialValue);
```

`RumiousState<T>` represents a reactive state container of type `T`. It encapsulates a value, manages subscriptions, and integrates with the Rumious reactivity system (`RumiousReactor`) to handle UI updates.


### Core Methods

##### `get(): T`

Returns the current value of the state.

```typescript
const username = createState("smtdfc");
console.log(username.get()); // "smtdfc"
```

---

##### `set(value: T): void`

Updates the value and triggers all associated reactions or DOM updates.

```typescript 
username.set("rumiousdev");
```

---

##### `update(updater: (value: T) => T): void`

Useful for computed updates based on the current value.

```typescript
const counter = createState(0);
counter.update(prev => prev + 1);
```

---

##### `reset(): void`

Resets the value back to the initial one provided during creation.

```typescript
counter.reset(); // value is now 0 again
```

---

##### `trigger(): Void`

Forces reactive update even if the value didn’t change.

```typescript
message.trigger(); // Will re-run any watchers
```

---

##### `equals(compareValue: T): boolean`

Compares the current state value to a given one using shallow equality.

```typescript
message.equals("World"); // true
```

---

##### `toJSON(): T`

Returns a plain JSON-serializable representation of the value, useful when sending data over the network or logging.

```typescript
JSON.stringify(user.toJSON());
```

---
