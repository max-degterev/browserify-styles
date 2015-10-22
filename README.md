# Browserify styles [![Build Status](https://travis-ci.org/suprMax/browserify-styles.svg?branch=master)](https://travis-ci.org/suprMax/browserify-styles)

Browserify plugin for bundling styles. Allows for `require('./awesome.styl')` and `require('./legacy.css')`. Concats and puts those files in a separate processed CSS file which you can later minify, modify and serve as you desire.


## Install

```
$ npm install --save-dev browserify-styles
```


## Usage

```js
var b = require('browserify')();

b.add('./main.js');
b.plugin(require('browserify-styles'), {
  rootDir: __dirname,
  output: './path/to/my.css'
});

b.bundle();
```


## License

MIT © [Max Degterev](http://max.degterev.me)
