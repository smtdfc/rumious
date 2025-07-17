# JSX Syntax Guide

JSX (JavaScript XML) is a syntax extension for JavaScript. It allows you to write HTML-like code directly within your JavaScript logic.

## 1. Basic JSX

```javascript
const element = <h1>Hello, world!</h1>;
```

JSX elements are translated into `React.createElement` calls under the hood.

## 2. Embedding Expressions

```javascript
const name = 'Alice';
const greeting = <h1>Hello, {name}!</h1>;
```

You can embed any JavaScript expression inside curly braces `{}`.

## 3. JSX is an Expression

JSX can be assigned to variables, passed as arguments, or returned from functions:

```javascript
function getGreeting(name) {
  return <h1>Hello, {name}</h1>;
}
```

## 4. Specifying Attributes

Attributes in JSX are written in camelCase for JavaScript-style naming:

```javascript
const image = <img src="logo.png" alt="Logo" class="logo" />;
```

## 5. Nesting Elements

```javascript
const page = (
  <div>
    <h1>Welcome</h1>
    <p>This is a sample page.</p>
  </div>
);
```

Wrap multiple JSX elements inside a parent element.

## 6. JSX Fragments

You can use fragments to group elements without extra nodes:

```javascript
import { Fragment } from '@rumious/core';

<Fragment>
  <li>Item 1</li>
  <li>Item 2</li>
</Fragment>;
```
