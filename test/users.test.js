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

  const username = 'steph30';
  const password = 'dubnation';
  const fullName = 'Stephen Curry';

  describe('verify the required fields are present in the req.body', () => {

    it('should fail without a username', () => {

    });

    it('should fail without a password', () => {

    });

  });


  describe('verify that each of the fields are a string', () => {

    it('should fail if the username is not a string', () => {

    });

    it('should fail if the password is not a string', () => {

    });

    it('should fail if the fullname is not a string', () => {

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