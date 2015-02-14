'use strict';

var parser = require('./parser').parser;

function EmailValidator() { }

EmailValidator.prototype.isValid = function (email, strict) {
  try {
    parser.parse(email);
  }
  catch (err) {
    console.log(err);
    return false;
  }
  return true;
};

module.exports = new EmailValidator();
