(function(root, mod) {
    if (typeof exports == "object" && typeof module == "object") return mod(exports); // CommonJS
    if (typeof define == "function" && define.amd) return define([ "exports" ], mod); // AMD
    mod(root.yuidoc2tern || (root.yuidoc2tern = {})); // Plain browser env
})(this,function(exports) {
  "use strict";
  
  var Generator = exports.Generator = function(options) {
    this.options = options;
  };
  
  Generator.prototype.process = function(yuiDoc) {
    var ternDef = {
      "!name" : this.options.name,
      "!define" : {
        "config": {}
      }
    };
    this.options.initialize(ternDef);
    this.visitDoc(yuiDoc, ternDef);
    return ternDef;
  };

  Generator.prototype.visitDoc = function(yuiDoc, ternDef) { 
    // Iterate over all class items
    for ( var i = 0; i < yuiDoc.classitems.length; i++) {
      var yuiClassItem = yuiDoc.classitems[i];
      if (!this.isIgnoreClassItem(yuiClassItem) && isAccess(yuiClassItem, this.options.isSubModule)) {
    	if (isEventType(yuiClassItem)) {
    		// TODO : add event inside !data
    	} else {
          var moduleName = getModuleName(yuiClassItem, yuiDoc, true), className = yuiClassItem["class"], attributeType = isAttributeType(yuiClassItem), 
              isStaticMethod = (isStatic(yuiClassItem) || attributeType);
          // case of DataTable.BodyView.Formatters which is a Class and object property
          var isObjectAndClassBoth = (yuiClassItem["type"] == "Object") && yuiClassItem["itemtype"] == "property" && yuiDoc.classes[className + "."  + yuiClassItem["name"]];
          if (isObjectAndClassBoth) className = className + "."  + yuiClassItem["name"];
    	  if (moduleName) {
    	    var ternModule = getTernModule(moduleName, ternDef, this.options.isSubModule, yuiDoc);
    	    var ternClass = null;
    	    if (isGlobal(yuiClassItem)) {
    	      ternClass = ternDef;
    	    } else {
    	      ternClass = attributeType ? this.getTernClassConfig(className, ternDef["!define"], yuiDoc) :
    	        this.getTernClass(className, ternModule, moduleName.replace(/-/g, '_'), yuiDoc);
    	    }    	                                    
    	    if (!isObjectAndClassBoth) {
              var ternClassItem = isStaticMethod ? ternClass : getTernClassPrototype(ternClass);
              this.visitClassItem(yuiClassItem, yuiDoc, ternClassItem);
            }	    
    	  }
    	}
      }
    }
  }
  
  function isGlobal(yuiClassItem) {
    return yuiClassItem.name == "YUI_config";
  }
  
  Generator.prototype.isIgnoreClassItem = function(yuiClassItem) {    
    return this.options.isIgnoreClassItem ? this.options.isIgnoreClassItem(yuiClassItem) : false;
  }
  
  Generator.prototype.visitClassItem = function(yuiClassItem, yuiDoc, ternClassItem) {
	var moduleName = getModuleName(yuiClassItem, yuiDoc), className = yuiClassItem["class"], name = yuiClassItem["name"];	
    // !type
	var type = this.getTernType(yuiClassItem, yuiDoc); 
    // !proto
    var proto = null;
    var effects = this.options.getEffects ? this.options.getEffects(moduleName, className, name, !isStatic(yuiClassItem)) : null;
    // !doc
    var doc = getDescription(yuiClassItem);
    // !url
    var url = this.options.baseURL ? getURL(this.options.baseURL, className, yuiClassItem.itemtype, name) : null;
    // !data
    var submodule = yuiClassItem["submodule"];
    var data = this.options.getData ? this.options.getData(moduleName, className, name, !isStatic(yuiClassItem)) : null;
    if (submodule) {
      if (!data) data = {};
      data["submodule"] = submodule;
    }
    createTernDefItem(ternClassItem, name, type, proto, effects, url, doc, data);	
  }
  
  Generator.prototype.getTernType = function(yuiClass, yuiDoc) {
	var moduleName = getModuleName(yuiClass, yuiDoc), className = yuiClass["class"] ? yuiClass["class"] : yuiClass["name"], name = yuiClass["class"] ? yuiClass["name"] : null;	
	var overridedType = this.options.getType ? this.options.getType(moduleName, className, name, !isStatic(yuiClass)) : null;
	if (overridedType) return overridedType;
	return getTernType(yuiClass, yuiDoc, this.options.isSubModule);
  }
  
  Generator.prototype.getTernClass = function(className, parent, moduleName, yuiDoc, fullClassName) {
	// get name
    var name = className;
    if (className.indexOf('.') != -1) {
      var names = className.split('.'), length = names.length -1;
      var locFullClassName = "";
      for (var i = 0; i < length; i++) {
        if (i > 0) locFullClassName+=".";
        locFullClassName+=names[i];
        parent = this.getTernClass(names[i], parent, moduleName, yuiDoc, locFullClassName);
      }
      name = names[length];
    }
    
    var ternClass = parent[name];
    if (!ternClass) {
      var yuiClass = fullClassName ? yuiDoc.classes[fullClassName] : yuiDoc.classes[className], type, proto, effects, doc, url, data;
      if (!yuiClass) yuiClass = yuiDoc.classes[className]
      if (yuiClass) {      
        // !proto
        proto = this.getProto(yuiClass, yuiDoc, true);
        effects = null;
        // !doc
        doc = null;
        // if (yuiClass.description)
          //  ternClass["!doc"] = yuiClass.description;
        // !url
        url = this.options.baseURL ? getURL(this.options.baseURL, className) : null;
        var uses = yuiClass["uses"], forClass = this.getForClass(className, moduleName, yuiDoc), augments = [], exts = [];
        if (!forClass) {
          // !type
          type = this.getTernType(yuiClass, yuiDoc);
        }
        if (uses) {
          for (var i = 0; i < uses.length; i++) {
            var useClassName = uses[i], useFullClassName = getClassName(useClassName, yuiDoc, this.options.isSubModule);
            if (useFullClassName && useFullClassName != forClass) {
              if (isExtensionFor(useClassName, className, yuiDoc)) {
                exts.push(useFullClassName);
              } else {
                augments.push(useFullClassName);
              }
            }
          }                    
        } 
        if (augments.length > 0 || exts.length > 0 || forClass) {
          data = {};
          if (augments.length > 0) data["augments"] = augments;
          if (exts.length > 0) data["extends"] = exts;
          if (forClass) data["for"] = forClass;
        }
      }
      ternClass = createTernDefItem(parent, name, type, proto, effects, url, doc, data);
    }    
    return ternClass;
  }
  
  Generator.prototype.getForClass = function(className, moduleName, yuiDoc) {
    var forCLass = this.options.getForClass ? this.options.getForClass(className) : null;
    if (forCLass) return forCLass;
    var yuiClass = yuiDoc.classes[className];
    var forClassModuleName = yuiClass ? yuiClass["module"] && yuiClass["module"].replace(/-/g, '_') : null;
    if (forClassModuleName && forClassModuleName != moduleName) return forClassModuleName + "." + className;
  }
  
  Generator.prototype.getTernClassConfig = function(className, parent, yuiDoc) {
    var names = getConfigType(className).split(".");
    var ternClass = parent;
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      ternClass = parent[name];
      if (!ternClass) ternClass = parent[name] = {};
      parent = ternClass;
    }
    var yuiClass = yuiDoc.classes[className];
    if (yuiClass) {
      var yuiExtends = yuiClass["extends"];
      if (yuiExtends) ternClass["!proto"] = getConfigType(yuiExtends);      
      /*var proto = this.getProto(yuiClass, yuiDoc);
      if (proto) {
        ternClass["!proto"] = getConfigType(proto);
      }*/
    }
    return ternClass;
  }
    
  var getTernClassPrototype = function(ternClass) {
    var ternPrototype = ternClass["prototype"];
    if (!ternPrototype) ternClass["prototype"] = ternPrototype = {};
    return ternPrototype;
  }  
  
  var isAccess = function(yuiClassItem, isSubModule) {
    if (isSubModule && yuiClassItem.file && (startsWith(yuiClassItem.file, "yui3") || startsWith(yuiClassItem.file, "lib/yui3"))) {
      return false;
    }
    var access = yuiClassItem["access"];
    return access != 'private' && access != 'protected';
  }
  
  var isStatic = function(yuiClassItem) {
    return yuiClassItem["static"] === 1 || "YUI_config" == yuiClassItem.name;
  }
  
  var isEventType = function(yuiClassItem) {
    var itemtype = yuiClassItem["itemtype"];
    return itemtype === 'event';  
  }
  
  var isAttributeType = function(yuiClassItem) {
    var itemtype = yuiClassItem["itemtype"];
    return itemtype === 'attribute';  
  }
  
  var isExtensionFor = function(useClassName, className, yuiDoc) {
    var clazz = yuiDoc.classes[useClassName], extension_for = clazz ? clazz.extension_for : null;
    if (extension_for) {
      for (var i = 0; i < extension_for.length; i++) {
        if (extension_for[i] == className) return true;
      }
    }
    return false;
  }
  
  var getDescription = function(yuiClassItem) {
	var description = yuiClassItem["description"];
	if (!description) return null;
	description = description.replace(/['$']/g, "");
	return description;
  }
  
  var getURL = function(baseURL, className, itemtype, name) {
    var url = baseURL;
    if (!endsWith(baseURL, '/')) {
      url += '/';
    }
    url += 'classes/';
    url += className;
    url += '.html';
    if (itemtype && name) {
      url += '#';
      url += itemtype;
      url += '_';
      url += name;
    }
    return url;
  }
  
  function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }
  
  var getTernModule = function(moduleName, ternDef, isSubModule, yuiDoc) {
    // YUI module uses '-' in their name, and tern cannot support that, replace '-' with '_'
    var name = moduleName.replace(/-/g, '_');
    var parent = ternDef["!define"];
    if (isSubModule) {
    	var sub = parent["_yui"];
    	if (!sub) sub = parent["_yui"] = {};
    	parent = sub;
    }    
    var ternModule = parent[name];
    if (!ternModule) {
      // create module
      ternModule = parent[name]= {};
      var data = {}, mods = yuiDoc.modules, mod = mods ? mods[moduleName] : null;      
      if (name != moduleName ) data["module"] =  moduleName;
      if (mod && mod.submodules) {
        var submodules = {};
        for(var submodule in mod.submodules) {
          submodules[submodule] = {};
        }
        if (!isEmpty(submodules)) {
          if (!data) data = {};
          data["submodules"] = submodules;
        }
      }
      if (!isEmpty(data)) ternModule["!data"] = data;
    }
    return ternModule;
  }
  
  var createTernDefItem = function(parent, name, type, proto, effects, url, doc, data) {
    var item = parent[name] = {};
    if (type) item["!type"] = type;
    if (effects) item["!effects"] = effects;
    if (url) item["!url"] = url;
    if (doc && doc != '') item["!doc"] = doc;
    if (data) item["!data"] = data;
    if (proto) getTernClassPrototype(item)["!proto"] = proto;
    return item;
  }
  
  // YUI -> Tern type
  
  var getFirstPart = function(yuiType, c) {
    var index = yuiType.indexOf(c);
	if (index != -1) {
	  yuiType = yuiType.substring(0, index);
	  yuiType = yuiType.trim();
	}
	return yuiType;
  }
  
  var extractYUIType = exports.extractYUIType= function(yuiType) {
    if (!yuiType) return null;
    //yuiType = yuiType.trim();
    var index = -1;
       
    if (startsWith(yuiType, '{')) {
      index = yuiType.indexOf('}');
      yuiType = yuiType.substring(1, index != -1 ? index : yuiType.length);
    }
    
    var yuiTypes = null;
    if (yuiType.indexOf("/") != -1) {
      yuiTypes = yuiType.split("/");
    } else {
      yuiTypes = yuiType.split("|");
    }
    var filterYuiTypes = [];
    for (var i = 0; i < yuiTypes.length; i++) {
      var t = yuiTypes[i].trim();
   // ex : {ArrayList|Widget} or {Any}
      if (startsWith(t, '{')) {
        index = t.indexOf('}');
        t = t.substring(1, index != -1 ? index : t.length);
      }
      // ex : Node|String
      //yuiType = getFirstPart(yuiType, '|');    
      // ex : Node/NodeList
      //yuiType = getFirstPart(yuiType, '/');
      // ex : {string: boolean}
      t = getFirstPart(t, ':');
      // ex : Object*
      t = t.replace(/[*]/g, '');
      t = t.trim();
      
      if (t != "null") filterYuiTypes.push(t);
    }
    return filterYuiTypes;
  }
  
  var getTernType = exports.getTernType = function(yuiClass, yuiDoc, isSubModule) {
	var itemtype = yuiClass["itemtype"];
	if (itemtype == 'config' && yuiClass.params) {
		// case for EventTarget which has params and itemtype=config (and type=Boolean)
		// we force it to method.
		itemtype = 'method'; 
	}
    switch(itemtype) {
      case 'method':
    	var className = yuiClass.name, params = yuiClass.params, returnValue = yuiClass["return"], isChainable = yuiClass["chainable"] === 1, isConstructor = yuiClass["is_constructor"] === 1;
        return getFunctionTernType(className, params, returnValue, isChainable, isConstructor, yuiDoc, isSubModule);
      break;
      case 'property':
      case 'attribute':  
    	var yuiType = yuiClass.type;
    	return getPropertyTernType(yuiType, null, yuiDoc);
      case 'event':
        break;
      case 'config':
    	var yuiType = yuiClass.type;
      	return getPropertyTernType(yuiType, null, yuiDoc);
      default:
      	var className = yuiClass.name, params = yuiClass.params, returnValue = yuiClass["return"], isChainable = yuiClass["chainable"] === 1, isConstructor = yuiClass["is_constructor"] === 1;
        return getFunctionTernType(className, params, returnValue, isChainable, isConstructor, yuiDoc, isSubModule);
    }	  
  }
  
  var getFunctionTernType = function(className, params, returnValue, isChainable, isConstructor, yuiDoc, isSubModule) {
    var type = 'fn(';
    if (params) {
      for ( var i = 0; i < params.length; i++) {
        var param = params[i], name = toTernName(param.name);
        if (i > 0)
          type += ', ';
        type += name;
        if (param.optional)
          type += '?';
        type += ': ';
        if (param.type) {
          if (param.name == 'config' && param.type == 'Object') {
            // case for config Object Literal (filled with attribute itemtype)
            type += "+" + getConfigType(className);
          } else {
            type += getPropertyTernType(param.type, param.props, yuiDoc, isSubModule); 
          }
        } else {
            type += '?';	
        }
      }
    }
    type += ')';
    if (isChainable) {
      type += ' -> !this';
    }
    /*else if (isConstructor) {
      type += ' -> +';
      type += getClassName(className, yuiDoc, isSubModule);
    }*/
     else if (returnValue) {
      type += ' -> ';
      type += getPropertyTernType(returnValue.type, returnValue.props, yuiDoc);
    }
    return type;	  
  }

  var getConfigType = function(className) {
    var index = className.lastIndexOf('.'), name = index !=- 1 ? className.substring(index+1, className.length) : className;
    return "config." + className + "Config";  
  }
  
  var getPropertyTernType = exports.getPropertyTernType = function(yuiType, props, yuiDoc, isSubModule) {
    if (!yuiType) return "?";
    var types = "", yuiTypes = extractYUIType(yuiType);
    if (yuiTypes) {      
      for (var i = 0; i < yuiTypes.length; i++) {
        var type = toTernType(yuiTypes[i], props, yuiDoc, isSubModule);
        if (type) {
         if (startsWith(type, "fn(")) return type;
         if (types.length > 0) types+= "|";
         types+= type;
        }
      }
    }
    return types.length > 0 ? types : "?";
  }
  
  function toTernType(type, props, yuiDoc, isSubModule) {
//    var type = extractYUIType(yuiType);
//    if (!type) return null;

    // is array?
    var isArray = false, index = type.indexOf('[');
    if (index > 0) {
      type = type.substring(0, index);
      isArray = true;
    }
    type = type.trim();
    switch (type.toLowerCase()) {
    case 'function':
      return getFunctionTernType(null, props, null, false, false, yuiDoc, isSubModule);
    case 'any':
      return '?';
    case 'null':
      return null;
    case 'string':
      return formatType('string', isArray);
    case 'number':
    case 'int': 
    case 'num':
    case 'float':       
      return formatType('number', isArray);
    case 'boolean':
    case 'false':
    case 'true':      
      return formatType('bool', isArray);
    default:
      return formatType(getClassName(type, yuiDoc, isSubModule), isArray, true);
    }
  }

  var getModuleName = function(yuiClassItem, yuiDoc, dontReplace) {
    //var className = yuiClassItem["class"];
    //var yuiClass = yuiDoc.classes[className];
    var moduleName = /*yuiClass ? yuiClass["module"] :*/ yuiClassItem["module"];
    return dontReplace ? moduleName : moduleName.replace(/-/g, '_');
  }
  
  var getClassName = function(className, yuiDoc, isSubModule) {
    var yuiClass = yuiDoc.classes[className];
    if (yuiClass && yuiClass.module) {
      var name = yuiClass.module.replace(/-/g, '_') + '.' + className;
      return name;
    }
    return className;
  } 
  
  Generator.prototype.getProto = function(yuiClassItem, yuiDoc, withPrototype) {
    var yuiExtends = yuiClassItem["extends"];
    if (!yuiExtends) {
	  return this.options.getProto ? this.options.getProto() : null;
    }
    var className = getClassName(yuiExtends, yuiDoc, this.options.isSubModule)
    return withPrototype ? (className + '.prototype') : className;
  }
  
  var toTernName = exports.toTernName = function(yuiName) {
    var name = yuiName;
    name = name.replace(/-/g, '');
    name = extractName(name, '*');
    name = extractName(name, ',');
    // ex : @param
    name = extractName(name, '@');
    // ex : prepend=false
    name = extractName(name, '=');
    // ex : +
    if (name == '+' || name.length == 0) return "arg";
	return name;
  }
  
  function extractName(name, c) {
    var index = name.indexOf(c);
    if (index == -1) return name;
    if (index == 0) return name.substring(1, name.length);
    return name.substring(0, index);
  }
  
  var formatType = function (type, isArray, isInstance) {
    var t = "";
    if (isArray) {
      t += '[';
    }
    if (isInstance && type != 'string' && type != 'bool' && type != 'number')
      t += '+';
    t += type;
    if (isArray) {
      t += ']';
    }
    return t;
  }

  var startsWith = function(str, prefix) {
    return str.slice(0, prefix.length) == prefix;
  }
  
  var endsWith = function(str, suffix) {
    return str.slice(-suffix.length) == suffix;
  }  
    
});  