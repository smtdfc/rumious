import "../index.js";
import { allGroup } from 'testious';
import { BrowserRunner } from 'testious-browser-runner';
function runTest() {
BrowserRunner.run(allGroup());
}
runTest();
