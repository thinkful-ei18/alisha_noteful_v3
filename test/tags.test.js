'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const mongoose = require('mongoose');
const seedTags = require('../db/seed/tags.json');
const Tag = require('../models/tag.model');
const expect = chai.expect;

const { TEST_MONGODB_URI } = require('../config.js');

chai.use(chaiHttp);
chai.use(chaiSpies);



/* ========== TESTING HOOKS ========== */
before(function () {
  return mongoose.connect(TEST_MONGODB_URI, { autoIndex: false });
});

beforeEach(function () {
  return Tag.insertMany(seedTags);
});

afterEach(function () {
  return mongoose.connection.db.dropDatabase();
});

after(function () {
  return mongoose.disconnect();
});



/* ========== ROUTE TESTS ========== */
describe('DB and API tests for tags.routes.js', () => {

  describe('GET ALL /v3/tags', () => {

    it('should return all tags', () => {
      const dbPromise = Tag.find(); // connects straight to the db and pulls data
      const apiPromise = chai.request(app)
        .get('/v3/tags'); // connects to the db THROUGH the api to get data. if they don't match, something is wrong with the api(routes)

      return Promise.all([dbPromise, apiPromise])
        .then(([dbData, apiRes]) => {
          expect(apiRes).to.have.status(200);
          expect(apiRes).to.be.json;
          expect(apiRes.body).to.be.an('array');
          expect(apiRes.body.length).to.equal(dbData.length);
          apiRes.body.forEach(note => expect(note).to.have.keys('name', 'id'));
        });
    });

  });


  describe('GET by id /v3/tags/:id', () => {

    it('should return one tag', () => {

      let dbData;

      return Tag.findOne()
        .then(tag => {
          dbData = tag;
          return chai.request(app)
            .get(`/v3/tags/${dbData.id}`);
        })
        .then(apiRes => {
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
        .get('/v3/tags/1908')
        .then(spy)
        .then(() => expect(spy).to.have.not.been.called())
        .catch(err => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Please input a 12 or 24 character length id');
        });

    });

    it('should return a 404 error for a nonexistent ID', function () {
      const spy = chai.spy();

      return chai.request(app)
        .get('/v3/tags/111111111111111111111105')
        .then(spy)
        .then(() => expect(spy).to.have.not.been.called())
        .catch(err => {
          const res = err.response;
          expect(res).to.have.status(404);
          expect(res.body.message).to.equal('That id cannot be found');
        });
    });

  });


  describe('POST methods /v3/tags', () => {

    it('should create one tag', () => {
      const createTag = { name: 'Epsilon' };
      let tag;

      return Tag.create(createTag)
        .then(dbData => {
          tag = dbData;
          return chai.request(app)
            .post('/v3/tags')
            .send(createTag);
        })
        .then(apiRes => {
          expect(apiRes).to.be.json;
          expect(apiRes).to.have.status(201);
          expect(apiRes.body).to.be.an('object');
          expect(apiRes.body).to.have.keys('name', 'id');

          expect(apiRes.body.name).to.equal(tag.name);
        });
    });

    it('should return an error when missing the `name` property', () => {
      const createTag = { name: '' };
      const spy = chai.spy();

      return chai.request(app)
        .post('/v3/tags')
        .send(createTag)
        .then(spy)
        .then(() => expect(spy).to.have.not.been.called())
        .catch(err => {
          const res = err.response;
          expect(res.body.message).to.equal('All tags must have a name');
          expect(res).to.have.status(404);
        });
    });

  });


  describe('PUT methods /v3/tags/:id', () => {

    it('should update the folder name', () => {
      const createTag = { name: 'Zeta' };
      let tag;

      return Tag.findOne()
        .then(dbData => {
          tag = dbData;
          return chai.request(app)
            .put(`/v3/tags/${tag.id}`)
            .send(createTag);
        })
        .then(apiRes => {
          expect(apiRes).to.have.status(200);
          expect(apiRes).to.be.json;
          expect(apiRes.body).to.be.an('object');
          expect(apiRes.body).to.have.keys('name', 'id');

          expect(apiRes.body.id).to.equal(tag.id);
        });
    });

    it('should respond with a 400 for a nonexistent id', () => {
      const createTag = { name: 'Zeta' };
      const spy = chai.spy();

      return chai.request(app)
        .put('/v3/tags/1908')
        .send(createTag)
        .then(spy)
        .then(spy => expect(spy).to.have.not.been.called())
        .catch(err => {
          let res = err.response;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Please input a 12 or 24 character length id');
        });

    });

    it('should return 404 when missing the `name` property', () => {
      const spy = chai.spy();
      const createTag = { name: '' };

      return Tag.findOne()
        .then(dbData => {
          return chai.request(app)
            .put(`/v3/tags/${dbData.id}`)
            .send(createTag);
        })
        .then(spy)
        .then(spy => expect(spy).to.have.not.been.called())
        .catch(err => {
          let res = err.response;
          expect(res).to.have.status(404);
          expect(res.body.message).to.equal('All tags must have a name');
        });

    });

  });


  describe('DELETE methods /v3/tags/:id', () => {

    it('should delete an item by id', () => {

      return Tag.findOne()
        .then(dbData => {
          return chai.request(app)
            .delete(`/v3/tags/${dbData.id}`);
        })
        .then(apiRes => {
          expect(apiRes).to.have.status(204);
        });
    });

    it('should respond with a 400 for an invalid id', () => {
      const spy = chai.spy();

      return chai.request(app)
        .delete('/v3/tags/1908')
        .then(spy)
        .then(spy => expect(spy).to.have.not.been.called())
        .catch(err => {
          let res = err.response;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Please input a 12 or 24 character length id');
        });
    });

  });

});