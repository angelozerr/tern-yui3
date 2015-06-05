var util = require("./util");

// see http://yuilibrary.com/yui/docs/api/classes/App.html

exports['test App navigate'] = function() {
	util.assertCompletion("YUI().use('app', function(Y) { new Y.App().navigate('', {", {
	    "start":{"line":0,"ch":57},
	    "end":{"line":0,"ch":57},
	    "isProperty":true,
	    "isObjectKey":true,
	    "completions":[{"name":"force","type":"bool","origin":"yui3"},
	                   {"name":"replace","type":"bool","origin":"yui3"}
	                  ]
	});
}

if (module == require.main) require("test").run(exports);