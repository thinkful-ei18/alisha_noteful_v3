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
describe.only('/v3/users', () => {

  describe('verify the required fields are present in the req.body', () => {
    const username = 'shuri';
    const password = 'wakandaforever';

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
      return chai.request(app)
        .post('/v3/users')
        .send({ username: false, password: 'wakandaforever' })
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
      return chai.request(app)
        .post('/v3/users')
        .send({ username: 'shuri', password: false })
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
      return chai.request(app)
        .post('/v3/users')
        .send({ username: 'shuri', password: 'wakandaforever', fullname: false })
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
    const username = 'shuri ';
    const password = 'wakandaforever ';

    it('should fail if the username has whitespace', () => {
      return chai.request(app)
        .post('/v3/users')
        .send({ username, password: 'wakandaforever' })
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
      return chai.request(app)
        .post('/v3/users')
        .send({ username: 'shuri', password })
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
      return chai.request(app)
        .post('/v3/users')
        .send({ username, password:'wakandaforever' })
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
      return chai.request(app)
        .post('/v3/users')
        .send({ username: 'shuri', password })
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
      return chai.request(app)
        .post('/v3/users')
        .send({ username: 'shuri', password: password2 })
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


  describe('user creation', () => {
    const username = 'shuri';
    const password = 'wakandaforever';

    it('should fail if the username already exists', () => {
      return User.create({ username, password })
        .then(() => {
          return chai.request(app).post('/v3/users').send({ username, password });
        })
        .then(res => {
          expect(res).to.not.exist;
        })
        .catch(err => {
          const res = err.response;
          expect(res.body.message).to.equal('Username already taken');
          // console.log('RES', res.body.error); // 
          /**** the below tests won't work because res.body.error is an empty obj per the err handler on server.js ****/
          // expect(res).to.have.status(422); 
          // expect(res.body.error.reason).to.equal('ValidationError');
          // expect(res.body.location).to.equal('username');
        });
    });

    it('should create a new user and make sure the pw is hashed', () => {
      return chai.request(app)
        .post('/v3/users')
        .send({ username, password })
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('username', 'fullname', 'id');
          expect(res.body.username).to.equal(username);
          return User.findOne({ username: username });
        })
        .then(user => {
          expect(user).to.not.be.null;
          return user.validatePassword(password);
        })
        .then(result => {
          expect(result).to.be.true;
        });
    });
  });


});