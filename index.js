var Modular = require('./lib/modular');

/* export Modular setter */
exports.set = function(name, value) {
  Modular.set(name, value);
}

/* export Modular builder */
exports.build = function(path) {
  if (typeof path === 'undefined') {
    path = './';
  }
  Modular.set('root', path);
  Modular.build();
  if (Modular.option.watch) {
    Modular.watch(Modular.option.root);
  }
}
