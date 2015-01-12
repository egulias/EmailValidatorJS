'use strict';

function EmailValidator() {
  this.isValid = function (email, strict) {
    return true;
  };
}

module.exports = new EmailValidator();
