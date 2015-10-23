var fs = require('fs'),
    writeStream = fs.createWriteStream('./build/script.js'),
    browserify = require('browserify')
    bundle = browserify({ entries: './package/script.js' });

bundle.plugin(require('../'), {
  output: './build/style.css',
  modules: ['postcss', 'stylus', 'scss'],
  moduleOptions: {
    postcss: {
    },
    stylus: {
      errors: true,
      //use: [nib()],
      paths: [__dirname + "/node_modules"],
      'include css': true,
      // urlfunc: 'embedurl',
      linenos: true
    },
    scss: {
      sourceComments: true,
      includePaths: [__dirname + "/node_modules"]
    }
  }
});

bundle
  .bundle()
  .on('error', function(error) { console.warn(error.stack || error) })
  .pipe(writeStream);
