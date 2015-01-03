(function(root, mod) {
    if (typeof exports == "object" && typeof module == "object") return mod(exports, require("./yuidoc2tern")); // CommonJS
    if (typeof define == "function" && define.amd) return define([ "exports", "yuidoc2tern" ], mod); // AMD
    mod(root.yuidoc2tern, root.yuidoc2tern); // Plain browser env
})(this, function(exports, yuidoc2tern) {
  "use strict";
  
  var YUI = exports.YUI = {};
  YUI.generate = function(api) {
    var options = {
      "name" : "yui_3",
      "initialize" : initialize,
      "getType" : getType,
      "getEffects" : getEffects
    };
    var generator = new yuidoc2tern.Generator(options);
    return generator.process(api);
  }
  
  var initialize = function(ternDef) {
    ternDef["YUI"] = "fn() -> +yui.YUI";
  }
  
  var getType = function(moduleName, className, name) {
    switch(className) {
    case 'YUI':
      switch(name) {
      case 'use':
    	  return 'fn(modules: string, callback?: fn(Y: +yui.YUI)) -> !this';
      } 
      break;
    }
  }

  var getEffects = function(moduleName, className, name) {
    switch(className) {
    case 'YUI':
      switch(name) {
      case 'use':
    	  return ["custom yui_use"];
      } 
      break;
    }
  }
  
});  