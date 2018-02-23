'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const expect = chai.expect;

const { TEST_MONGODB_URI } = require('../config.js');

chai.use(chaiHttp);


/* ========== TESTING HOOKS ========== */
before(function () {
  return mongoose.connect(TEST_MONGODB_URI, { autoIndex: false });
});

beforeEach(function () {});

afterEach(function () {
  return User.remove();
});

after(function () {
  return mongoose.disconnect();
});


/* ========== ROUTE TESTS ========== */
describe('POST /v3/users', () => {

  describe('verify the required fields are present in the req.body', () => {
    const username = 'steph30';
    const password = 'dubnation';
    const fullname = 'Stephen Curry';

    it('should fail without a username', () => {
      return chai.request(app)
        .post('/v3/users')
        .send({ password, fullname })
        .then( res => {
          expect(res).to.not.exist;
        })
        .catch( err => {
          const res = err.response;
          expect(res.body.message).to.equal('Missing \'username\' in request body');
          expect(res).to.have.status(422);
        });
    });

    it('should fail without a password', () => {
      return chai.request(app)
        .post('/v3/users')
        .send({ username, fullname })
        .then(res => {
          expect(res).to.not.exist;
        })
        .catch(err => {
          const res = err.response;
          expect(res.body.message).to.equal('Missing \'password\' in request body');
          expect(res).to.have.status(422);
        });
    });

  });


  describe('verify that each of the fields are a string', () => {
    const { username2, password2, fullname2 } = false;

    it('should fail if the username is not a string', () => {
      chai.request(app)
        .post('/v3/users')
        .send({ username2 })
        .then( res => {
          expect(res).to.not.exist;
        })
        .catch( err => {
          const res = err.response;
          expect(res.body.message).to.equal('Field: \'username2\' must be type String');
          expect(res).to.have.status(422);
        });
    });

    it('should fail if the password is not a string', () => {
      chai.request(app)
        .post('/v3/users')
        .send({ password2 })
        .then(res => {
          expect(res).to.not.exist;
        })
        .catch(err => {
          const res = err.response;
          expect(res.body.message).to.equal('Field: \'password2\' must be type String');
          expect(res).to.have.status(422);
        });
    });

    it('should fail if the fullname is not a string', () => {
      chai.request(app)
        .post('/v3/users')
        .send({ fullname2 })
        .then(res => {
          expect(res).to.not.exist;
        })
        .catch(err => {
          const res = err.response;
          expect(res.body.message).to.equal('Field: \'fullname2\' must be type String');
          expect(res).to.have.status(422);
        });
    });

  });


  describe('verify that the un/pw do not have whitespace', () => {

    it('should fail if the username has whitespace', () => {

    });

    it('should fail if the password has whitespace', () => {

    });

  });


  describe('verify that the length of the un/pw meet the requirements', () => {

    it('should fail if the username has less than 1 character', () => {

    });

    it('should fail if the password has less than 8 characters', () => {

    });

    it('should fail if the password has more than 72 characters', () => {

    });

  });


  it('should trim the whitespace off the fullname prop', () => {

  });

  it('should fail if the username already exists', () => {

  });

  it('should create a new user', () => {

  });


});