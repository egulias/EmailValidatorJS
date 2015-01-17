'use strict';

var rules = [
  '([a-zA-Z_]+[46]?)',
  '(.)'
];
var specialTokens = {
  '@': 'S_AT',
  '(': 'S_OPENPARENTHESIS',
  ')': 'S_CLOSEPARENTHESIS'
}

var t = function Token (type, text) {
  this.type = type;
  this.text = text;

  this.equals = function (token) {
    return token.type === this.type;
  };
}

function Lexer(options, rules) {
  this.token = {};
  //this.options = options || marked.defaults;
  this.rules = rules;
  this.lookahead = {};

  var tokens = [];
  var position = 1;


  this.reset = function () {
    tokens = [];
    position = 1;
    this.token = {};
  };

  this.lex = function (src) {
    var matches = [];
    var src = src;


    this.reset();
    var regexp = RegExp(this.rules.join('|'), 'igm');
    var initialMatches = src.split(regexp);
    initialMatches.filter(function(match) {
      if (match === '' || match === undefined) {
        return false;
      }
      if (specialTokens[match]) {
        tokens.push(new t(specialTokens[match], match));
        return true;
      }
      tokens.push(new t('GENERIC', match));
      return true;
    }, this);

    this.lookahead = tokens[1];
    this.token = tokens[0];
    return this.tokens;
  };

  this.moveNext = function () {
    position = position + 1;
    this.token = this.lookahead;
    this.lookahead = tokens[position];

    return (this.lookahead !== undefined);
  };

  this.isNextToken = function (token) {
    if (!(token instanceof Object)) {
      return false;
    }
    return undefined !== this.lookahead && this.lookahead.equals(token);
  };

  this.isNextTokenAny = function (wantedTokens) {
    if (!(wantedTokens instanceof Array)) {
      return false;
    }

    return undefined !== this.lookahead && (wantedTokens.filter(function (token) {
        return this.isNextToken(token);
      }, this).length >= 1);
  };

  this.find = function (token) {
    var startPosition = position + 1;
    for (var i = startPosition; i < tokens.length; i++) {
      if (tokens[i].equals(token)) {
        return true;
      }
    }
    return false;
  };
}

module.exports.lexer = new Lexer({}, rules);
module.exports.Token = t;
