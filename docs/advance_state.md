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

### Object Manipulation

If your state holds an object, Rumious gives you utility methods to directly manipulate keys:

##### `setKey(key, value): void`

Sets a specific key in an object and triggers reactive updates.

```typescript
const user = createState({ id: "1", name: "John" });
user.setKey("name", "Jane");
```

---

##### `deleteKey(key): void`

Deletes a key from the object.

```typescript
user.deleteKey("name");
```

---

##### `merge(partial: Partial<T>): void`

Updates multiple keys at once (similar to `Object.assign`).

```typescript
user.merge({ id: "2", email: "hello@rumious.dev" });
```

---

### Array Utilities

When your state holds an array, Rumious provides mutation helpers with reactive tracking:

##### `push(...items): void`

Adds one or more items to the array.

```typescript
const items = createState<number[]>([1, 2, 3]);
items.push(4, 5); // [1, 2, 3, 4, 5]
```

---

##### `pop(): T | undefined`

Removes and returns the last item of the array.

```typescript
items.pop(); // [1, 2, 3, 4]
```

---

##### `filter(predicate): void`

Filters the array in place, keeping only items that match the condition.

```typescript
items.filter(n => n % 2 === 0); // [2, 4]
```

---

##### `map(mapper): R[] | Undefined`

Maps each array element and returns a new array. This does not mutate the original state but can be used for rendering or processing.

```typescript
const doubled = items.map(n => n * 2); // [4, 8]
```

---

### Subscriptions & Reactivity

##### `subscribe(callback: (value: T) => void): () => void`

Attach a listener to run when the state changes. Returns an unsubscribe() function.

```typescript
const message = createState("Hello");
const unsubscribe = message.subscribe(val => {
  console.log("Updated:", val);
});

message.set("World"); // Logs: "Updated: World"
unsubscribe(); // Stops listening
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

##### `tojson(): T`

Returns a plain JSON-serializable representation of the value, useful when sending data over the network or logging.

```typescript
JSON.stringify(user.toJSON());
```

---
