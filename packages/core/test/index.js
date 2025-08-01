import { runTests } from 'testious';
import initEnv from 'testious-browser-env';

initEnv();

await import("./app.js");
await import("./component.js");
runTests();