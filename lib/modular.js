var fs = require('fs');
var Coffee = require('coffee-script');
var UglifyJS = require('uglify-js');

function log() {console.log.apply(console, arguments)}

var Modular = function() {}

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

Modular.set.output = function(path) {
  path = path.replace(/\/$/, '') + '/';
  Modular.option.output = path;
}

Modular.set.watch = function() {
  Modular.option.watch = true;
  Modular.watch(Modular.option.root);
}

/* bundle modules */
Modular.build = function() {
  Modular.cleanBuild();
  Modular.listModules(Modular.option.root);
  Modular.loadClient(Modular.client);
  Modular.loadModules(Modular.modules);
  Modular.writePackage(Modular.option.output + Modular.option.file, Modular.cache);
}

/* watch root directory */
Modular.watch = function(path) {
  path = path.replace(/\/$/, '') + '/';
  fs.watch(path, {interval: 1000}, onWatch);
  // ev, 'change' or 'rename'
  // filename, 'app.coffee'
  function onWatch(ev, filename) {
    log('watch', ev, filename);
    var ext = filename.split('.').pop();
    if (~Modular.option.extensions.indexOf(ext)) Modular.build();
  }
  var files = fs.readdirSync(path);
  files.forEach(function(file) {
    if (fs.statSync(path + file).isDirectory()) Modular.watch(path + file);
  })
}

/* remove build package before list modules */
Modular.cleanBuild = function() {
  if (fs.existsSync(Modular.option.file)) {
    fs.unlinkSync(Modular.option.file);
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
  return Coffee.compile(code);
}

Modular.loadJS = function(path) {
  return fs.readFileSync(path, 'utf8');
}

/* write everything into the package file */
Modular.writePackage = function(name, content) {
  if (Modular.option.compress) {
    var result = UglifyJS.minify(content, {
      fromString: true,
      mangle: true
    })
    content = result.code;
  }
  fs.writeFile(name, content, function(err) {
    if (err) throw err;
    log('build ' + name);
  })
}

/* wrap the code of a module */
Modular.wrapModule = function(path, code) {
  // make relative into absolute path
  path = path.replace(/^\./, '');
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

module.exports = Modular
