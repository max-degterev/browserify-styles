var fs = require('fs'),
    writeStream = fs.createWriteStream('./build/script.js'),
    browserify = require('browserify')
    bundle = browserify({ entries: './package/script.js' });

bundle.plugin(require('../'), {
  output: './build/style.css',
  modules: ['stylus', 'scss'],
  moduleOptions: {
    scss: {
      indentedSyntax: true
    }
  }
});

bundle
  .bundle()
  .on('error', function(error) { console.warn(error) })
  .pipe(writeStream);
