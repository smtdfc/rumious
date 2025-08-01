import { runTests } from 'testious';
import initEnv from 'testious-browser-env';

initEnv();

await import("./app.js");
await import("./component.js");
await import("./context.js");
await import("./ref.js");

runTests();