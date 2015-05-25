var util = require("./util");

// see http://yuilibrary.com/yui/docs/yui/index.html#instance-config

exports['test YUI Instance Config '] = function() {
	util.assertCompletion("YUI({", {
	    "start":{"line":0,"ch":5},
	    "end":{"line":0,"ch":5},
	    "isProperty":true,
	    "isObjectKey":true,
	    "completions":[{"name":"2in3","type":"string","origin":"yui3"},
	                   {"name":"aliases","type":"yui.Object","origin":"yui3"},
	                   {"name":"base","type":"string","origin":"yui3"},
	                   {"name":"bootstrap","type":"bool","origin":"yui3"},
	                   {"name":"cacheUse","type":"bool","origin":"yui3"},
	                   {"name":"combine","type":"bool","origin":"yui3"},
	                   {"name":"comboBase","type":"string","origin":"yui3"},
	                   {"name":"core","type":"yui.Array","origin":"yui3"},
	                   {"name":"cssAttributes","type":"yui.Object","origin":"yui3"},
	                   {"name":"dateFormat","type":"string","origin":"yui3"},
	                   {"name":"debug","type":"bool","origin":"yui3"},
	                   {"name":"delayUntil","type":"yui.Object","origin":"yui3"},
	                   {"name":"doc","type":"Document","origin":"yui3"},
	                   {"name":"errorFn","type":"fn()","origin":"yui3"},
	                   {"name":"fetchCSS","type":"bool","origin":"yui3"},
	                   {"name":"filter","type":"yui.Object","origin":"yui3"},
	                   {"name":"filters","type":"yui.Object","origin":"yui3"},
	                   {"name":"force","type":"[string]","origin":"yui3"},
	                   {"name":"gallery","type":"string","origin":"yui3"},
	                   {"name":"global","type":"yui.Object","origin":"yui3"},
	                   {"name":"groups","type":"yui.Object","origin":"yui3"},
	                   {"name":"ignore","type":"[string]","origin":"yui3"},
	                   {"name":"injected","type":"bool","origin":"yui3"},
	                   {"name":"insertBefore","type":"Element","origin":"yui3"},
	                   {"name":"jsAttributes","type":"yui.Object","origin":"yui3"},
	                   {"name":"lang","type":"string","origin":"yui3"},
	                   {"name":"loadErrorFn","type":"fn()","origin":"yui3"},
	                   {"name":"loaderPath","type":"string","origin":"yui3"},
	                   {"name":"locale","type":"string","origin":"yui3"},
	                   {"name":"logExclude","type":"yui.Object","origin":"yui3"},
	                   {"name":"logFn","type":"fn()","origin":"yui3"},
	                   {"name":"logInclude","type":"?","origin":"yui3"},
	                   {"name":"logLevel","type":"string","origin":"yui3"},
	                   {"name":"modules","type":"yui.Object","origin":"yui3"},
	                   {"name":"pollInterval","type":"number","origin":"yui3"},
	                   {"name":"purgethreshold","type":"number","origin":"yui3"},
	                   {"name":"requireRegistration","type":"bool","origin":"yui3"},
	                   {"name":"root","type":"string","origin":"yui3"},
	                   {"name":"skin","type":"yui.Object","origin":"yui3"},
	                   {"name":"throwFail","type":"bool","origin":"yui3"},
	                   {"name":"timeout","type":"number","origin":"yui3"},
	                   {"name":"useBrowserConsole","type":"bool","origin":"yui3"},
	                   {"name":"useHistoryHTML5","type":"bool","origin":"yui3"},
	                   {"name":"useNativeES5","type":"bool","origin":"yui3"},
	                   {"name":"useNativeJSONParse","type":"bool","origin":"yui3"},
	                   {"name":"useNativeJSONStringify","type":"bool","origin":"yui3"},
	                   {"name":"win","type":"?","origin":"yui3"},
	                   {"name":"windowResizeDelay","type":"number","origin":"yui3"},
	                   {"name":"yui2","type":"string","origin":"yui3"}
	                  ]
	});
}

if (module == require.main) require("test").run(exports);