# TSX Syntax

Rumious uses TSX (TypeScript + JSX) as the primary syntax for building UI components. TSX provides a powerful way to write HTML-like structures directly in TypeScript, making your UI more declarative, readable, and type-safe.

### 1. What is TSX?

TSX is an extension of JSX (JavaScript XML) that allows you to use TypeScript’s static type checking in UI declarations. It helps catch errors early and makes your UI code more robust and maintainable.

In Rumious, TSX elements are compiled to JavaScript using the Rumious compiler and transformed into efficient DOM operations at runtime.



### 2. Basic Syntax

##### Element Declaration

You can declare HTML-like elements using angle brackets:

```ts
<div>Hello</div>
```

**Note:** All elements must be properly closed following the XHTML style:

```ts
<img src="logo.png" />
<br />
```

Unclosed tags will result in compilation errors.


##### Attributes

You can assign HTML attributes using a key-value format:

```ts
<input type="text" placeholder="Enter your name" />
```

To insert dynamic values or expressions, wrap them in {}:

```ts
<h1>{userName}</h1>
<input value={state.get()} />
```

You can also embed any valid TypeScript expression inside {}:

```ts
<p>{1 + 2}</p>
<p>{items.length > 0 ? "Yes" : "No"}</p>

```

##### Components

You can define functional components and use them like HTML tags:

```ts
import {createApp,RumiousComponent} from 'rumious';


let app = createApp({
  root: document.body
})

class Greeting extends RumiousComponent<any>{
  template(){
    return <h1>Hello</h1>
  }
}

app.render(<Greeting />);

```

### 3. Fragments

If you want to return multiple sibling elements without an extra wrapper, use `Fragment`:

```ts
import { Fragment } from 'rumious';

<Fragment>
  <h1>Title</h1>
  <p>Description</p>
</Fragment>
```

This avoids rendering unnecessary DOM nodes and keeps the output clean.

### 4. Conditional Rendering

Use ternary operators or short-circuiting to render elements conditionally:

```ts
{isLoggedIn ? <p>Welcome back!</p> : <p>Please sign in.</p>}
{showButton && <button>Click me</button>}
```


### 5. List Rendering

Use `Array.map()`to render lists of elements:

```ts
const items = ['A', 'B', 'C'];

<ul>
  {items.map(item => <li>{item}</li>)}
</ul>
```

---

#### Summary

TSX provides a concise and powerful syntax for combining HTML and TypeScript logic. With full support for expressions, conditional rendering, fragments, and components, TSX is at the heart of building UIs in Rumious.

