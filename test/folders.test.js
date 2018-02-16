'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const mongoose = require('mongoose');
const seedFolders = require('../db/seed/folders.json');
const Folder = require('../models/folder.model');
const expect = chai.expect;

const { TEST_MONGODB_URI } = require('../config.js');

chai.use(chaiHttp);
chai.use(chaiSpies);



/* ========== TESTING HOOKS ========== */
before(function () {
  return mongoose.connect(TEST_MONGODB_URI, { autoIndex: false });
});

beforeEach(function () {
  return Folder.insertMany(seedFolders);
});

afterEach(function () {
  return mongoose.connection.db.dropDatabase();
});

after(function () {
  return mongoose.disconnect();
});



/* ========== ROUTE TESTS ========== */
describe('DB and API tests for folders.routes.js', () => {

  describe('GET methods /v3/folders', () => {

    it('should return all folders', () => {
      const dbPromise = Folder.find(); // connects straight to the db and pulls data
      const apiPromise = chai.request(app)
        .get('/v3/folders'); // connects to the db THROUGH the api to get data. if they don't match, something is wrong with the api(routes)

      return Promise.all([dbPromise, apiPromise])
        .then(([dbData, apiRes]) => {
          expect(apiRes).to.have.status(200);
          expect(apiRes).to.be.json;
          expect(apiRes.body).to.be.an('array');
          expect(apiRes.body.length).to.equal(dbData.length);
          apiRes.body.forEach( note => expect(note).to.have.keys('name', 'id'));
        });
    });

  });


  describe('GET by id /v3/folders/:id', () => {

    it('should return one folder', () => {
      
      let dbData;

      return Folder.findOne()
        .then( folder => {
          dbData = folder;
          return chai.request(app)
            .get(`/v3/folders/${dbData.id}`);
        })
        .then( apiRes => {
          expect(apiRes).to.be.json;
          expect(apiRes).to.have.status(200);
          expect(apiRes.body).to.be.an('object');
          expect(apiRes.body).to.have.keys('name', 'id');

          expect(apiRes.body.name).to.equal(dbData.name);
          expect(apiRes.body.id).to.equal(dbData.id);
        });
    });

    it('should return a 400 error for an invalid ID', function () {
      const spy = chai.spy();

      return chai.request(app)
        .get('/v3/folders/1908')
        .then(spy)
        .then( () => expect(spy).to.have.not.been.called() )
        .catch(err => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Please input a proper id');
        });

    });

    it('should return a 404 error for a nonexistent ID', function () {

    });

  });


  describe('POST methods /v3/folders', () => {

    it('should create one folder', () => {
     
    });

    it('should return an error when missing the `name` property', () => {
      
    });

  });


  describe('PUT methods /v3/folders/:id', () => {

    it('should update the folder name', () => {
      
    });

    it('should respond with a 400 for a nonexistent id', () => {
      
    });

    it('should return 404 when missing the `name` property', () => {
      
    });

    it('should return 400 when the folder name already exists', () => {

    });

  });


  describe('DELETE methods /v3/folders/:id', () => {

    it('should delete an item by id', () => {
      
    });

    it('should respond with a 400 for an invalid id', () => {
      
    });

  });

});