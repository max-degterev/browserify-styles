var fs = require('fs'),
    writeStream = fs.createWriteStream('./build/script.js'),
    browserify = require('browserify')
    bundle = browserify({ entries: './package/script.js' });

bundle.plugin(require('../'), {
  rootDir: __dirname,
  output: './build/style.css'
});

bundle.bundle().pipe(writeStream);
