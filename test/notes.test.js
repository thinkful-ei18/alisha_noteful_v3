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

    it('should return all notes', () => {
      const dbPromise = Note.find();
      const apiPromise = chai.request(app).get('/v3/notes');

      return Promise.all([dbPromise, apiPromise])
        .then( ([dbData, apiRes]) => {
          expect(apiRes).to.have.status(200);
          expect(apiRes).to.be.json;
          expect(apiRes.body).to.be.a('array');
          expect(apiRes.body).to.have.length(dbData.length);
        });
    });

    it('should return one note', () => {
      let dbData;

      return Note.findOne().select('id title content')
        .then( result => {
          dbData = result;
          return chai.request(app).get(`/v3/notes/${dbData.id}`);
        })
        .then( apiRes => {
          expect(apiRes).to.have.status(200);
          expect(apiRes).to.be.json;
          expect(apiRes.body).to.be.a('object');
          expect(apiRes.body).to.have.keys('title', 'content', 'id', 'created');

          expect(apiRes.body.id).to.equal(dbData.id);
          expect(apiRes.body.title).to.equal(dbData.title);
          expect(apiRes.body.content).to.equal(dbData.content);
        });
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