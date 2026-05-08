# Rumious

Rumious is a frontend framework designed with a Virtual DOM-less (VDOM-less) philosophy, leveraging the power of a Rust-based compiler to optimize source code at compile-time.

## Key Features

- 🚀 **Extreme Performance & VDOM-less:** Rumious mounts and updates the DOM directly instead of routing through a Virtual DOM layer, achieving maximum processing speed and responsiveness.
- 🦀 **Rust-based Compiler:** A powerful compiler written in Rust (executing via WASM) performs static analysis and optimizes UI code before it runs in the browser.
- ⚡ **Fine-grained Reactivity:** A fine-grained reactivity system utilizing `createState` ensures that state changes only update the precise DOM nodes that require it, minimizing redundant operations.
- 🚏 **Integrated Routing:** Effortlessly handle application navigation with `@rumious/router`.

## Project Structure (Monorepo)

The project is managed as a Monorepo, bridging the Rust and TypeScript/JavaScript ecosystems:

- **`crates/compiler`**: The core compiler written in Rust, responsible for compiling and optimizing Rumious syntax.
- **`packages/core`**: The framework's core APIs, housing the reactivity system (`createState`, etc.) and the DOM rendering engine.
- **`packages/compiler`**: A WASM compiler wrapper integrating the Rust compiler into the Node.js environment.
- **`packages/router`**: The routing management library.
- **`packages/vite-plugin`**: A dedicated Vite plugin for the framework, enabling rapid development environment setup.
- **`packages/config`**: Shared configurations utilized across the project's packages.

## Getting Started

This project uses `pnpm` as its package manager.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/smtdfc/rumious.git
   cd rumious
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Build the source:**
   ```bash
   # If you make changes to the Rust compiler, you may need to rebuild the WASM (depending on the package setup).
   # Then build the TypeScript packages:
   pnpm -r run build
   ```

4. **Run test suites:**
   ```bash
   pnpm test
   ```

## Community and Contributions

We welcome all community contributions. Feel free to open [Issues](https://github.com/smtdfc/rumious/issues) to report bugs, request new features, or create a Pull Request to contribute source code.

## License

This project is released under the [MIT License](https://opensource.org/licenses/MIT). Copyright belongs to smtdfc.
