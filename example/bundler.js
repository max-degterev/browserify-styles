var fs = require('fs'),
    writeStream = fs.createWriteStream('./build/script.js'),
    browserify = require('browserify')
    bundle = browserify({ entries: './package/script.js' });

bundle.plugin(require('../'), {
  output: './build/style.css',
  modules: ['stylus', 'scss']
});

bundle
  .bundle()
  .on('error', function(error) { console.warn(error.stack || error) })
  .pipe(writeStream);
