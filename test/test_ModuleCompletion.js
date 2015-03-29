var util = require("./util");

exports['test YUI Module Completion'] = function() {
	util.assertCompletion("YUI().use('an'", {
	    "start":{"line":0,"ch":10},
	    "end":{"line":0,"ch":14},
	    "isProperty":false,
	    "isObjectKey":false,
	    "completions":[{"name":"'anim'","type":"anim","origin":"yui3","displayName":"anim"}]
	}, null, 1);
}

if (module == require.main) require("test").run(exports);