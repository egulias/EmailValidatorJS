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
};

var ATEXTAfterCFWS = {
  name: 'ATEXTAfterCFWS',
  message: 'Found ATEXT after CFWS'
};

var HyphenEndedDomain = {
  name: 'HyphenEndedDomain',
  message: 'Domain part ends with hyphen'
};

var CharNotAllowedInDomain = {
  name: 'CharNotAllowedInDomain',
  message: 'Character not allowed in Domain part'
};

var ConsecutiveATs = {
  name: 'ConsecutiveATs',
  message: 'Consecutive AT (@) found'
};

var CommaInDomain = {
  name: 'CommaInDomain',
  message: 'CommaFoundInDomain'
};

function parseDQUOTE(closingQuote) {
  return false; // ?
}

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
}


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

    if (lexer.token.equals({type: lexer.dot}) && lexer.isNextToken({type: lexer.at})) {
      throw EndWithDot;
    }

    this.warnEscaping();
    isInvalidToken(lexer.token, closingQuote);

    if (this.isFWS()) {
      this.parseFWS();
    }
    lexer.moveNext();
  }

  return lexer;
};

function DomainPartParser(lexer) {
  Parser.call(this, lexer);


}

DomainPartParser.prototype = Object.create(Parser.prototype);
DomainPartParser.prototype.constructor = DomainPartParser;
DomainPartParser.prototype.parse = function () {
  var domainMaxLength = 254;

  console.log(lexer.token);
  lexer.moveNext();
  console.log(lexer.token);
  if (lexer.token.equals(lexer.dot)) {
    throw StartWithDot;
  }

  //if (this.lexer.token['type'] === EmailLexer::S_EMPTY) {
  //  throw new \InvalidArgumentException('ERR_NODOMAIN');
  //}

  if (lexer.token.equals(lexer.hyphen)) {
    throw HyphenEndedDomain;
  }

  if (lexer.token.equals(lexer.openparenthesis)) {
    //this.warnings[] = EmailValidator::DEPREC_COMMENT;
    //this.parseDomainComments();
  }

  var domain = this.doParseDomainPart();

  var prev = lexer.getPrevious();
  var length = domain.length;

  if (prev.equals(lexer.dot)) {
    throw EndWithDot;
  }

  if (prev.equals(lexer.hyphen)) {
    throw HyphenEndedDomain;
  }

  if (length > domainMaxLength) {
    //this.warnings[] = EmailValidator::RFC5322_DOMAIN_TOOLONG;
  }

  if (prev.equals(lexer.carriage)) {
    throw CRLFAtFWSEnd;
  }

  this.domainPart = domain;
};
DomainPartParser.prototype.doParseDomainPart = function () {
  console.log(lexer.token);
  var domain = '';
  do {
    if (lexer.token.equals(lexer.semicolon)) {
      throw ExpectingATEXT;
    }

    var prev = lexer.getPrevious();

    if (lexer.token.equals(lexer.slash)) {
      throw CharNotAllowedInDomain;
    }

    if (lexer.token.equals(lexer.openparenthesis)) {
      this.parseComments();
      lexer.moveNext();
    }

    this.checkConsecutiveDots();
    this.checkDomainPartExceptions(prev);

    if (this.hasBrackets()) {
      this.parseDomainLiteral();
    }

    this.checkLabelLength(prev);

    if (this.isFWS()) {
      this.parseFWS();
    }

    domain += lexer.token.text;
    lexer.moveNext();
  } while (lexer.token);

  return domain;
};
DomainPartParser.prototype.checkDomainPartExceptions = function (prev) {
  if (lexer.token.equals(lexer.comma)) {
    throw CommaInDomain;
  }

  if (lexer.token.equals(lexer.at)) {
    throw ConsecutiveATs;
  }

  if (lexer.token.equals(lexer.openbracket) && !prev.equals(lexer.at)) {
    throw ExpectingATEXT;
  }

  if (lexer.token.equals(lexer.hyphen) && lexer.isNextToken(lexer.dot)) {
    throw HyphenEndedDomain;
  }

  if (lexer.token.equals(lexer.backslash) && lexer.isNextToken(lexer.generic)) {
    throw ExpectingATEXT;
  }
};

DomainPartParser.prototype.hasBrackets = function () {
  return false;
};
DomainPartParser.prototype.parseDomainLiteral = function () {

};
DomainPartParser.prototype.checkLabelLength = function (prev) {
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
    //this.warnings[] = EmailValidator::DEPREC_CFWS_NEAR_AT;
  } else {
    //this.warnings[] = EmailValidator::CFWS_FWS;
  }
};

function hasLocalPart () {
  if (lexer.token.type === lexer.at) {
    throw NoLocalPart;
  }
}

function EmailParser () { }

EmailParser.prototype.parse = function (email) {
  lexer.lex(email);
  hasLocalPart();
  var localPartParser = new LocalPartParser(lexer);
  var lexerWithState = localPartParser.parse();
  var domainPartParser = new DomainPartParser(lexerWithState);
  domainPartParser.parse();
};

module.exports.parser = new EmailParser();

