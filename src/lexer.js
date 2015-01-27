'use strict';

var rules = [
  '([a-zA-Z_]+[46]?)',
  '[0-9]+',
  '([^::])',
  //'::',
  "\r\n",
  ' +?'
];

var invalid = [
  String.fromCharCode(31),
  String.fromCharCode(226),
  String.fromCharCode(0)
];

var specialTokens = {
  '@': 'S_AT',
  '(': 'S_OPENPARENTHESIS',
  ')': 'S_CLOSEPARENTHESIS',
  '\r': 'S_CR',
  '\t': 'S_HTAB',
  '\r\n': 'CRLF',
  '\n': 'S_LF',
  ' ': 'S_SP',
  'IPv6': 'S_IPV6TAG',
  '::': 'S_DOUBLECOLON',
  ':': 'S_COLON',
  '.': 'S_DOT',
  '\"': 'S_DQUOTE',
  '-': 'S_HYPHEN',
  '\\': 'S_BACKSLASH',
  '/': 'S_SLASH',
  '<': 'S_LOWERTHAN',
  '>': 'S_GREATERTHAN',
  '[': 'S_OPENBRACKET',
  ']': 'S_CLOSEBRACKET',
  ';': 'S_SEMICOLON',
  ',': 'S_COMMA',
  '{': 'S_OPENQBRACKET',
  '}': 'S_CLOSEQBRACKET'
  //'': 'S_EMPTY'
}

function Token (type, text) {
  this.type = type;
  this.text = text;
}

Token.prototype.equals = function (token) {
  return token.type === this.type;
};

var tokens = [];
var position = 1;
var previous = {
  equals: function (token) {
    return false;
  }
};

function Lexer(options, rules) {
  this.at = 'S_AT';
  this.openparenthesis = 'S_OPENPARENTHESIS';
  this.closeparenthesis = 'S_CLOSEPARENTHESIS';
  this.carriage = 'S_CR';
  this.tab = 'S_HTAB';
  this.carriagelinefeed = 'CRLF';
  this.linefeed = 'S_LF';
  this.space = 'S_SP';
  this.IPv6 = 'S_IPV6TAG';
  this.doublecolon = 'S_DOUBLECOLON';
  this.colon = 'S_COLON';
  this.dot = 'S_DOT';
  this.dquote = 'S_DQUOTE';
  this.hyphen = 'S_HYPHEN';
  this.backslash = 'S_BACKSLASH';
  this.slash = 'S_SLASH';
  this.lowerthan = 'S_LOWERTHAN';
  this.greaterthan = 'S_GREATERTHAN';
  this.openbracket = 'S_OPENBRACKET';
  this.closebracket = 'S_CLOSEBRACKET';
  this.semicolon = 'S_SEMICOLON';
  this.comma = 'S_COMMA';
  this.openqbracket = 'S_OPENQBRACKET';
  this.closeqbracket = 'S_CLOSEQBRACKET';
  this.generic = 'GENERIC';
  this.token = {};
  // this.options = options || marked.defaults;
  this.rules = rules;

  // About "privacy" ...
  // I think this could be a solution
  //
  // this.rules =  Object.freeze({ key: 'value' });
  // Tell me what you think
}

Lexer.prototype.reset = function () {
  tokens = [];
  position = 1;
  this.token = {};
};

Lexer.prototype.lex = function (src) {

  this.reset();

  var regexp = RegExp(this.rules.join('|'), 'igm');
  var initialMatches = src.split(regexp);
  var cr = 0;
  initialMatches.filter(function(match) {
    if (match === '' || match === undefined) {
      return false;
    }
    if (specialTokens[match]) {
      if (specialTokens[match] === "S_CR") {
        cr++;
      }
      if (specialTokens[match] === "S_LF" && cr >= 1) {
        cr = 0;
        tokens.pop();
        tokens.push(new Token(specialTokens["\r\n"], "\r\n"));
        return true;
      }

      tokens.push(new Token(specialTokens[match], match));
      return true;
    }
    tokens.push(new Token(this.generic, match));
    return true;
  }, this);

  this.lookahead = tokens[1];
  this.token = tokens[0];
  return this.tokens;
};

Lexer.prototype.moveNext = function () {
  position = position + 1;
  previous = this.token;
  this.token = this.lookahead;
  this.lookahead = tokens[position];

  return this.lookahead !== undefined;
};

Lexer.prototype.isNextToken = function (token) {
  if (!(token instanceof Object)) {
    return false;
  }

  return undefined !== this.lookahead && this.lookahead.equals(token);
};

Lexer.prototype.isNextTokenAny = function (wantedTokens) {
  if (!(wantedTokens instanceof Array)) {
    return false;
  }

  return undefined !== this.lookahead && (wantedTokens.filter(function (token) {
      return this.isNextToken(token);
    }, this).length >= 1);
};

Lexer.prototype.find = function (token) {
  var startPosition = position + 1;
  for (var i = startPosition; i < tokens.length; i++) {
    if (tokens[i].equals(token)) {
      return true;
    }
  }
  return false;
};

Lexer.prototype.getPrevious = function () {
  return previous;
};

module.exports.lexer = new Lexer({}, rules);
module.exports.Token = Token;
