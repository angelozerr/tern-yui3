var util = require("./util"), assert = require('assert');

var yuiDef = util.generateDef();

// Test with http://yuilibrary.com/yui/docs/api/classes/Anim.html

exports['test admin.Anim'] = function() {
  var Anim = yuiDef["!define"]["anim"]["Anim"];
  assert.notEqual(Anim, null, 'cannot find anim.Anim');
  assert.equal(Anim["!type"], "fn()");
  // extends Base
  assert.equal(Anim["prototype"]["!proto"], "base.Base.prototype");
}

exports['test app.App'] = function() {
  var App = yuiDef["!define"]["app"]["App"];
  assert.notEqual(App, null, 'cannot find app.App');
  assert.equal(App["!type"], "fn(config?: +config.AppConfig)");
  // extends Base
  assert.equal(App["prototype"]["!proto"], "app.App.Base.prototype");
  // showContent
  var Content = App["Content"]
  assert.notEqual(Content, null, 'cannot find App.Content');
  // Test with callback of showContent
  assert.equal(Content["prototype"]["showContent"]["!type"], "fn(content: +HTMLElement, options?: +yui.Object, callback?: fn(view: +app.View)) -> !this");
}

exports['test test.EventTarget'] = function() {
  var EventTarget = yuiDef["!define"]["test"]["Test"]["EventTarget"];
  assert.notEqual(EventTarget, null, 'cannot find Test.EventTarget');
  assert.equal(EventTarget["!type"], "fn()");
}

if (module == require.main) require("test").run(exports);