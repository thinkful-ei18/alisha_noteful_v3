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
      const spy =chai.spy();

      return chai.request(app)
        .get('/v3/folders/111111111111111111111105')
        .then(spy)
        .then(() => expect(spy).to.have.not.been.called())
        .catch(err => {
          const res = err.response;
          expect(res).to.have.status(404);
          expect(res.body.message).to.equal('That id cannot be found');
        });
    });

  });


  describe('POST methods /v3/folders', () => {

    it('should create one folder', () => {
      const createFolder = { name: 'Boop' };
      let folder;

      return Folder.create(createFolder)
        .then ( dbData => {
          folder = dbData;
          return chai.request(app)
            .post('/v3/folders')
            .send(createFolder);
        })
        .then( apiRes => {
          expect(apiRes).to.be.json;
          expect(apiRes).to.have.status(201);
          expect(apiRes.body).to.be.an('object');
          expect(apiRes.body).to.have.keys('name', 'id');

          expect(apiRes.body.name).to.equal(folder.name);
        });
    });

    it('should return an error when missing the `name` property', () => {
      const createFolder = { name: '' };
      const spy = chai.spy();

      return chai.request(app)
        .post('/v3/folders')
        .send(createFolder)
        .then(spy)
        .then (() => expect(spy).to.have.not.been.called())
        .catch( err => {
          const res = err.response;
          expect(res.body.message).to.equal('This folder has no name!');
          expect(res).to.have.status(404);
        });
    });

  });


  describe('PUT methods /v3/folders/:id', () => {

    it('should update the folder name', () => {
      const createFolder = { name: 'Whoop' };
      let folder;

      return Folder.findOne()
        .then(  dbData => {
          folder = dbData;
          return chai.request(app)
            .put(`/v3/folders/${folder.id}`)
            .send(createFolder);
        })
        .then( apiRes => {
          expect(apiRes).to.have.status(200); 
          expect(apiRes).to.be.json;
          expect(apiRes.body).to.be.an('object');
          expect(apiRes.body).to.have.keys('name', 'id');

          expect(apiRes.body.id).to.equal(folder.id);
        });
    });

    it('should respond with a 400 for a nonexistent id', () => {
      const createFolder = { name: 'Whoop' };
      const spy = chai.spy();

      return chai.request(app)
        .put('/v3/folders/1908')
        .send(createFolder)
        .then(spy)
        .then( spy => expect(spy).to.have.not.been.called())
        .catch( err => {
          let res = err.response;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Please input a proper id in order to complete this change');
        });

    });

    it('should return 404 when missing the `name` property', () => {
      const spy = chai.spy();
      const createFolder = { name: '' };

      return Folder.findOne()
        .then(dbData => {
          return chai.request(app)
            .put(`/v3/folders/${dbData.id}`)
            .send(createFolder);
        })
        .then(spy)
        .then(spy => expect(spy).to.have.not.been.called())
        .catch( err => {
          let res = err.response;
          expect(res).to.have.status(404);
          expect(res.body.message).to.equal('This folder must have a name!');
        });
      
    });

  });


  describe('DELETE methods /v3/folders/:id', () => {

    it('should delete an item by id', () => {
      
      return Folder.findOne()
        .then( dbData => {
          return chai.request(app)
            .delete(`/v3/folders/${dbData.id}`);
        })
        .then( apiRes => {
          expect(apiRes).to.have.status(204);
        });
    });

    it('should respond with a 400 for an invalid id', () => {
      const spy = chai.spy();

      return chai.request(app)
        .delete('/v3/folders/1908')
        .then(spy)
        .then(spy => expect(spy).to.have.not.been.called())
        .catch(err => {
          let res = err.response;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Please input a proper id in order to delete this folder');
        });
    });

  });

});