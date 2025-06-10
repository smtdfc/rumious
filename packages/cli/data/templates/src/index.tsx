import { createApp } from 'rumious';

let rootElement = document.getElementById('root');
if(!rootElement) {
  throw 'Root element not found '
}

const RumiousApp = createApp({
  root:document.body
});


