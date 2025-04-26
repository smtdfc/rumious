# Rumious Router

A minimal and powerful routing solution for Rumious applications.

## Installation

```bash
npm install rumious-router
```

## Getting Started

Here's a quick example to help you get started:

```javascript
import { createApp, Fragment, RumiousComponent } from 'rumious';
import { RumiousRouterModule, RumiousRouterPageProps } from 'rumious-router';

// Define the StartPage component
class StartPage extends RumiousComponent<RumiousRouterPageProps> {
  template() {
    const router = this.props.router; // Access the router instance from props
    return (
      <Fragment>
        Start Page
        <button on:click={() => router.redirect('/a')}>Go to page A</button> {/* Redirect to Page A on click */}
      </Fragment>
    );
  }
}

// Define the PageA component
class PageA extends RumiousComponent<RumiousRouterPageProps> {
  template() {
    return <Fragment>Page A</Fragment>;
  }
}

const root = document.getElementById('root');

if (root) {
  const app = createApp(root); // Initialize the Rumious app

  // Add the router module with 'hash' strategy
  const router = app.addModule(RumiousRouterModule, {
    strategy: 'history', // 'hash' for #/path URLs; alternatively use 'path'
  });

  // Render the app root with router injection
  app.render(<Fragment>{router.rootInject}</Fragment>);

  // Listen to router events
  router.event.on('not_found', () => {
    console.log('not_found'); // When no route is matched
  });

  router.event.on('redirect', () => {
    console.log('redirect'); // When a redirection happens
  });

  // Define application routes
  router.addRoute('/', async () => StartPage, []);
  router.addRoute('/a', async () => PageA, []);

  router.start(); // Start the router
} else {
  throw new Error(`Element with id 'root' not found.`);
}
```

## Concepts Overview

- **RumiousRouterModule**: The core module that manages route handling.
- **router.rootInject**: A special object that injects router-driven views into the component tree.
- **router.addRoute(path, loader, layouts)**: Registers a new route; `loader` is an async function that returns a component.
- **router.redirect(path)**: Programmatically navigates to another route.
- **router.event**: Basic event system for reacting to router actions like `not_found` or `redirect`.
- **strategy**:
  - `'hash'`: Uses URL hash for routing (e.g., `/#/page`), no server configuration needed.
  - `'history'`: Uses normal path routing (e.g., `/page`), requires proper server-side setup.

## Documentation

Full documentation is coming soon. Stay tuned!

## License

MIT

