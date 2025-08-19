import { Fragment, createApp } from '@rumious/core';

const app = createApp({
  root: document.body,
});

app.setRootLayout(<Fragment>Hello from Rumious</Fragment>);

app.start();
