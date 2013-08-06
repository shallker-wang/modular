var Modular = require('./lib/modular');

exports.version = '1.0.0';

/* export Modular setter */
exports.set = function(name, value) {
  Modular.set(name, value);
}

/* export Modular builder */
exports.build = function(path) {
  if (typeof path === 'undefined') {
    path = './';
  }
  Modular.build(path);
}
