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

exports['test !proto completion'] = function() {
	// check methods of Anim.anim
	util.assertCompletion("YUI().use('', function(Y) { var anim = new Y.Anim().du", {
	    "start":{"line":0,"ch":52},
	    "end":{"line":0,"ch":54},
	    "isProperty":true,
	    "isObjectKey":false,
	    "completions":[{"name":"duration","type":"number",
	    "origin":"yui3"}]
	});
	//  Anim.anim extends base.Base
	util.assertCompletion("YUI().use('', function(Y) { var anim = new Y.Anim().unpl", {
	    "start":{"line":0,"ch":52},
	    "end":{"line":0,"ch":56},
	    "isProperty":true,
	    "isObjectKey":false,
	    "completions":[{"name":"unplug","type":"fn()",
	    "origin":"yui3"}]
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