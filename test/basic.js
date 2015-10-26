'use strict';

var fs = require('fs');
var expect = require('chai').expect;

var validContents = fs.readFileSync(__dirname + '/fixtures/compiled.css', 'utf8');

describe('browserify-styles', function() {
  it('should bundle css files', function(done) {

    var browserify = require('browserify'),
        bundle = browserify({ entries: __dirname + '/../example/package/script.js' }),
        writeStream = new (require('stream').Writable);

    writeStream._write = function(){};

    bundle.plugin(require('../'), {
      output: __dirname + '/../example/build/style.css',
      modules: ['postcss', 'stylus', 'scss']
    });

    bundle.bundle().on('css_end', function(){
      var compiled = fs.readFileSync(__dirname + '/../example/build/style.css', 'utf8');
      expect(validContents).to.be.equal(compiled);

      done();
    }).pipe(writeStream);
  });

  it('should emit css stream', function(done) {

    var browserify = require('browserify'),
        bundle = browserify({ entries: __dirname + '/../example/package/script.js' }),
        writeStream = new (require('stream').Writable);

    writeStream._write = function(){};

    bundle.plugin(require('../'), {
      modules: ['postcss', 'stylus', 'scss']
    });

    bundle.bundle().on('css_stream', function(stream){
      expect(stream).to.exist;
      done();
    }).pipe(writeStream);
  });
});
