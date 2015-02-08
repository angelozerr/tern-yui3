(function(root, mod) {
    if (typeof exports == "object" && typeof module == "object") return mod(exports, require("./yuidoc2tern")); // CommonJS
    if (typeof define == "function" && define.amd) return define([ "exports", "yuidoc2tern" ], mod); // AMD
    mod(root.yuidoc2tern, root.yuidoc2tern); // Plain browser env
})(this, function(exports, yuidoc2tern) {
  "use strict";
  
  var YUI = exports.YUI = {};
  YUI.generate = function(api) {
    var options = {
      "name" : "yui3",
      "initialize" : initialize,
      "getType" : getType,
      "getEffects" : getEffects,
      "baseURL": "http://yuilibrary.com/yui/docs/api/"
    };
    var generator = new yuidoc2tern.Generator(options);
    return generator.process(api);
  }
  
  var initialize = function(ternDef) {
    ternDef["YUI"] = "fn() -> +yui.YUI";
  }
  
  var overrideDef = {
    "yui": {
      "YUI": {
        "use": {
          "!type": "fn(modules: string, callback?: fn(Y: +yui.YUI)) -> !this",
          "!effects": ["custom yui_use"] 
        }        
      }
    }
  }
  
  var getType = function(moduleName, className, methodName) {
    var base = getBase(moduleName, className, methodName);
    if (base) return base["!type"];
  }

  var getEffects = function(moduleName, className, methodName) {
    var base = getBase(moduleName, className, methodName);
    if (base) return base["!effects"];
  }
  
  var getBase = function(moduleName, className, methodName) {
    var mod = overrideDef[moduleName];
    if (!mod) return null;
    var base = className ? mod[className]: mod;
    if (base) return base[methodName];
  }
  
});  