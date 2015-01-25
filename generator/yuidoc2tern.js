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
      "!define" : {}
    };
    this.options.initialize(ternDef);
    this.visitDoc(yuiDoc, ternDef);
    return ternDef;
  };

  Generator.prototype.visitDoc = function(yuiDoc, ternDef) { 
    // Iterate over all class items
    for ( var i = 0; i < yuiDoc.classitems.length; i++) {
      var yuiClassItem = yuiDoc.classitems[i];
      if (isAccess(yuiClassItem)) {
    	if (isEventType(yuiClassItem)) {
    		// TODO : add event inside !data
    	} else {
          var moduleName = getModuleName(yuiClassItem, yuiDoc), className = yuiClassItem["class"], isStatic = yuiClassItem["static"] === 1;
    	  if (moduleName) {
    	    var ternModule = getTernModule(moduleName, ternDef, this.options.isSubModule);
    	    var ternClass = this.getTernClass(className, ternModule, yuiDoc);
    	    var ternClassItem = ternClass;
    	    if (!isStatic) {
    	      ternClassItem = getTernClassPrototype(ternClass, moduleName, className);
    	    }
    	    this.visitClassItem(yuiClassItem, yuiDoc, ternClassItem);
    	  }
    	}
      }
    }
  }
  
  Generator.prototype.visitClassItem = function(yuiClassItem, yuiDoc, ternClassItem) {
	var moduleName = getModuleName(yuiClassItem, yuiDoc), className = yuiClassItem["class"], name = yuiClassItem["name"];	
    // !type
	var type = this.getTernType(yuiClassItem, yuiDoc, moduleName, className, name); 
    // !proto
    var proto = null;
    var effects = this.options.getEffects ? this.options.getEffects(moduleName, className, name) : null;
    // !doc
    var doc = getDescription(yuiClassItem);
    // !url
    var url = this.options.baseURL ? getURL(this.options.baseURL, className, yuiClassItem.itemtype, name) : null;
    createTernDefItem(ternClassItem, name, type, proto, effects, url, doc);	
  }
  
  Generator.prototype.getTernType = function(yuiClass, yuiDoc) {
	var moduleName = getModuleName(yuiClass, yuiDoc), className = yuiClass["class"], name = yuiClass["name"];	
	var overridedType = this.options.getType ? this.options.getType(moduleName, className, name) : null;
	if (overridedType) return overridedType;
	return getTernType(yuiClass, yuiDoc, this.options.isSubModule);
  }
  
  Generator.prototype.getTernClass = function(className, parent, yuiDoc) {
	// get name
    var name = className;
    if (className.indexOf('.') != -1) {
      var names = className.split('.'), length = names.length -1;
      for (var i = 0; i < length; i++) {
        parent = this.getTernClass(names[i], parent, yuiDoc);
      }
      name = names[length];
    }
    
    var ternClass = parent[name];
    if (!ternClass) {
      var yuiClass = yuiDoc.classes[className], type, proto, effects, doc, url;
      if (yuiClass) {
        // !type
        type = this.getTernType(yuiClass, yuiDoc);      
        // !proto
        proto = this.getProto(yuiClass, yuiDoc);
        effects = null;
        // !doc
        doc = null;
        // if (yuiClass.description)
          //  ternClass["!doc"] = yuiClass.description;
        // !url
        url = this.options.baseURL ? getURL(this.options.baseURL, className) : null;
      }
      ternClass = createTernDefItem(parent, name, type, proto, effects, url, doc);
    }    
    return ternClass;
  }
  
  var getTernClassPrototype = function(ternClass, moduleName, className) {
    var ternPrototype = ternClass["prototype"];
    if (!ternPrototype) {
      ternPrototype = {};
      ternClass["prototype"] = ternPrototype;
    }    
    return ternPrototype;
  }  
  
  var isAccess = function(yuiClassItem) {
    var access = yuiClassItem["access"];
    return access != 'private' && access != 'protected';
  }
  
  var isEventType = function(yuiClassItem) {
    var itemtype = yuiClassItem["itemtype"];
    return itemtype === 'event';  
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
  
  var getTernModule = function(moduleName, ternDef, isSubModule) {
    // YUI module uses '-' in their name, and tern cannot support that, replace '-' with '_'
    var name = moduleName.replace(/-/g, '_');
    var parent = ternDef["!define"];
    if (isSubModule) {
    	var sub = parent["_yui"];
    	if (!sub) sub = parent["_yui"] = {};
    	parent = sub;
    }    
    var ternModule = parent[name];
    if (!ternModule) ternModule = parent[name]= {};
    // TODO : add !data to set the real module name + submodules
    return ternModule;
  }
  
  var createTernDefItem = function(parent, name, type, proto, effects, url, doc) {
    var item = parent[name] = {};
    if (type) item["!type"] = type;    
    if (url) item["!url"] = url;
    if (doc && doc != '') item["!doc"] = doc;
    if (proto) getTernClassPrototype(item)["!proto"] = proto;
    if (effects) item["!effects"] = effects;
    return item;
  }
  
  // YUI -> Tern type
  
  var startsWith = function (str, prefix) {
    return str.slice(0, prefix.length) == prefix;
  }
  
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
    var index = -1;
    
    // ex : {ArrayList|Widget} or {Any}
	if (startsWith(yuiType, '{')) {
		index = yuiType.indexOf('}');
		yuiType = yuiType.substring(1, index != -1 ? index : yuiType.length);
		yuiType = yuiType.trim();
	}    
    // ex : Node|String
    yuiType = getFirstPart(yuiType, '|');    
    // ex : Node/NodeList
    yuiType = getFirstPart(yuiType, '/');
    // ex : {string: boolean}
    yuiType = getFirstPart(yuiType, ':');
    // ex : Object*
    yuiType = yuiType.replace(/[*]/g, '');
    return yuiType != 'null' ? yuiType : null;
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
          type += getPropertyTernType(param.type, param.props, yuiDoc, isSubModule);
        } else {
            type += '?';	
        }
      }
    }
    type += ')';
    if (isChainable) {
      type += ' -> !this';
    } else if (isConstructor) {
      type += ' -> +';
      type += getClassName(className, yuiDoc, isSubModule);
    } else if (returnValue) {
      type += ' -> ';
      type += getPropertyTernType(returnValue.type, returnValue.props, yuiDoc);
    }
    return type;	  
  }

  var getPropertyTernType = exports.getPropertyTernType = function(yuiType, props, yuiDoc, isSubModule) {
    var type = extractYUIType(yuiType);
    if (!type) return "?";

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
    case 'string':
      return formatType('string', isArray);
    case 'number':
    case 'int': 
    case 'num':
    case 'float':    	
      return formatType('number', isArray);
    case 'boolean':
      return formatType('bool', isArray);
    default:
      return formatType(getClassName(type, yuiDoc, isSubModule), isArray, true);
    }    
  }

  var getModuleName = function(yuiClassItem, yuiDoc) {
	  var className = yuiClassItem["class"];
	  var yuiClass = yuiDoc.classes[className];
	  var moduleName = yuiClass ? yuiClass["module"] : yuiClassItem["module"];
	  return moduleName.replace(/-/g, '_');
  }
  
  var getClassName = function(className, yuiDoc, isSubModule) {
    var yuiClass = yuiDoc.classes[className];
    if (yuiClass && yuiClass.module) {
      var name = isSubModule ? '_yui.' : '';
      name += yuiClass.module.replace(/-/g, '_') + '.' + className;
      return name;
    }
    return className;
  } 
  
  Generator.prototype.getProto = function(yuiClassItem, yuiDoc) {
    var yuiExtends = yuiClassItem["extends"];
    if (!yuiExtends) {
	  return this.options.getProto ? this.options.getProto() : null;
    }
    var className = getClassName(yuiExtends, yuiDoc, this.options.isSubModule)
    return className + '.prototype';
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

  function endsWith(str, suffix) {
    return str.slice(-suffix.length) == suffix;
  }  
    
});  