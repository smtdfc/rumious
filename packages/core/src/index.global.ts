import * as Component from './component/index.js';
import * as App from './app/index.js';
import * as JSX from './jsx/index.js';
import * as Render from './render/index.js';
import * as Ref from './ref/index.js';
import * as State from './state/index.js';
import * as Context from './context/index.js';
import * as Performance from './performance/index.js';

declare global {
  interface Window {
    Rumious: Record<string, any>;
  }
}

const Rumious = {
  ...Component,
  ...App,
  ...JSX,
  ...Render,
  ...Ref,
  ...State,
  ...Context,
  ...Performance,
};

window.Rumious = Rumious;
export default Rumious;
