var fs = require('fs');
var path = require('path');
var ReadableStream = require('stream').Readable;

var _ = require('lodash');
var through2 = require('through2');

var accord = require('accord');

const PLUGIN_NAME = 'browserify-styles';

var cssStream;
var files = [];
var processors = {};
var extensions = [];

var processorFactory = function(module, options) {
  var compiler = accord.load(module);

  var processorFunction = function(file, done) {
    // hack needed because accord passes a string to a compiler, node-sass can't detect syntax style
    if (module === 'scss' && options.indentedSyntax === undefined) {
      options.indentedSyntax = /\.sass$/i.test(file);
    }

    var _this = this;

    compiler
      .renderFile(file, options)
      .then(function(response) {
        if (response.result) {
          files.push(response.result);
          cssStream.push(response.result);
        }
        done();
      })
      .catch(function(error) {
        _this.emit('error', error);
        done();
      });
  };

  return {
    extensions: compiler.extensions,
    processorFunction: processorFunction
  };
};

var loadModules = function(options) {
  options.modules.forEach(function(module) {
    var processor = processorFactory(module, options.moduleOptions[module] || {});

    processor.extensions.forEach(function(extension) {
      processors[extension] = processor.processorFunction;
      extensions.push(extension);
    });
  })
};

var transform = function (file, options) {
  var extension = path.extname(file).slice(1);

  if (options.extensions.indexOf(extension) === -1) {
    // Unprocessable, skip
    return through2();
  }
  else {
    // Processable, swallow
    return through2(function (buf, enc, next) {
      processors[extension].call(this, file, next);
    });
  }
};

var plugin = function(browserify, options) {
  options = _.defaults(options || {}, {
    rootDir: process.cwd(),
    modules: ['postcss'],
    moduleOptions: {}
  });

  if (!options.output) {
    throw new Error(PLUGIN_NAME + ' requires output option to function');
  }

  var output = path.relative(options.rootDir, options.output);

  if (options.modules.length) loadModules(options);

  browserify.transform(transform, {
    global: true,
    extensions: extensions
  });

  browserify.on('bundle', function (bundle) {
    // on each bundle, create a new stream b/c the old one might have ended
    cssStream = new ReadableStream();
    cssStream._read = function() {};

    bundle.emit('css_stream', cssStream);
    bundle.on('end', function (){
      cssStream.push(null);
      fs.writeFile(output, files.join(''), function (error) {
        if (error) bundle.emit('error', error);
      });
    });
  });
};

module.exports = plugin;
