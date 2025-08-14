
import { allGroup } from 'testious';
import { NodeRunner } from 'testious-node-runner';
function runTest() {
NodeRunner.run(allGroup());
}
runTest();
