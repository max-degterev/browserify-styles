var fs = require('fs'),
    writeStream = fs.createWriteStream('./build/script.js'),
    browserify = require('browserify')
    bundle = browserify({ entries: './package/script.js' });

bundle.plugin(require('../'), {
  output: './build/style.css',
  modules: ['postcss', 'stylus', 'scss'],
  moduleOptions: {
    stylus: {
      errors: true,
      //use: [nib()],
      paths: [__dirname + "/node_modules"],
      'include css': true,
      // urlfunc: 'embedurl',
    },
    scss: {
      includePaths: [__dirname + "/node_modules"]
    }
  }
});

bundle
  .bundle()
  .on('error', function(error) { console.warn(error.stack || error) })
  .pipe(writeStream);
