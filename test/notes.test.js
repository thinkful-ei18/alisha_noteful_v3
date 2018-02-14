'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const seedNotes = require('../db/seed/notes.json');
const mongoose = require('mongoose');
const { TEST_MONGODB_URI } = require('../config.js');
const expect = chai.expect;
const Note = require('../models/note');


chai.use(chaiHttp);
chai.use(chaiSpies);

describe('testing hooks', () => {
  before(function() {
    return mongoose.connect(TEST_MONGODB_URI, { autoIndex: false });
  });

  beforeEach(function () {
    return Note.insertMany(seedNotes)
      .then(() => Note.ensureIndexes());
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });


  describe('GET methods', () => {
    it('', () => {

    });
  });

  describe('POST methods', () => {
    it('', () => {

    });
  });

  describe('PUT methods', () => {
    it('', () => {

    });
  });

  describe('DELETE methods', () => {
    it('', () => {

    });
  });

});