exports['test YUI 2 Tern - Type'] = require('./test_yuidoc2tern');
exports['test YUI 2 Tern'] = require('./test_yui2tern');
exports['test YUI Tern completion'] = require('./test_completion');
exports['test YUI Tern Module Completion'] = require('./test_ModuleCompletion');
exports['test Anim'] = require('./test_Anim');
exports['test Node'] = require('./test_Node');

if (require.main === module) require("test").run(exports);