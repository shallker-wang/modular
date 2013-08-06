modular-js
==========

Module system on the client side.


## Installation
```
sudo npm install modular-js -g
```


## Quick Start
Go to your app, run the command `modular build` to bundle all the modules into a single .js file:
```
cd my-app
modular build
```

It will build a file application.js for you, ready to be included in HTML and run on browser:
```html
<script src="application.js"></script>
```

After application.js, start requiring your modules:
```html
<script>
  var app = require('app');
  new app();
</script>
```


## Require
Absolutely require, start with a forward slash
```javascript
var foo = require('/lib/foo');
```

Relatively require, start with `./`, `../` or module file name directly if they're in the same folder
```javascript
var bar = require('foo');
var bar = require('./foo');
var bar = require('../foo');
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


## Usage example
Build current directory:
```bash
modular -b .
```

Build a sub folder:
```bash
modular -b ./sub
```

Watch and build:
```bash
modular -wb .
```

Specify the build file name:
```bash
modular --file app.js -wb .
```

Build to parent folder:
```bash
modular -o ../ -wb .
```


## Command
```bash
Usage: modular [options]

Options:

  -h, --help          output usage information
  -V, --version       output the version number
  -w --watch          Watch file changes and trigger build
  -c --compress       Compress javascript in build
  -f --file [name]    Specify the build file name
  -o --output [path]  Output path
  -b --build [path]   Bundle all the modules into one file
```


## Todo
- ~~coffeescript support~~
- ~~compress support~~
- ~~relative path start with './' support~~
- ~~up path '../' support~~
- ~~set root~~
- ~~add watch~~


## License (MIT)

Copyright (c) 2013 Shallker Wang

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
