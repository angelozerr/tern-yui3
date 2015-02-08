exports['test YUI 2 Tern - Type'] = require('./test_yuidoc2tern');
exports['test YUI 2 Tern'] = require('./test_yui2tern');
exports['test YUI Tern completion'] = require('./test_completion');
exports['test Anim'] = require('./test_Anim');

if (require.main === module) require("test").run(exports);