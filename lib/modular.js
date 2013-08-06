var fs = require('fs'),
    UglifyJS = require('uglify-js'),
    CoffeeScript = require('coffee-script'),
    log = require('../util/debug').log('Modular');
    log2 = require('../util/debug').log('Modular', 2);

var regex = {
  extension: /\.[0-9a-zA-Z]+$/,
  endSlash: /\/$/
}

function removeFileExtension(fileName) {
  return fileName.replace(regex.extension, '');
}

function getFileExtension(fileName) {
  var match = fileName.match(regex.extension);
  if (match === null) {
    throw 'file ' + fileName + ' has no extension';
  }
  return match.pop().replace(/^\./, '');
}

function realFolderPath(folderPath) {
  return folderPath.replace(regex.endSlash, '') + '/';
}

function watch(path, callback) {
  fs.watch(path, {interval: 1000}, callback);
}

function deepWatch(folder, callback) {
  folder = realFolderPath(folder);
  watch(folder, function watchListener(eventName, fileName) {
    callback(eventName, folder + fileName);
  });
  var files, file, index;
  files = fs.readdirSync(folder);
  files.forEach(function(file, index) {
    if (fs.statSync(folder + file).isDirectory()) {
      deepWatch(folder + file, callback);
    }
  })
}

var Modular = new Object;

Modular.option = {
  root: './',
  output: './',
  file: 'application.js',
  compress: false,
  extensions: ['js', 'coffee'],
  watch: false
}

Modular.client = __dirname + '/client.js';
Modular.modules = [];
Modular.cache = '';

Modular.set = function(name, value) {
  if (Modular.set[name]) {
    return Modular.set[name](value);
  }
  Modular.option[name] = value;
  return Modular;
}

Modular.set.file = function(name) {
  name = name.split('.');
  var ext = name.pop();
  if (Modular.option.extensions.indexOf(ext) === -1) {
    name.push(ext);
  }
  name.push('js');
  name = name.join('.');
  Modular.option.file = name;
  return Modular;
}

Modular.set.root = function(path) {
  path = realFolderPath(path);
  Modular.option.root = path;
  return Modular;
}

Modular.set.output = function(path) {
  path = realFolderPath(path);
  Modular.option.output = path;
  return Modular;
}

Modular.set.watch = function() {
  Modular.option.watch = true;
  return Modular;
}

/* bundle modules */
Modular.build = function(buildListener) {
  Modular.cleanBuild();
  Modular.listModules(Modular.option.root);
  Modular.loadClient(Modular.client);
  Modular.loadModules(Modular.modules);
  buildListener(Modular.cache);
}

/* reset all the data before build */
Modular.rebuild = function() {
  Modular.reset();
  Modular.build(function(result) {
    Modular.writeBuild(result);
  });
}

/* reset loaded data */
Modular.reset = function() {
  Modular.cleanCache();
  Modular.cleanModules();
}

/* reset cache to empty */
Modular.cleanCache = function() {
  Modular.cache = '';
}

/* reset modules to an empty array */
Modular.cleanModules = function() {
  Modular.modules = [];
}

Modular.isModule = function(file) {
  var match, extension;
  match = file.match(regex.extension);
  if (match === null) {
    return false;
  }
  extension = getFileExtension(file);
  return ~Modular.option.extensions.indexOf(extension);
}

/* watch root and trigger the callback when module files changed */
Modular.watch = function(callback) {
  deepWatch(Modular.option.root, function deepWatchListener(eventName, filePath) {
    /* ignore none module files change */
    if (!Modular.isModule(filePath)) {
      return;
    }
    /* ignore build file change */
    if (Modular.option.root + Modular.option.file === filePath) {
      return;
    }
    callback(eventName, filePath);
  });
}

/* remove build package before list modules */
Modular.cleanBuild = function() {
  var build = Modular.option.output + Modular.option.file;
  if (fs.existsSync(build)) {
    fs.unlinkSync(build);
  }
}

/* load client library into cache */
Modular.loadClient = function(client) {
  Modular.cache += fs.readFileSync(client, 'utf8');
}

/* load modules into cache */
Modular.loadModules = function(modules) {
  for (var i in modules) {
    var path = modules[i];
    var ext = path.split('.').pop();
    var code;
    if (ext === 'coffee') {
      code = Modular.loadCoffee(path);
    } else {
      code = Modular.loadJS(path);
    }
    Modular.cache += Modular.wrapModule(path, code);    
  }
}

Modular.loadCoffee = function(path) {
  var code = fs.readFileSync(path, 'utf8');
  return CoffeeScript.compile(code);
}

Modular.loadJS = function(path) {
  return fs.readFileSync(path, 'utf8');
}

/* write build into the file system */
Modular.writeBuild = function(content, writeBuildListener) {
  if (typeof writeBuildListener === 'undefined') {
    writeBuildListener = function() {}
  }
  var minify, file;
  if (Modular.option.compress) {
    minify = UglifyJS.minify(content, {
      fromString: true,
      mangle: true
    })
    content = minify.code
  }
  file = Modular.option.output + Modular.option.file;
  fs.writeFile(file, content, function(err) {
    if (err) {
      throw err;
      return writeBuildListener(false);
    }
    log2('build', file);
    writeBuildListener(true);
  });
}

/* wrap the code of a module */
Modular.wrapModule = function(path, code) {
  // make relative into absolute path
  path = '/' + path.replace(Modular.option.root, '');
  // pop extension
  path = path.split('.');
  path.pop();
  path = path.join('.');
  var wrap = "\n";
  wrap += "define('" + path + "'";
  wrap += ', function(exports, require, module) {' + "\n" + code + '});';
  wrap += "\n";
  return wrap;
}

/* list out modules from a directory */
Modular.listModules = function(directory) {
  directory = directory.replace(/\/$/, '');
  var files = fs.readdirSync(directory);
  var modules = Modular.selectModules(files);
  modules.forEach(function(module) {
    Modular.modules.push(directory + '/' + module);
  })
  Modular.detectDirectory(directory, files);
}

/* recursively read directories */
Modular.detectDirectory = function(directory, files) {
  files.forEach(function(file) {
    var path = directory + '/' + file;
    var stat = fs.statSync(path);
    if (stat.isDirectory()) Modular.listModules(path);
  })
}

/* pick out modules from files */
Modular.selectModules = function(files) {
  var modules = [];
  files.forEach(function(file) {
    var ext = file.split('.').pop();
    if (~Modular.option.extensions.indexOf(ext)) modules.push(file);
  });
  return modules;
}


module.exports = exports = Object.create(Modular);

exports.build = function(path) {
  if (typeof path !== 'undefined') {
    Modular.set('root', path);
  }

  Modular.build(function(result) {
    Modular.writeBuild(result);
  })

  if (Modular.option.watch) {
    Modular.watch(function() {
      Modular.rebuild();
    })
  }
}
