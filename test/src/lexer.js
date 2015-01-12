'use strict';

var should = require('chai').should(),
    lexer = require('../../src/lexer');
var they = it;


describe('Lexer create a token as we expect', function () {
  var textForLexer = [
    {expected:'GENERIC', text: 'foo'},
    {expected:'S_AT', text: '@'}
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
