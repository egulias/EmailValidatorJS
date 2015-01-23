'use strict';

var lexer = require('./lexer');

var NoLocalPart = {
  name: "NoLocalPart",
  message: "No local part found"
};

function Parser () {
  this.parse = function(email) {
    lexer.lexer.lex(email);
    hasLocalPart();
  };

  var hasLocalPart = function() {
    console.log(lexer.lexer.token);
    if (lexer.lexer.token.type === lexer.lexer.at) {
      throw NoLocalPart;
    }
  };

}

module.exports.parser = new Parser();
