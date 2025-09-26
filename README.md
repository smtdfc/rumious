# ⚡ Rumious

![npm](https://img.shields.io/npm/v/@rumious/core)
![downloads](https://img.shields.io/npm/dt/@rumious/core)
![bundle size](https://img.shields.io/bundlephobia/min/@rumious/core)
![GitHub stars](https://img.shields.io/github/stars/smtdfc/rumious?style=social)
![Language](https://img.shields.io/github/languages/top/smtdfc/rumious)
![GitHub license](https://img.shields.io/github/license/smtdfc/rumious)

**Rumious** is a **Client-Side Rendering (CSR-first)** frontend framework.
It’s designed for modern **apps, dashboards, and interactive UIs** – where SSR and heavy hydration are not required.

Rumious compiles directly to **native DOM operations** and Web Components, delivering performance without a Virtual DOM layer.

---

## 🚀 Core Philosophy

- **CSR-first** → Focused entirely on client-side rendering for speed, simplicity, and DX.
- **No Hydration** → No need to reconcile server and client DOM trees.
- **No Virtual DOM** → Direct DOM compilation for maximum performance.
- **Web Components** → Fully interoperable with other frameworks or standalone.
- **Lean Runtime** → Minimal overhead, optimized for interactive apps and logged-in experiences.

Rumious is ideal for apps where **interactivity > SEO**: dashboards, tools, admin panels, SaaS, internal apps.

---

## 📦 Installation

```sh
npm install @rumious/core @rumious/browser @rumious/cli
```

---

## 🔧 Basic Usage

```tsx
import { Fragment, createApp } from '@rumious/core';

const app = createApp({ root: document.body });

app.setRootLayout(
  <Fragment>
    <h1>Hello Rumious</h1>
  </Fragment>,
);

app.start();
```

Rumious compiles this code into **direct DOM operations**, no VDOM diffing, no runtime patching.

---

## 📚 Documentation & Community

(coming soon) – Rumious Docs & Guides.
Join us on GitHub Discussions / Discord to share ideas and contribute.

---

## 🎯 Roadmap

- 🔧 **Enhanced CLI** – Better project scaffolding & dev tooling.
- 🪝 **More Lifecycle Hooks** – Finer control of DOM attachment & cleanup.
- 🧩 **Lightweight State Management** – Built-in or compatible with external libs.

---

## 📄 License

MIT License – free for personal and commercial use.

---

## 🙏 Contributing

We welcome contributions!

1. Fork the repo
2. Create a branch
3. Commit with clear messages
4. Submit a PR 🎉

---

## ✨ Manifesto

Rumious is built with one belief:

> **The future of interactive apps belongs to the client.**

We don’t chase SSR, we don’t chase hydration.
We focus on **apps that live and breathe on the client** – fast, reactive, and framework-agnostic.

CSR is not a fallback. CSR is the core.
