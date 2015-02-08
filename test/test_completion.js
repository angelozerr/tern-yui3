var util = require("./util");

exports['test YUI completion'] = function() {
	util.assertCompletion("Y", {
	    "start":{"line":0,"ch":0},
	    "end":{"line":0,"ch":1},
	    "isProperty":false,
	    "isObjectKey":false,
	    "completions":[{"name":"YUI","type":"fn() -> yui.YUI",
	    "origin":"yui3"}]
	});
}

exports['test YUI().use completion'] = function() {
	util.assertCompletion("YUI().u", {
	    "start":{"line":0,"ch":6},
	    "end":{"line":0,"ch":7},
	    "isProperty":true,
	    "isObjectKey":false,
	    "completions":[{"name":"use","type":"fn(modules: string, callback?: fn(Y: yui.YUI))",
	    "origin":"yui3"}]
	});
}

exports['test Y.one completion'] = function() {
	util.assertCompletion("YUI().use('', function(Y) { Y.one", {
	    "start":{"line":0,"ch":30},
	    "end":{"line":0,"ch":33},
	    "isProperty":true,
	    "isObjectKey":false,
	    "completions":[{"name":"one","type":"fn(node: string) -> node.Node",
	    "origin":"yui3"}]
	});
}

// see https://github.com/angelozerr/tern-yui3/issues/12
exports['test Y.one completion with 2 modules (issue 12)'] = function() {
  util.assertCompletion("YUI().use('mod1', 'mod2', function(Y) { Y.one", {
      "start":{"line":0,"ch":42},
      "end":{"line":0,"ch":45},
      "isProperty":true,
      "isObjectKey":false,
      "completions":[{"name":"one","type":"fn(node: string) -> node.Node",
      "origin":"yui3"}]
  });
}

exports['test !proto completion'] = function() {
	// check methods of Anim.anim
	util.assertCompletion("YUI().use('', function(Y) { var anim = new Y.Anim(); anim.p", {
	    "start":{"line":0,"ch":58},
	    "end":{"line":0,"ch":59},
	    "isProperty":true,
	    "isObjectKey":false,
	    "completions":[{"name":"pause","type":"fn()", "origin":"yui3"},
	                   {"name":"propertyIsEnumerable","type":"fn(prop: string) -> bool", "origin":"ecma5"}
	                  ]
	});
	//  Anim.anim extends base.Base
	util.assertCompletion("YUI().use('', function(Y) { var anim = new Y.Anim(); anim.unpl", {
	    "start":{"line":0,"ch":58},
	    "end":{"line":0,"ch":62},
	    "isProperty":true,
	    "isObjectKey":false,
	    "completions":[{"name":"unplug","type":"fn()", "origin":"yui3"}
	                  ]
	});
	
    //  Anim.anim extends base.Base with 2 modules
	// see https://github.com/angelozerr/tern-yui3/issues/12
    util.assertCompletion("YUI().use('mod1','mod2', function(Y) { var anim = new Y.Anim(); anim.unpl", {
        "start":{"line":0,"ch":69},
        "end":{"line":0,"ch":73},
        "isProperty":true,
        "isObjectKey":false,
        "completions":[{"name":"unplug","type":"fn()", "origin":"yui3"}
                      ]
    }); 	
}

exports['test Y.Anim completion'] = function() {
  util.assertCompletion("YUI().use('', function(Y) { new Y.A", {
    "name":"Anim",
    "type":"fn()",
    "origin":"yui3"
  }, "Anim");
}


if (module == require.main) require("test").run(exports);