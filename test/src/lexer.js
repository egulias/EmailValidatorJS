'use strict';

var should = require('chai').should(),
    lexer = require('../../src/lexer');
var they = it;

describe('Token has public properties', function () {
  it ('has text and type', function () {
    var token = new lexer.Token('type', 'text');
    token.type.should.equal('type');
    token.text.should.equal('text');
  });
  it ('is equal to another token', function () {
    var token = new lexer.Token('type', 'text');
    var token2 = new lexer.Token('type', 'text');
    token.equals(token2).should.equal(true);
  });
});

describe('Lexer create a token as we expect', function () {
  var textForLexer = [
    {expected:'GENERIC', text: 'foo'},
    {expected:'S_AT', text: '@'},
    {expected:'S_CLOSEPARENTHESIS', text: ')'},
    {expected:'S_OPENPARENTHESIS', text: '('},
    {expected:'S_CR', text: '\r'},
    {expected:'S_HTAB', text: '\t'},
    {expected:'CRLF', text: '\r\n'},
    {expected:'S_LF', text: '\n'},
    {expected:'S_SP', text: ' '},
    {expected:'S_IPV6TAG', text: 'IPv6'},
    {expected:'S_DOUBLECOLON', text: '::'},
    {expected:'S_COLON', text: ':'},
    {expected:'S_DOT', text: '.'},
    {expected:'S_DQUOTE', text: '\"'},
    {expected:'S_HYPHEN', text: '-'},
    {expected:'S_BACKSLASH', text: '\\'},
    {expected:'S_SLASH', text: '/'},
    {expected:'S_LOWERTHAN', text: '<'},
    {expected:'S_GREATERTHAN', text: '>'},
    {expected:'S_OPENBRACKET', text: '['},
    {expected:'S_CLOSEBRACKET', text: ']'},
    {expected:'S_SEMICOLON', text: ';'},
    {expected:'S_COMMA', text: ','},
    {expected:'S_OPENQBRACKET', text: '{'},
    {expected:'S_CLOSEQBRACKET', text: '}'}
    //{expected:'S_EMPTY', text: ''}
  ];
  textForLexer.forEach(function (test) {
    it ('Generates token ' + test.expected + ' for text ' + test.text, function () {
      lexer.lexer.lex(test.text);
      lexer.lexer.token.type.should.equal(test.expected);
    });
  });
});

describe('We can make the lexer move through tokens', function () {
  var textForLexer = [
    {expected:[{type: 'GENERIC', text: 'foo'}, {type:'S_AT', text: '@'}, {type: 'GENERIC', text: 'foo'}], text: 'foo@bar'},
  ];
  textForLexer.forEach(function (test) {
    it ('Can move through tokens', function () {
      lexer.lexer.lex(test.text);
      test.expected.forEach(function (expectedToken) {
        lexer.lexer.token.type.should.equal(expectedToken.type);
        lexer.lexer.moveNext();
      });
    });
  });

  textForLexer.forEach(function (test) {
    it ('Stops when no more tokens', function () {
      lexer.lexer.lex(test.text);
      test.expected.forEach(function (expectedToken) {
        lexer.lexer.moveNext();
      });
      lexer.lexer.moveNext().should.equal(false);
    });
  });
});

describe('We can ask if next token is what we want', function () {
  var textForLexer = [
    {tokens:[{type: 'GENERIC', text: 'foo'}, {type:'S_AT', text: '@'}, {type: 'GENERIC', text: 'foo'}], text: 'foo@bar'},
  ];
  textForLexer.forEach(function (test) {
    it ('is what we want', function () {
      lexer.lexer.lex(test.text);
      lexer.lexer.isNextToken(test.tokens[1]).should.equal(true);
    });
  });

  textForLexer.forEach(function (test) {
    it ('is not what we want', function () {
      lexer.lexer.lex(test.text);
      lexer.lexer.isNextToken({type: 'baz'}).should.equal(false);
    });
  });

  textForLexer.forEach(function (test) {
    it ('is not an object', function () {
      lexer.lexer.lex(test.text);
      lexer.lexer.isNextToken('baz').should.equal(false);
    });
  });
});

describe('We can ask if next token is any of what we are asking for', function () {
  var textForLexer = [
    {tokens:[{type: 'GENERIC', text: 'foo'}, {type:'S_AT', text: '@'}, {type: 'GENERIC', text: 'foo'}], text: 'foo@bar'},
  ];
  textForLexer.forEach(function (test) {
    it ('is at least one of them', function () {
      lexer.lexer.lex(test.text);
      lexer.lexer.isNextTokenAny([test.tokens[1], {type:'baz'}]).should.equal(true);
    });
  });
  textForLexer.forEach(function (test) {
    it ('is none of them', function () {
      lexer.lexer.lex(test.text);
      lexer.lexer.isNextTokenAny([{type: 'bar'}, {type:'baz'}]).should.equal(false);
    });
  });
  it ('is not an array', function () {
    lexer.lexer.lex('foo@bar');
    lexer.lexer.isNextTokenAny('baz').should.equal(false);
  });
});

describe('We can search starting from the next token', function () {
  var test = {
      text: 'foo(baz)@bar'
    };

  it ('is found', function () {
    lexer.lexer.lex(test.text);
    lexer.lexer.find({type:'S_CLOSEPARENTHESIS'}).should.equal(true);
  });

  it ('is not found', function () {
    lexer.lexer.lex(test.text);
    lexer.lexer.find({type:'S_LOWERTHAN'}).should.equal(false);
  });

  it ('is not found because is behind', function () {
    lexer.lexer.lex(test.text);
    lexer.lexer.moveNext();
    lexer.lexer.moveNext();
    lexer.lexer.find({type:'S_OPENPARENTHESIS'}).should.equal(false);
  });
});
