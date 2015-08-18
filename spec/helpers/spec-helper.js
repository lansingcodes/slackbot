// Allow LiveScript and CoffeeScript in specs
require('livescript');
require('babel/register');
require('coffee-script/register');

// Globalize the prelude standard library
var prelude = require('prelude-ls');
Object.keys(prelude).forEach(function(key){
  global[key] = prelude[key];
});

// Alias she for it, to bypass it being semi-reserved in LiveScript
she = it;

includeHubot = require('./include-hubot');
