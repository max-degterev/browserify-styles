var fs = require('fs')
var path = require('path');

var through2 = require('through2');
var _ = require('lodash');

var accord = require('accord');

var files = [];
var processors = {
  '.css': function(file, done) {
    fs.readFile(file, function (err, data) {
      if (!err) files.push(data);
      done(err);
    });
  },
  '.styl': function(file, done) {
    var stylus = accord.load('stylus');

    stylus.renderFile(file)
      .then(function(res) {
        if (res.result) files.push(new Buffer(res.result));
        done()
      })
      .catch(function(err) {
        done(err)
      });
  }
};


var transform = function (file, opts) {
  var ext = path.extname(file);
  if (opts.extensions.indexOf(ext) === -1) {
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

var plugin = function(b, opts) {
  opts = _.defaults(opts || {}, {
    rootDir: process.cwd()
  });

  var extensions = ['.css', '.styl'],
      output = path.relative(opts.rootDir, opts.output);

  b.transform(transform, {
    global: true,
    extensions: extensions
  });

  b.on('bundle', function (bundle) {
    bundle.on('end', function (){
      fs.writeFile(output, Buffer.concat(files), function (err) {
        if (err) return b.emit('error', err);
      });
    });
  });
};

module.exports = plugin;
