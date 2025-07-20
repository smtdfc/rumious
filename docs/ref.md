# Ref

A `Ref<T>` is an object that gives you **direct access to a DOM element** inside your component.
It's created using the `createRef()` function and attached to elements via the `ref={...}` directive.

This class provides utility methods to **read, modify, and interact with the DOM element** it’s bound to.

---

## Usage

```ts
const inputRef = createRef<HTMLInputElement>();

// In your TSX template:
<input ref={inputRef} />

// Access the element later:
inputRef.focus();
console.log(inputRef.value); // current input value
```

---

#### `createRef<T>()`

```ts
function createRef<T extends HTMLElement>(): Ref<T>
```

Creates a new `Ref<T>` instance.

---

##  Properties

#### `element: T | null`

The DOM element this ref is currently bound to.
Will be `null` if the ref is not yet attached.

---

#### `value: string`

```ts
get value(): string
set value(v: string): void
```

Gets or sets the `.value` property of the element.
Commonly used for input, textarea, and other form elements.

---

#### `text: string`

```ts
get text(): string
set text(t: string): void
```

Gets or sets the `textContent` of the element.

---

#### `html: string`

```ts
get html(): string
set html(t: string): void
```

Gets or sets the `innerHTML` of the element.

---

##  Methods

#### `setTarget(target: T): void`

Used internally by the `ref={...}` directive to bind the DOM element.
You usually don’t call this manually.

---

#### `isSet(): boolean`

Returns `true` if the element is set (i.e., attached in the DOM), otherwise `false`.

---

##  Class Operations

#### `addClass(name: string): void`

Adds a class to the element.

---

#### `removeClass(name: string): void`

Removes a class from the element.

---

#### `toggleClass(name: string): void`

Toggles a class on the element.

---

##  DOM Utilities

#### `addChild(node: Node): void`

Appends a child node to the element.

---

#### `clear(): void`

Removes all children / content inside the element.

---

#### `remove(): void`

Removes the element from the DOM and clears the internal reference.

---

## Attributes

#### `setAttr(name: string, value: string): void`

Sets an attribute on the element.

---

#### `getAttr(name: string): string | null`

Gets the value of an attribute, or `null` if not present.

---

#### `removeAttr(name: string): void`

Removes an attribute from the element.

---

##  Event Listeners

#### `on(event, listener): void`

```ts
on<K extends keyof HTMLElementEventMap>(
  event: K,
  listener: (ev: HTMLElementEventMap[K]) => any
)
```

Adds an event listener to the element.

---

#### `off(event, listener): void`

```ts
off<K extends keyof HTMLElementEventMap>(
  event: K,
  listener: (ev: HTMLElementEventMap[K]) => any
)
```

Removes an event listener from the element.

---

##  Focus Control

#### `focus(): void`

Focuses the element (if applicable).

---

#### `blur(): void`

Removes focus from the element.

---

##  Visibility

#### `hide(): void`

Sets `display: none` on the element.

---

#### `show(display = 'block'): void`

Shows the element using the provided display value (default: `'block'`).

---

##  Style

#### `setStyle(property: string, value: string): void`

Sets a CSS property on the element.

---

#### `getStyle(property: string): string`

Gets the value of a CSS property.

