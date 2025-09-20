import { Fragment, createApp } from '@rumious/core';
import './styles/main.css';
import logo from '../assets/logo.webp';

const app = createApp({
  root: document.body,
});

app.setRootLayout(
  <Fragment>
    <div class="container">
      <img src={logo} alt="Logo" class="logo" />
      <div>
        <p class="title">Rumious</p>
        <p class="tagline">🚀 Kickstart your Rumious project in seconds!</p>
        <p class="edit-tip">
          Open <code>src/index.tsx</code> to edit.
        </p>
      </div>
      <div class="buttons">
        <a class="btn btn-secondary" href="https://rumious.pages.dev/">
          Docs
        </a>
        <a class="btn btn-secondary" href="https://github.com/smtdfc/rumious">
          Github
        </a>
        <a
          class="btn btn-secondary"
          href="https://rumious.pages.dev/#/playground"
        >
          Playground
        </a>
      </div>
    </div>
  </Fragment>,
);

app.start();
