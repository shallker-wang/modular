modular
==========

Module system on the client side.

## Installation
```
sudo npm install git://github.com/shallker-wang/modular.git -g
```

## Quick Start
Go to your project, run the command `modular` to bundle all the modules to a single .js file:
```
cd my-project
modular build application.js
```

It will build a file application.js for you, ready to be included in HTML and run on browser:
```html
<script src="application.js"></script>
```

After application.js, start requiring your modules:
```html
<script>
  // relatively require
  var app = require('app');
  // absolutely require
  var foo = require('/inc/foo');
</script>
```

## Define a module afterwards
Define a module after application.js is included, `define(path, function(exports, require, module) {/* your module */})`:
```html
<script src="application.js"></script>
<script>
  define('/inc/my', function(exports, require, module) {
    var foo = require('foo');
    var my = [foo, 'my'];
    module.exports = my;
  });
  var my = require('inc/my');
</script>
```

## File structure example
```
.
|__app.js
|__inc
| |__bar.js
| |__foo.js
```

app.js
```javascript
var foo = require('inc/foo');
var bar = require('inc/bar');
module.exports = [foo, bar];
```

inc/foo.js
```javascript
var foo = 'hello';
module.exports = foo;
```

inc/bar.js
```javascript
var foo = require('foo');
var bar = foo + 'world';
module.exports = bar;
```

## Command
```bash
Usage: modular [options]

Options:

  -h, --help         output usage information
  -V, --version      output the version number
  -c --compress      Compress javascript
  -f --file [name]   Specify the build package file name
  -b --build [name]  Bundle all the modules into one file
```

## Todo
- ~~coffeescript support~~
- ~~compress support~~
- ~~relative path start with './' support~~
- up path '..' support
