import { runTests } from 'testious';
import initEnv from 'testious-browser-env';

initEnv();

await import("./app.js");
await import("./component.js");
await import("./context.js");
await import("./ref.js");
await import("./viewControl.js");
await import("./state.js");

runTests();