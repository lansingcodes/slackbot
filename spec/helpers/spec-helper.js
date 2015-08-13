require('livescript');
prelude = require('prelude-ls');
Object.keys(prelude).forEach(function(key){
  global[key] = prelude[key];
});
