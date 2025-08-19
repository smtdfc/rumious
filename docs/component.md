# Component Overview in Rumious

In Rumious, a **Component** is a powerful unit used to encapsulate and reuse UI logic. It helps organize the interface into isolated, testable, and maintainable pieces.

---

## Creating a Component

To create a component in Rumious, you extend the `Component` base class and implement the `template()` method:

```typescript
import { Component } from '@rumious/core';

class ExampleComponent extends Component<{ name: string }> {
  template() {
    return <h1>Hello {this.props.name}</h1>;
  }
}
```

- The generic type `<{ name: string }>` specifies the expected props for the component.
- The `template()` method returns a JSX template representing the component's UI.

---

## Component Properties

Every Rumious component has a few important properties:

#### `this.props`

An object containing the props passed to the component.

```typescript
this.props.name; // Access a prop called 'name'
```

#### `this.element`

The DOM element that represents the root of the component. This becomes available after mounting.

```typescript
console.log(this.element); // Reference to the root HTML element
```

#### `this.requestRender()`

Forces the component to re-render. Use it sparingly.

```typescript
this.requestRender(); // ⚠️ Triggers a re-render manually
```

> ⚠️ **Caution:** Calling `requestRender()` may affect performance. Only use it when necessary, such as after direct DOM manipulation or uncontrolled state changes.

---

## Component Lifecycle Hooks

Rumious provides a set of lifecycle methods that allow you to hook into different phases of a component's existence:

#### `onCreate()`

Called when the component is first instantiated, before anything is rendered.

#### `beforeMount()`

Called just before the component is added to the DOM.

#### `onMounted()`

Called after the component is successfully inserted into the DOM.

#### `beforeRender()`

Called before each render (initial or update).

#### `onRender()`

Called after each render, useful for post-render logic.

#### `onDestroy()`

Called right before the component is removed from the DOM. Use this to clean up listeners, intervals, etc.

```typescript
class TimerComponent extends Component<{}> {
  interval: number;

  onMounted() {
    this.interval = setInterval(() => this.requestRender(), 1000);
  }

  onDestroy() {
    clearInterval(this.interval);
  }

  template() {
    return <span>{new Date().toLocaleTimeString()}</span>;
  }
}
```

> 🔍 **Note:** You should avoid triggering `requestRender()` inside `template()` or during render itself — it can lead to infinite loops.

---

## Props Usage

Props are passed to a component via JSX:

```typescript
<ExampleComponent name="Alice" />
```

---

## Rendering a Component

You can embed a component in the layout just like any other JSX tag:

```typescript
app.setRootLayout(
  <div>
    <ExampleComponent name="Rumious" />
  </div>
);
```
