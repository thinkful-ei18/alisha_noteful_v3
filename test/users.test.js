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
describe.only('POST /v3/users', () => {

  describe('verify the required fields are present in the req.body', () => {
    const username = 'steph30';
    const password = 'dubnation';

    it('should fail without a username', () => {
      return chai.request(app)
        .post('/v3/users')
        .send({ password })
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
        .send({ username })
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

    it('should fail if the username is not a string', () => {
      chai.request(app)
        .post('/v3/users')
        .send({username: false, password: 'dubnation'})
        .then( res => {
          expect(res).to.not.exist;
        })
        .catch( err => {
          const res = err.response;
          expect(res.body.message).to.equal('Field: \'username\' must be type String');
          expect(res).to.have.status(422);
        });
    });

    it('should fail if the password is not a string', () => {
      chai.request(app)
        .post('/v3/users')
        .send({ username: 'steph30', password: false })
        .then(res => {
          expect(res).to.not.exist;
        })
        .catch(err => {
          const res = err.response;
          expect(res.body.message).to.equal('Field: \'password\' must be type String');
          expect(res).to.have.status(422);
        });
    });

    it('should fail if the fullname is not a string', () => {
      chai.request(app)
        .post('/v3/users')
        .send({ username: 'steph30', password: 'dubnation', fullname: false })
        .then(res => {
          expect(res).to.not.exist;
        })
        .catch(err => {
          const res = err.response;
          expect(res.body.message).to.equal('Field: \'fullname\' must be type String');
          expect(res).to.have.status(422);
        });
    });

  });


  describe('verify that the un/pw do not have whitespace', () => {
    const username = 'steph30 ';
    const password = 'dubnation ';

    it('should fail if the username has whitespace', () => {
      chai.request(app)
        .post('/v3/users')
        .send({ username, password: 'dubnation' })
        .then(res => {
          expect(res).to.not.exist;
        })
        .catch(err => {
          const res = err.response;
          expect(res.body.message).to.equal('Field: \'username\' cannot start or end with whitespace');
          expect(res).to.have.status(422);
        });
    });

    it('should fail if the password has whitespace', () => {
      chai.request(app)
        .post('/v3/users')
        .send({ username: 'steph30', password })
        .then(res => {
          expect(res).to.not.exist;
        })
        .catch(err => {
          const res = err.response;
          expect(res.body.message).to.equal('Field: \'password\' cannot start or end with whitespace');
          expect(res).to.have.status(422);
        });
    });

  });


  describe('verify that the length of the un/pw meet the requirements', () => {
    const username = '';
    const password = 'seven';
    const password2 = 'wakandawakandawakandawakandawakandawakandawakandawakandawakandawakandawakanda';

    it('should fail if the username has less than 1 character', () => {
      chai.request(app)
        .post('/v3/users')
        .send({ username: '', password:'dubnation' })
        .then(res => {
          expect(res).to.not.exist;
        })
        .catch(err => {
          const res = err.response;
          expect(res.body.message).to.equal('Field: \'username\' must be at least 1 characters long');
          expect(res).to.have.status(422);
        });
    });

    it('should fail if the password has less than 8 characters', () => {
      chai.request(app)
        .post('/v3/users')
        .send({ username: 'steph30', password })
        .then(res => {
          expect(res).to.not.exist;
        })
        .catch(err => {
          const res = err.response;
          expect(res.body.message).to.equal('Field: \'password\' must be at least 8 characters long');
          expect(res).to.have.status(422);
        });
    });

    it('should fail if the password has more than 72 characters', () => {
      chai.request(app)
        .post('/v3/users')
        .send({ username: 'steph30', password: password2 })
        .then(res => {
          expect(res).to.not.exist;
        })
        .catch(err => {
          const res = err.response;
          expect(res.body.message).to.equal('Field: \'password\' must be at most 72 characters long');
          expect(res).to.have.status(422);
        });
    });

  });


  it('should trim the whitespace off the fullname prop', () => {

  });

  it('should fail if the username already exists', () => {

  });

  it('should create a new user', () => {

  });


});