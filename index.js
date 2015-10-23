var fs = require('fs')
var path = require('path');

var _ = require('lodash');
var through2 = require('through2');

var accord = require('accord');

var files = [];
var processors = {
  css: function(file, done) {
    fs.readFile(file, function (error, data) {
      if (!error) files.push(String(data));
      done(error);
    });
  }
};
var extensions = ['css'];

var processorFactory = function(module, options) {
  var compiler = accord.load(module);

  var processorFunction = function(file, done) {
    // hack needed because accord passes a string to a compiler, node-sass can't detect syntax type
    if (module === 'scss' && options.indentedSyntax === undefined) {
      options.indentedSyntax = /\.sass$/i.test(file);
    }

    compiler
      .renderFile(file, options)
      .then(function(response) {
        if (response.result) files.push(response.result);
        done();
      })
      .catch(function(error) {
        done(error);
      });
  };

  return {
    extensions: compiler.extensions,
    processorFunction: processorFunction
  };
};

var loadModules = function(options) {
  var module, processor, extension;

  for (var i = 0, _i = options.modules.length; i < _i; i++) {
    module = options.modules[i];

    processor = processorFactory(module, options.moduleOptions[module] || {});

    for (var j = 0, _j = processor.extensions.length; j < _j; j++) {
      extension = processor.extensions[j];

      processors[extension] = processor.processorFunction;
      extensions.push(extension);
    }
  }
};

var transform = function (file, options) {
  var ext = path.extname(file).slice(1);

  if (options.extensions.indexOf(ext) === -1) {
    // Unprocessable, skip
    return through2();
  }
  else {
    // Processable, swallow
    return through2(function (buf, enc, next) {
      processors[ext](file, next);
    });
  }
};

var plugin = function(browserify, options) {
  options = _.defaults(options || {}, {
    rootDir: process.cwd(),
    modules: [],
    moduleOptions: {}
  });

  var output = path.relative(options.rootDir, options.output);

  if (options.modules.length) loadModules(options);

  browserify.transform(transform, {
    global: true,
    extensions: extensions
  });

  browserify.on('bundle', function (bundle) {
    bundle.on('end', function (){
      fs.writeFile(output, files.join(''), function (err) {
        if (err) return browserify.emit('error', err);
      });
    });
  });
};

module.exports = plugin;
