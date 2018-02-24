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

const username = 'shuri';
const password = 'wakandaforever';


/* ========== TESTING HOOKS ========== */

before(function () {
  return mongoose.connect(TEST_MONGODB_URI, { autoIndex: false });
});

beforeEach(function () { 
  return User.hashPassword(password).then( hashedPassword =>
    User.create({
      username,
      password
    })
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