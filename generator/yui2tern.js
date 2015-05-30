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
      "getData" : getData,
      "baseURL": "http://yuilibrary.com/yui/docs/api/"
    };
    var generator = new yuidoc2tern.Generator(options);
    return generator.process(api);
  }
  
  var initialize = function(ternDef) {
    ternDef["YUI"] = "yui.YUI";
  }
  
  var overrideDef = {
    "yui": {
      "YUI": {
        "!type": "fn(config?: +yui.config) -> +yui.YUI",
        "prototype": {
          "use": {
            "!type": "fn(modules: string, callback?: fn(Y: ?)) -> !this",
            "!effects": ["custom yui_use"],
            "!data": {
              "!lint": "yui_use_lint"  
            }
          },
          "applyConfig": {
            "!type": "fn(o: +yui.config)",          
          }
        },
        "applyConfig": {
          "!type": "fn(o: +yui.config)",          
        },
        "GlobalConfig": {
          "!type": "+yui.config"
        }
      }
    },
    "node": {
      "Node": {
        "prototype": {
          "on": {
            "!type": "fn(type: string, fn: fn(e: +event.DOMEventFacade), context?: ?, arg?: ?) -> +event_custom.EventHandle"
          }
        }
      }
    }
  }
  
  var getType = function(moduleName, className, methodName, isProtoType) {
    var base = getBase(moduleName, className, methodName, isProtoType);
    if (base) return base["!type"];
  }

  var getEffects = function(moduleName, className, methodName, isProtoType) {
    var base = getBase(moduleName, className, methodName, isProtoType);
    if (base) return base["!effects"];
  }
  
  var getData = function(moduleName, className, methodName, isProtoType) {
    var base = getBase(moduleName, className, methodName, isProtoType);
    if (base) return base["!data"];
  }
  
  var getBase = function(moduleName, className, methodName, isProtoType) {
    var mod = overrideDef[moduleName];
    if (!mod) return null;
    var base = className ? mod[className]: mod;
    if (!methodName) return base;
    if (base) {
      if (isProtoType) base = base["prototype"]; 
      return base ? base[methodName] : null;
    }
  }
  
});  