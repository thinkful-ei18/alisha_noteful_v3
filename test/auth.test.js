'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const expect = chai.expect;
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRY, TEST_MONGODB_URI } = require('../config');

chai.use(chaiHttp);

const user = {
  'username': 'shuri',
  'password': 'wakandaforever'
};


/* ========== TESTING HOOKS ========== */

before(function () {
  return mongoose.connect(TEST_MONGODB_URI, { autoIndex: false });
});

beforeEach(function () { 
  return User.hashPassword(user.password).then( hashedUser =>
    User.create(user)
  );
});

afterEach(function () {
  return User.remove();
});

after(function () {
  return mongoose.disconnect();
});


/* ========== ROUTE TESTS ========== */
describe('authenticated routes', () => {

  describe('/v3/refresh', () => {

    it('should update the expiry date on the token', () => {
      const authToken = jwt.sign({ user }, JWT_SECRET, {
        algorithm: 'HS256',
        subject: user.username,
        expiresIn: JWT_EXPIRY
      });

      const decoded = jwt.decode(authToken);

      return chai.request(app)
        .post('/v3/refresh')
        .set({ 'Authorization': `Bearer ${authToken}` })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const authToken = res.body.authToken;
          expect(authToken).to.be.a('string');
          const payload = jwt.verify(authToken, JWT_SECRET, {
            algorithm: ['HS256']
          });
          expect(payload.user).to.deep.equal(user);
          expect(payload.exp).to.be.at.least(decoded.exp);
        });
    });

    it('should fail without a valid token', () => {

    });

    it('should fail with an expired token', () => {

    });

  });
  

  describe('/v3/login', () => {

    it('should login with a proper un/pw', () => {

    });

    it('should fail without a proper username', () => {

    });

    it('should fail without a proper password', () => {

    });

    it('should create a token upon login', () => {

    });

  });


});