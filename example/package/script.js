var a = 'a',
    b = 'b',
    c = require('./dependency');

require('./style.css');
require('./sass.sass');
require('./stylus.styl');

console.log(a + b + c === 'abc' ? 'MODULE SYSTEM WORKS' : 'ERROR!');
