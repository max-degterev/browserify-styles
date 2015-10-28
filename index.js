'use strict';

var fs = require('fs');
var path = require('path');
var ReadableStream = require('stream').Readable;

var _ = require('lodash');
var through2 = require('through2');

var accord = require('accord');

const ENCODING = 'utf8';


module.exports = function(browserify, options) {
  options = _.defaults(options || {}, {
    rootDir: process.cwd(),
    modules: ['postcss'],
    moduleOptions: {}
  });

  var processors = {};
  var extensions = [];

  var files = [];
  var contents = {};

  var output;
  var cssStream;

  var processorFactory = function(module, settings) {
    var compiler = accord.load(module);

    var compile = function(file, string, done) {
      // hack needed because accord passes a string to a compiler, node-sass can't detect syntax style
      if (module === 'scss' && settings.indentedSyntax === undefined) {
        settings.indentedSyntax = /\.sass$/i.test(file);
      }

      var _this = this;

      compiler
        .render(string, _.clone(settings))
        .then(function(response) {
          if (response.result) {
            cssStream.push(response.result);
            contents[file] = response.result;
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
      compile: compile
    };
  };

  var loadModules = function() {
    options.modules.forEach(function(module) {
      var processor = processorFactory(module, options.moduleOptions[module] || {});

      processor.extensions.forEach(function(extension) {
        processors[extension] = processor.compile;
        extensions.push(extension);
      });
    })
  };

  var transform = function (file) {
    var extension = path.extname(file).slice(1);

    if (extensions.indexOf(extension) === -1) {
      // Unprocessable, skip
      return through2();
    }
    else {
      // Processable, swallow
      return through2(function (buf, enc, next) {
        files.push(file);
        processors[extension].call(this, file, buf.toString(ENCODING), next);
      });
    }
  };

  if (options.output) output = path.relative(options.rootDir, options.output);
  if (options.modules.length) loadModules();

  browserify.transform(transform, {
    global: true
  });

  browserify.on('bundle', function (bundle) {
    // on each bundle, create a new stream b/c the old one might have ended
    cssStream = new ReadableStream();
    cssStream._read = function() {};

    bundle.emit('css_stream', cssStream);
    bundle.on('end', function (){
      cssStream.push(null);
      if (output) {
        var contentString = '';

        files.forEach(function(file) {
          contentString += contents[file];
        });

        fs.writeFile(output, contentString, ENCODING, function (error) {
          // bundle was destroyed, emit new events on `browserify`
          if (error) browserify.emit('error', error);
          browserify.emit('css_end', output);
        });
      }
    });
  });
};
