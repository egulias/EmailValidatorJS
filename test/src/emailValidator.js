var should = require('chai').should(),
    emailValidator = require('../../src/emailValidator');

describe('Is a valid email', function() {
  it('Validates an email againts several RFCs', function(){
    emailValidator.isValid('test@example.com').should.equal(true);
  });
});
