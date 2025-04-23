import * as apis from './index.js';

declare global {
  interface Window {
    RumiousRouter: Record<string, any>;
  }
}

const RumiousRouter = {
  ...apis,
};

window.RumiousRouter = RumiousRouter;
export default RumiousRouter;
