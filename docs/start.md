# Hello World with Rumious

Once your project is initialized, let’s create a simple “Hello World” application to understand the basic structure and rendering workflow in Rumious.

### Step 1: Edit app.tsx

Open the app.tsx file and replace its contents with the following:

```typescript
import { createApp } from 'rumious';

const app = createApp({
  root: document.getElementById('root')
});

app.render(
  <div>
    <h1>Hello, World!</h1>
  </div>
);

```

**Explanation**

`createApp` initializes a new Rumious application instance.

The root property tells Rumious where to mount your UI in the DOM.

The `render()` method accepts a TSX element and injects it into the specified root.

TSX (TypeScript + JSX) syntax is used to define the UI in a clean, HTML-like structure.


> Note: Ensure your `public/index.html` contains a DOM element with the ID root. For example:

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Rumious App</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="dist/bundle.js"></script>
  </body>
</html>
```

### Step 2: Build and Run

To compile your application and see it in action, run:

```bash
npx rumious build dev -w
```

Then open `public/index.html` in your browser. You should see:

```
Hello, World!
```

Congratulations — you've just built your first Rumious app!

