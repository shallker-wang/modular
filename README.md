modular
==========

Client side module system.

## Installation
```
sudo npm install git://github.com/shallker-wang/modular.git -g
```

## Quick Start
Go to your project, run the command `modular` to bundle all the modules to a single `.js` file:
```
cd my-project
modular
```

It will build an `application.js` for you, ready to run on browser:
```html
<script src="application.js"></script>
```

After `application.js`, start requiring your modules:
```html
<script>
  var app = require('app');
  var foo = require('inc/foo');
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

## Todo
- coffeescript support
- compress support
- relative path start with '.' support
- up path '..' support
