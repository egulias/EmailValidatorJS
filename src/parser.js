'use strict';

var lexer = require('./lexer').lexer;

var NoLocalPart = {
  name: 'NoLocalPart',
  message: 'No local part found'
};

var StartWithDot = {
  name: 'StartWithDot',
  message: 'Starts with a Dot'
};

var EndWithDot = {
  name: 'EndWithDot',
  message: 'Ends with a Dot'
};

var ExpectingATEXT = {
  name: 'ExpectingATEXT',
  message: 'ATEXT was expected'
};

var ConsecutiveCRLFinFWS = {
  name: 'Two CRLF in FWX',
  message: ''
};

var CRLFAtFWSEnd = {
  name: 'CRLFAtFWSEnd',
  message: 'CRLF at the end of FWS'
};

var CRAndNoLF = {
  name: 'CRAndNoLF',
  message: 'Found CR but no LF'
}

var ATEXTAfterCFWS = {
  name: 'ATEXTAfterCFWS',
  message: 'Found ATEXT after CFWS'

};

function parseDQUOTE(closingQuote) {
  return false; // ?
};

function isInvalidToken(token, closingQuote) {
  var forbidden = [
    {type:lexer.comma},
    {type:lexer.closebracket},
    {type:lexer.openbracket},
    {type:lexer.greaterthan},
    {type:lexer.lowerthan},
    {type:lexer.colon},
    {type:lexer.semicolon}
    //lexer.invalid
  ];

  // Native forEach is really slow
  // would you mind using lodash?
  forbidden.forEach(function(value) {
    if (token.equals(value) && !closingQuote) {
      throw ExpectingATEXT;
    }
  });
};


function LocalPartParser(lexer) {

  Parser.call(this, lexer);



}

LocalPartParser.prototype = Object.create(Parser.prototype);
LocalPartParser.prototype.constructor = LocalPartParser;

LocalPartParser.prototype.parse = function () {
  var parseDQuote = true;
  var closingQuote = false;

  while (lexer.token.type !== lexer.at && lexer.token) {

    if (lexer.token.type === lexer.dot && !lexer.getPrevious()) {
      throw StartWithDot;
    }

    closingQuote = this.checkDQUOTE(closingQuote);
    if (closingQuote && parseDQuote) {
      parseDQuote = parseDQUOTE();
    }

    if (lexer.token.type === lexer.openparenthesis) {
      this.parseComments();
    }

    this.checkConsecutiveDots();

    if (lexer.token.type === lexer.dot && lexer.isNextToken(lexer.at)) {
      throw EndWithDot;
    }

    this.warnEscaping();
    isInvalidToken(lexer.token, closingQuote);

    if (this.isFWS()) {
      this.parseFWS();
    }
    lexer.moveNext();
  }
};

function Parser(lexer) {}

Parser.prototype.checkDQUOTE = function (closingQuote) {
  return false;
};

Parser.prototype.parseComments = function () {

};

Parser.prototype.checkConsecutiveDots = function () {

};

Parser.prototype.warnEscaping = function () {

};

Parser.prototype.escaped = function (lexer) {
  return lexer.getPrevious().equals({type: lexer.backslash}) && !lexer.token.equals({type: lexer.generic});
};

Parser.prototype.isFWS = function () {

  if (this.escaped(lexer)) {
    return false;
  }

  return lexer.token.equals({type: lexer.space}) ||
    lexer.token.equals({type: lexer.htab}) ||
    lexer.token.equals({type: lexer.cr}) ||
    lexer.token.equals({type: lexer.lf}) ||
    lexer.token.equals({type: lexer.crlf});
};

Parser.prototype.parseFWS = function () {

  function checkCRLFInFWS() {
    if (lexer.token.equals({type: lexer.crlf})) {
      return;
    }
    if (lexer.isNextToken({type: lexer.crlf})) {
      throw ConsecutiveCRLFinFWS;
    }
    if (!lexer.isNextTokenAny([{type: lexer.space}, {type: lexer.htab}])) {
      throw CRLFAtFWSEnd;
    }
  }

  checkCRLFInFWS();

  var previous = lexer.getPrevious();

  if (lexer.token.equals({type: lexer.cr})) {
    throw CRAndNoLF;
  }

  if (lexer.isNextToken({type: lexer.generic}) && !previous.equals({type: lexer.at})) {
    throw ATEXTAfterCFWS;
  }

  if (lexer.token.equals({type: lexer.lf}) || lexer.token.equals({type: lexer.null})) {
    throw ExpectingATEXT;
  }

  if (lexer.isNextToken({type: lexer.at}) || previous.equals({type: lexer.at})) {
    //$this->warnings[] = EmailValidator::DEPREC_CFWS_NEAR_AT;
  } else {
    //$this->warnings[] = EmailValidator::CFWS_FWS;
  }
};

function hasLocalPart () {
  if (lexer.token.type === lexer.at) {
    throw NoLocalPart;
  }
};

function EmailParser () { }

EmailParser.prototype.parse = function (email) {
  lexer.lex(email);
  hasLocalPart();
  var localPartParser = new LocalPartParser(lexer);
  localPartParser.parse();
};

module.exports.parser = new EmailParser();

