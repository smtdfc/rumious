import { createApp } from 'rumious';

let rootElement = document.getElementById('root');
if(!rootElement) {
  throw 'Root element not found '
}

const app = createApp({
  root:document.body
});

app.render(
  <h1>Hello Rumious</h1>
);
