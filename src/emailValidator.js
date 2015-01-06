'use strict';
var lexis = require('lexis');

function EmailValidator() {
  this.isValid = function(email, strict) {
    return true;
  }
};

var emailValidator = new EmailValidator();

module.exports =  emailValidator
