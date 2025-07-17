# Directive System in Rumious

Rumious supports a powerful directive system that enables fine-grained, declarative behavior in JSX. Directives are attributes prefixed with special keywords (e.g., `on:`, `bind:`, `model:`) and are compiled at build time by the Rumious template compiler.

Below is a detailed explanation of each directive supported in Rumious.

---

### `model:` – One-Way Binding to State

Used to bind the value of an input-like element to a `State<T>`.

```ts
const message = createState("Hello");

<input model={message} />
```

This will:

- Set the input’s initial value to `message.get()`
- Automatically update `message` when the input value changes

> 🔥 **Note:** `model:` works only with input-related elements (`<input>`, `<textarea>`, etc.)

---

### `ref:` – DOM Reference Binding

Assigns a reference to a variable so you can directly access the DOM element.

```ts
import { createRef } from '@rumious/core';

const inputRef = createRef<HTMLInputElement>();

<input ref={inputRef} />
```

Later, you can access the raw DOM element:

```ts
inputRef.element?.focus();
```

> 💡 **Use with caution:** Direct DOM access is often unnecessary due to Rumious's reactivity.

---

### `on:` – Event Listeners

Attach event handlers declaratively.

```ts
<button on:click={(e) => alert("Clicked!")}>Click me</button>
```

You can access the native event object, and the handler will be attached efficiently.

> 📌 Supported events include all native DOM events: `click`, `input`, `change`, `submit`, etc.

---

### `bind:` – Reactive Property Binding

Binds a DOM property (not attribute) to a state.

```ts
const isChecked = createState(false);
<input type="checkbox" bind:checked={isChecked} />
```

- Sets `element.checked = isChecked.get()`
- Updates `isChecked` when the checkbox changes

> ✅ Works well with properties like `value`, `checked`, `disabled`, etc.

---

### `attr:` – Reactive Attribute Binding

Sets a standard HTML attribute from a state.

```ts
const dynamicClass = createState("btn-primary");
<button attr:class={dynamicClass}>Submit</button>
```

Whenever `dynamicClass` changes, the `class` attribute will be updated.

> 🚧 **Note:** This only affects HTML attributes. If you're targeting DOM properties, use `bind:` instead.

---

### `compile:` – Apply Compile-Time Modifiers

Customize how a node is compiled by providing modifiers at build time.

```ts
<p compile:preserveWhiteSpace="true">
  This     text
  will     keep     its     spacing.
</p>
```

#### Supported Modifiers:

- `preserveWhiteSpace`: Prevents whitespace compression in text nodes

> 🛠️ **Use case:** When dealing with preformatted text or preserving layout spacing.

---

### `inject:` – Inject Raw HTML (Dangerous)

This directive allows direct HTML injection into an element. It bypasses Rumious’s DOM safety.

```ts
const rawHTML = createState("<b>Dangerous HTML</b>");
<div inject={rawHTML}></div>
```

> ⚠️ **WARNING:** This is dangerous. Never use `inject` with untrusted content. It can lead to XSS vulnerabilities.

Only use when you fully trust the HTML string you're injecting.

---

### `view:` – Attach a ViewRef

Creates and binds a `ViewRef` to a DOM node, allowing programmatic manipulation.

```ts
import { createView } from '@rumious/core';

const view = createView();

<div view={view}></div>
```
