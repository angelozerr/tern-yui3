(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        return mod(require("tern/lib/infer"), require("tern/lib/tern"));
    if (typeof define == "function" && define.amd) // AMD
        return define([ "tern/lib/infer", "tern/lib/tern" ], mod);
    mod(tern, tern);
})(function(infer, tern) {
    "use strict";
    
  function getModule(data, name) {   
    return data.modules[name] || (data.modules[name] = new infer.AVal);
  }
  
  function findModule(data, name) {   
    return data.modules[name];
  }
  
  function copyModules(modules, Y) {
    for (var name in modules) {
      copyModule(modules[name], Y);	  
    }
  }
  
  function copyModule(module, Y) {
    var type = module.getType();
    var yuiType = type.hasProp('A');
    var from  = yuiType ? yuiType : type;  
    from.forAllProps(function(prop, val, local) {
      if (local && prop != "<i>") {
        var t = new infer.PropHasSubset(prop, val);
        t.origin = from.origin;
        Y.propagate(t);
      }
    });	
  }  
  
  function injectModules(Y, name) {
    var cx = infer.cx(), server = cx.parent, data = server._yui;
    if (name == '*') {
      // inject local YUI modules
      var defs = cx.definitions["yui3"];
      copyModules(defs, Y);
      // inject contributed modules (like AUI)
      copyModules(data.modules, Y);      
    } else {
        var module = findModule(data, name);
    }
  }
      
  function getFnIndex(argNodes) {
    for ( var i = 0; i < argNodes.length; i++) if (argNodes[i].type == "FunctionExpression") return i;
  }

  infer.registerFunction("yui_use", function(self, args, argNodes) {
    var yui = self.getType();
    if (yui && argNodes) {
      var index = getFnIndex(argNodes);
      if (index) {
        var fn = args[index];
        if (fn.argNames  && fn.argNames.length > 0) {              
          // Inject local and contributed modules.
          var Y = fn.args[0];
          injectModules(Y, '*');
          
          for ( var i = 0; i < argNodes.length - 1; i++) {
            var node = argNodes[i];
            if (node.type == "Literal" && typeof node.value == "string") {
              injectModules(Y, node.value);
            } else if (node.type == "ArrayExpression") for (var i = 0; i < node.elements.length; ++i) {
              var elt = node.elements[i];
              if (elt.type == "Literal" && typeof elt.value == "string") {
                injectModules(Y, elt.value);
              }
            }
          }
        }        
      }
    }
  });
  
  tern.registerPlugin("yui3", function(server, options) {
    server._yui = {
      modules: Object.create(null)		
    };
    
    server.on("reset", function() {
	  this._yui.modules = Object.create(null);      
	});
    
    return {defs: defs,
        passes: {postLoadDef: postLoadDef}};
  });        
	  
  function postLoadDef(data) {
    var cx = infer.cx(), mods = cx.definitions[data["!name"]]["!yui"];
    var data = cx.parent._yui;
    if (mods) for (var name in mods.props) {
      var origin = name.replace(/`/g, ".");
      var mod = getModule(data, origin);
      mod.origin = origin;
      mods.props[name].propagate(mod);
    }
  }
  
  var defs = '!def';
    
})