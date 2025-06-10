# Directives in Rumious

Directives in Rumious provide a declarative and intuitive way to link UI elements with your application logic or reactive state. They allow you to control DOM behavior, bind attributes or properties, and interact with elements in a structured way — without writing imperative DOM code manually.

Rumious currently supports several built-in directives:


### 1. Element Reference (ref)

The `ref` directive allows you to retain a reference to a DOM element rendered in the view. This can be used to access or manipulate the element directly via DOM APIs.

Example:
```ts
import { createApp, createRef } from 'rumious';

const app = createApp({ root: document.getElementById('root') });

const titleRef = createRef();

app.render(<h1 ref={titleRef}>Hello</h1>);

// Later usage:
console.log(titleRef.element?.textContent); // Outputs: Hello
```

> `ref` provides a reactive wrapper around the actual DOM element and is useful for reading or updating DOM manually if needed.


### 2. Two-Way Data Binding (model)

The `model` directive binds a form input’s value directly to a `RumiousState`. Whenever the input is updated by the user, the state will reflect the new value — and vice versa.

Supported elements:

```html
<input>

<textarea>

<select>
```


Example:

```ts
import { createApp, createState } from 'rumious';

const app = createApp({ root: document.getElementById('root') });
const name = createState<string>("");

app.render(
  <div>
    <input model={name} />
    <p>Hello, {name}</p>
  </div>
);
```

> Any change to the input is reflected in name, and any update to name automatically updates the input field.


### 3. Bind Element Properties (bind:<property>)

The `bind` directive allows you to link a DOM property or attribute to a state value. When the state changes, Rumious automatically updates the corresponding property on the element.

Supported bindings include:

`Bind:text` → textContent

`bind:html` → innerHTML

`bind:style` → style (object or string)

`bind:class` → className or class object

`bind:disabled`, `bind:checked`, `bind:value`


##### Example 1 – Binding Text Content:

```ts
<h1 bind:text={titleState} />
```

##### Example 2 – Binding Inline Style:

```ts
<div bind:style={styleState} />
```

##### Example 3 – Binding Class:

```ts
<div bind:class={classNameState} />
```

> All bindings are reactive: when the state changes, the DOM updates automatically without needing manual DOM manipulation.

### 4. Set HTML Attributes Reactively (attr:<attribute>)

This directive binds a raw HTML attribute to a state or expression. Unlike `bind`, which targets properties, `attr` directly sets or removes an HTML attribute.

Example:

```ts
<img attr:src={imageUrl} attr:alt={description} />
```

> When imageUrl or description changes, the underlying `src` and `alt` attributes are updated immediately.


**Note:** Use `attr`: when you want to manipulate HTML attributes as-is, like `id`, `href`, `title`, `src`, `alt`, etc.


### 5. Bind Native DOM Properties (prop:<property>)

This directive updates native DOM properties instead of HTML attributes. This is useful when you need precise control over JavaScript properties that differ from attributes (e.g., `value`, `checked`, `disabled`, etc.).

Example:

```ts
<input prop:value={state} prop:disabled={isDisabled} />
```

> While `attr`: sets the initial value in HTML, `prop`: ensures the actual DOM property reflects the latest state.


6. Event Listener Binding (on:event)

The `on:` directive attaches event listeners declaratively. It expects a callback function, which will be invoked whenever the specified event occurs.

Example:

```ts
<button on:click={() => alert('Clicked!')}>Click Me</button>
```

You can use any valid DOM event:

```
<input on:input={handleInput} on:focus={handleFocus} />
```

### 7. Inject Raw HTML (⚠️ Caution!) (html={...})

The `html` directive allows you to inject raw HTML into the DOM. Use this only when you're sure about the content’s safety, as it bypasses standard rendering mechanisms and introduces potential XSS risk.

Example:

```
let htmlContent = createState("<b>Hello</b>");

<div html={htmlContent} />
```

> ⚠️ This directive is dangerous if used with untrusted data. Always sanitize any user-generated content before injecting.

