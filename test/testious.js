const { runTests } = require('testious');
const initBrowserEnv = require('testious-browser-env');

initBrowserEnv.default();
require('./core/app.test.js');
require('./core/component.test.js');
require('./core/template.test.js');
require('./core/ref.test.js');
require('./core/state.test.js');

runTests();