var a = 'a',
    b = 'b',
    c = require('./dependency');

require('./style.css');
require('./dependency.css');
require('./stylus.styl');

console.log(a + b + c);
