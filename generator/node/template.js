(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        return mod(require("tern/lib/infer"), require("tern/lib/tern"));
    if (typeof define == "function" && define.amd) // AMD
        return define([ "tern/lib/infer", "tern/lib/tern" ], mod);
    mod(tern, tern);
})(function(infer, tern) {
    "use strict";
    
  function emptyObj(ctor) {
    var empty = Object.create(ctor.prototype);
    empty.props = Object.create(null);
    //empty.isShell = true;
    return empty;
  }
  
  function getModule(data, name) {
    return data.modules[name] || (data.modules[name] = emptyObj(infer.Obj));
  }
  
  function getSubModule(data, name) {   
    return data.submodules[name] || (data.submodules[name] = new infer.AVal);
  }
  
  function findModule(data, name) {   
    return data.modules[name];
  }
  
  function copyModules(modules, Y) {
    for (var name in modules) {
      copyModule(modules[name], Y);	  
    }
  }
  
  function copyModule(mod, Y) {
    var from = mod.getType();
    if (!from) return; // Unknown module
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
      // inject local (YUI3) and contributed (AlloyUI) YUI modules
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
          var cx = infer.cx(), paths = cx.paths;
          // Create instance of YUI because fn(modules: string, callback?: fn(Y: +yui.YUI)) -> !this support only signatures with one module
          // see https://github.com/angelozerr/tern-yui3/issues/12
          var Y = new infer.Obj(paths["yui.YUI"].getProp("prototype").getObjType());
          var deps = [];
          deps[0] = Y.getType();
          fn.getType().propagate(new infer.IsCallee(infer.cx().topScope, deps, null, infer.Null))
          
          // Inject local and contributed modules.
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
  
  function registerLints() {
    if (!tern.registerLint) return;
    
    // validate existing modules for YUI().use(' 
    tern.registerLint("yui_use_lint", function(node, addMessage, getRule) {
      var rule = getRule("UnknownModule");
      if (rule && node.arguments) {
        var cx = infer.cx(), server = cx.parent, mods = server._yui.modules, submods = server._yui.submodules;
        for (var i = 0; i < node.arguments.length; i++) {
          var argNode = node.arguments[i];
          if (argNode.type == "Literal" && typeof argNode.value == "string") {
            var name = argNode.value;
            // check the module name exists for locals (YUI3) and custom (ex : AlloyUI) modules
            if (!mods[name] && !submods[name]) addMessage(argNode, "Unknown module '" + name + "'", rule.severity);
          } else {
            // the node is not a literal string, check if it's the last parameter which is a function type
            if (!(i == (node.arguments.length - 1) && argNode.type == "FunctionExpression")) addMessage(argNode, "Expected string type for YUI module", rule.severity);            
          }
        }
      }      
    });
    
  }

  tern.registerPlugin("yui3", function(server, options) {
    registerLints();
    server._yui = {
      modules: Object.create(null),
      submodules: Object.create(null)
    };
    
    server.on("reset", function() {
	  this._yui.modules = Object.create(null);
	  this._yui.submodules = Object.create(null); 
	});
    
    return {defs: defs,
      passes: {preLoadDef: preLoadDef,
               postLoadDef: postLoadDef,
               completion: findCompletions}};
  });
    
  function preLoadDef(data) {
    var cx = infer.cx(), localDefs = cx.localDefs;
    if (cx.definitions["yui3"] && data["!define"] && data["!define"]["_yui"]) {
      // set yui3 as local defs for AlloyUI tern plugin
      cx.localDefs["yui3"] = cx.definitions["yui3"];
    }
  }        
	
  function findClassByPath(paths, props, props2) {
    var clazz = null;
    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];
      clazz = props[path] ? props[path] : props2[path];
      if (clazz) props = clazz.getType().props; else break;     
    }
    return clazz;
  }
  
  function postLoadDef(data) {
    var cx = infer.cx(), defName = data["!name"], mods = null;
    if (defName == "yui3") mods = cx.definitions[defName];
    else if (cx.definitions[defName]["_yui"]) mods = cx.definitions[defName]["_yui"].props;
    var _yui = cx.parent._yui;
    if (mods) for (var name in mods) {
      
      // loop for YUI modules
      var mod = mods[name].getType()
      if (mod && mod.name != 'config') {      
        var name = (mod.metaData && mod.metaData.module) ? mod.metaData.module : name, 
            submodules = (mod.metaData && mod.metaData.submodules) ? mod.metaData.submodules : null, 
            modToPropagate = getModule(_yui, name);
        if (!modToPropagate.origin) modToPropagate.origin = defName;
        
        // for AlloyUI, module is declared inside A
        var a = mod.hasProp("A");
        if (a) mod = a.getType();
        
        // Loop for YUI classes of the current module
        for(var className in mod.props) {
          var clazz = mod.props[className].getType(), metaData = clazz.metaData, 
              forClass = (metaData && metaData["for"]), augments = (metaData && metaData["augments"]), exts = (metaData && metaData["extends"]);
          if (!forClass) {
            var t = new infer.PropHasSubset(className, clazz);
            t.origin = clazz.origin;
            modToPropagate.propagate(t);                       
          } else {
            var classToUpdate = findClassByPath(forClass.split("."), mods, _yui.modules);
            if (classToUpdate) mix(clazz, classToUpdate.getType());
          }
          if (augments) mixall(augments, clazz, mods,  _yui.modules, true);
          if (exts) mixall(exts, clazz, mods,  _yui.modules, false);
        }
        
        // update submodules
        if (submodules) for(var subname in submodules) {
          var submodule = getSubModule(_yui, subname);
          submodule.origin = defName;
        }
      }
    }
  }
  
  function mixall(froms, to, mods, mods2, augments) {
    // update classes with extends or augments
    for (var i = 0; i < froms.length; i++) {
      var useClass = findClassByPath(froms[i].split("."), mods, mods2);
      if (useClass) {
        if (!augments) mix(useClass.getType(), to); else mix(to, useClass.getType());
      }
    }    
  }
  
  function mix(from, to) {
    from.forAllProps(function(prop, val, local) {
      if (local && prop != "<i>") {
        if (prop == "prototype") {          
          var fromProto = val.getType();
          var toProto = to.hasProp("prototype") && to.hasProp("prototype").getType() ? to.hasProp("prototype").getType() : null;
          if (toProto) mix(fromProto, toProto);          
        } else {
          var t = new infer.PropHasSubset(prop, val);
          t.origin = from.origin;
          to.propagate(t);  
        }
      }
    });
  }
  
  function findCompletions(file, query) {
    var wordEnd = tern.resolvePos(file, query.end);
    var callExpr = infer.findExpressionAround(file.ast, null, wordEnd, file.scope, "CallExpression");
    if (!callExpr) return;
    var callNode = callExpr.node;
    if (!callNode.callee.object || !callNode.callee.object.callee || !(callNode.callee.object.callee.name === "YUI" || callNode.callee.object.callee.name === "AUI") ||
        callNode.callee.type != "MemberExpression" || !callNode.callee.property || callNode.callee.property.name != "use" ||
        callNode.arguments.length < 1) return;
    // here completion for modules YUI().use('Ctrl+Space'
    var argNode = findNodeModule(callNode.arguments, wordEnd);
    if (!argNode) return;
    var word = argNode.raw.slice(1, wordEnd - argNode.start), quote = argNode.raw.charAt(0);
    if (word && word.charAt(word.length - 1) == quote)
      word = word.slice(0, word.length - 1);
    var completions = completeModuleName(query, file, word);
    if (argNode.end == wordEnd + 1 && file.text.charAt(wordEnd) == quote)
      ++wordEnd;
    return {
      start: tern.outputPos(query, file, argNode.start),
      end: tern.outputPos(query, file, wordEnd),
      isProperty: false,
      isObjectKey: false,
      completions: completions.map(function(rec) {
        var name = typeof rec == "string" ? rec : rec.name;
        var string = JSON.stringify(name);
        if (quote == "'") string = quote + string.slice(1, string.length -1).replace(/'/g, "\\'") + quote;
        if (typeof rec == "string") return string;
        rec.displayName = name;
        rec.name = string;
        return rec;
      })
    };
  }
  
  function findNodeModule(argsNode, wordEnd) {
    for (var i = 0; i < argsNode.length; i++) {
      var argNode = argsNode[i];
      if (argNode.type == "Literal" && typeof argNode.value == "string" &&
          argNode.start < wordEnd && argNode.end > wordEnd) return argNode;
    }
  }
  
  function completeModuleName(query, file, word) {
    var completions = [];
    var cx = infer.cx(), server = cx.parent, modules = server._yui.modules, submodules = server._yui.submodules;
    var wrapAsObjs = query.types || query.depths || query.docs || query.urls || query.origins;

    function maybeSet(obj, prop, val) {
      if (val != null) obj[prop] = val;
    }
    
    function gather(modules, isSubModule) {
      for (var name in modules) {
        
        var moduleName = name;
        if (moduleName &&
            !(query.filter !== false && word &&
              (query.caseInsensitive ? moduleName.toLowerCase() : moduleName).indexOf(word) !== 0)) {
          var rec = wrapAsObjs ? {name: moduleName} : moduleName;
          completions.push(rec);

          if (query.types || query.docs || query.urls || query.origins) {
            var val = modules[name];          
            if (query.types)
              rec.type = isSubModule ? "submodule" : "module";
            if (query.docs)
              maybeSet(rec, "doc", val.doc);
            if (query.urls)
              maybeSet(rec, "url", val.url);
            if (query.origins)
              maybeSet(rec, "origin", val.origin);
          }
        }
      }
    }

    if (query.caseInsensitive) word = word.toLowerCase();
    gather(modules, false);
    gather(submodules, true);
    return completions;
  }
  
  var defs = '!def';
    
})