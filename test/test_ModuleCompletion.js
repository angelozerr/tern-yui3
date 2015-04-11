var util = require("./util");

exports['test YUI Module Completion'] = function() {
	util.assertCompletion("YUI().use('an'", {
	    "start":{"line":0,"ch":10},
	    "end":{"line":0,"ch":14},
	    "isProperty":false,
	    "isObjectKey":false,
	    "completions":[{"name":"'anim'","type":"anim","origin":"yui3","displayName":"anim"}]
	}, null, 1);
	
	// Test completion with '-' inside module name like async-queue 
    util.assertCompletion("YUI().use('as'", {
      "start":{"line":0,"ch":10},
      "end":{"line":0,"ch":14},
      "isProperty":false,
      "isObjectKey":false,
      "completions":[{"name":"'async-queue'","type":"async_queue","origin":"yui3","displayName":"async-queue"}]
    }, null, 1);	
}

if (module == require.main) require("test").run(exports);