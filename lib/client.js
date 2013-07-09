(function(exports) {

  _isEmpty = function(obj) {
    if (obj == null || obj === undefined) return true;
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) return false;
    }
    return true;
  }

  _getFolder = function(path) {
    var split = path.split('/');
    split.pop();
    return split.join('/') + '/';
  }

  function Modular() {}

  Modular.modules = {}

  Modular.define = function(path, module) {
    Modular.modules[path] = module;
  }

  Modular.initRequire = function(basepath) {
    function require(path) {
      path = basepath + path;
      var folder = _getFolder(path);
      var code = Modular.modules[path];
      if ( code === undefined) {
        throw 'cannot find module ' + path;
      }
      var module = {};
      var exports = module.exports = {};
      var require = Modular.initRequire(folder);
      code.call({}, exports, require, module);
      if (_isEmpty(module.exports)) {
        module.exports = undefined;
      }
      return module.exports;
    }
    return require;
  }

  exports.define = Modular.define;
  exports.require = Modular.initRequire('/');

})(this);
