var should = require('chai').should(),
    emailValidator = require('../../src/emailValidator');

var validEmails = [
  'test@example.com'
];
describe('Is a valid email', function() {
    validEmails.forEach(function (email) {
      it('Validates [' + email + ']  against several RFCs', function(){
        emailValidator.isValid(email).should.equal(true);
      });
    });
  }
);

var invalidEmails = [
  //'test@example.com test',
  'user   name@example.com',
  'example.@example.co.uk',
  'example@example2@example3.co.uk'
];
invalidEmails.forEach(function (email) {
    describe('[' + email + '] is an invalid email', function() {
      it('Validates an email againts several RFCs', function(){
        emailValidator.isValid(email).should.equal(false);
      });
    });
  }
);
