var $, fill;

$ = require('jquery');

(fill = function(item) {
  return $('.tagline').append('#{item}');
})('The most Creativeeeeeeeeeeeeeeeee minds in the Art');
