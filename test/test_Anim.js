var util = require("./util");

// see http://yuilibrary.com/yui/docs/api/classes/Anim.html

exports['test Anim Methods+Properties static'] = function() {
	util.assertCompletion("YUI().use('', function(Y) { Y.Anim.", {
	    "start":{"line":0,"ch":35},
	    "end":{"line":0,"ch":35},
	    "isProperty":true,
	    "isObjectKey":false,
	    "completions":[{"name":"apply","type":"fn(this: ?, args: [?])","origin":"ecma5"},
	                   {"name":"behaviors","type":"?","origin":"yui3"},
	                   {"name":"bind","type":"fn(this: ?, args?: ?)","origin":"ecma5"},
	                   {"name":"call","type":"fn(this: ?, args?: ?)","origin":"ecma5"},
	                   {"name":"getBezier","type":"fn(points: [number], t: number) -> [number]","origin":"yui3"},
	                   {"name":"intervalTime","type":"?","origin":"yui3"},
	                   {"name":"pause","type":"fn()","origin":"yui3"},
	                   {"name":"prototype","type":"anim.Anim.prototype","origin":"yui3"},
	                   {"name":"run","type":"fn()","origin":"yui3"},{"name":"stop","type":"fn()","origin":"yui3"},
	                   {"name":"DEFAULT_GETTER","type":"?","origin":"yui3"},
	                   {"name":"DEFAULT_SETTER","type":"?","origin":"yui3"},
	                   {"name":"DEFAULT_UNIT","type":"?","origin":"yui3"},
	                   {"name":"RE_DEFAULT_UNIT","type":"?","origin":"yui3"}
	                  ]
	});
}
   
exports['test Anim Methods+Properties (not static)'] = function() {
  util.assertCompletion("YUI().use('', function(Y) { var anim = new Y.Anim(); anim.", {
      "start":{"line":0,"ch":58},
      "end":{"line":0,"ch":58},
      "isProperty":true,
      "isObjectKey":false,
      "completions":[{"name":"pause","type":"fn()", "origin":"yui3"},
                     {"name":"run","type":"fn()", "origin":"yui3"},
                     {"name":"stop","type":"fn(finish: bool)", "origin":"yui3"}
                    ]
  });
}

if (module == require.main) require("test").run(exports);