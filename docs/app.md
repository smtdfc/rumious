## Rumious App Overview

The `App` is the base class of a Rumious application. This class manages modules, states, and the rendering lifecycle.

To initialize an app, use the `createApp(config: AppConfig)` function from `@rumious/core`:

```typescript
import { createApp } from '@rumious/core';

const app = createApp({
  root: document.body,
});

app.start();
```

### Explanation

- `createApp(config: AppConfig)`: Accepts a configuration object and returns an instance of the `App` class.
- `AppConfig`: A config interface for initializing the application. It includes:
  - `root`: The root DOM element where the app will be mounted.
  - `data` _(optional)_: A global reactive data object accessible by all components, services, and states.

- `App.start()`: Starts the application. This triggers Rumious to run lifecycle hooks, set up event delegation, and render the UI.

### Render Your UI

You can use `App.setRootLayout(component: Template)` to set the root UI Component for your application.

#### Example

```typescript
import {
  Component,
  EmptyProps,
  createApp
} from '@rumious/core';

class AppComponent extends Component<EmptyProps> {
  template() {
    return <h1>Hello Rumious</h1>;
  }
}

const app = createApp({
  root: document.body
});

app.setRootLayout(
  <AppComponent>
);

app.start();
```

### Explanation

- `App.setRootLayout(component: Template)`: Accepts a JSX component representing the root layout of the application. This component is rendered when the application starts.
