'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const mongoose = require('mongoose');
const seedNotes = require('../db/seed/notes.json');
const Note = require('../models/note.model');
const expect = chai.expect;

const { TEST_MONGODB_URI } = require('../config.js');

chai.use(chaiHttp);
chai.use(chaiSpies);



/* ========== TESTING HOOKS ========== */
before(function () {
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



/* ========== ROUTE TESTS ========== */
describe('DB and API tests for notes.js', () => {

  describe('GET methods /v3/notes', () => {

    it('should return unsearched notes list', () => {
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

    it('should return the notes resulting from a search', () => {
      let term = 'ways';

      const dbPromise = Note.find(
        { $text: { $search: term } },
        { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } });
      const apiPromise = chai.request(app)
        .get(`/v3/notes?searchTerm=${term}`);

      return Promise.all([dbPromise, apiPromise])
        .then(([dbData, apiRes]) => {
          expect(apiRes).to.have.status(200);
          expect(apiRes).to.be.json;
          expect(apiRes.body).to.be.an('array');
          expect(apiRes.body.length).to.equal(dbData.length);
        });
    });

  });


  describe('GET by id /v3/notes/:id', () => {

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

    it('should return a 400 error for the wrong ID', function () {
      const badId = '1908';
      const spy = chai.spy();

      return chai.request(app).get(`/v3/notes/${badId}`)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch( err => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });

  });


  describe('POST methods /v3/notes', () => {

    it('should post one note', () => {
      let createdNote = {
        title: 'amazing grace',
        content: 'how sweet the sound'
      };

      let note;
      return Note.create(createdNote)
        .then( dbData => {
          note = dbData;
          return chai.request(app).get(`/v3/notes/${dbData.id}`);
        })
        .then( apiRes => {
          expect(apiRes).to.have.status(200);
          expect(apiRes).to.be.json;
          expect(apiRes.body).to.be.a('object');
          expect(apiRes.body).to.have.keys('title', 'content', 'id', 'created');

          expect(apiRes.body.id).to.equal(note.id);
          expect(apiRes.body.title).to.equal(note.title);
          expect(apiRes.body.content).to.equal(note.content);
        });
    });

    it('should return an error when missing the `title` or `content` properties', () => {
      const invalidNote = {
        'title': 'just one!'
      };
      const spy = chai.spy();

      return chai.request(app).post('/v3/notes/')
        .send(invalidNote)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch(err => {
          const res = err.response;
          expect(res).to.be.json;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Missing `title` or `content` in request body');
        });
    });

  });


  describe('PUT methods /v3/notes/:id', () => {

    it('should update the note', () => {
      const updateNote = {
        'title': 'that saved a wretch like me',
        'content': 'I once was lost, but now am found'
      };
    
      let note;

      return Note.findOne()
        .then(dbData => {
          note = dbData;
          return chai.request(app)
            .put(`/v3/notes/${note.id}`)
            .send(updateNote);
        })
        .then(apiRes => {
          expect(apiRes).to.have.status(200);
          expect(apiRes).to.be.json;
          expect(apiRes.body).to.be.a('object');
          expect(apiRes.body).to.have.keys('title', 'content', 'id', 'created');

          expect(apiRes.body.id).to.equal(note.id);
          expect(apiRes.body.title).to.equal(updateNote.title);
          expect(apiRes.body.content).to.equal(updateNote.content);
        });
    });

    it('should respond with a 400 for an invalid id', () => {
      const badId = '1908';
      const updateNote = {
        'title': 'that saved a wretch like me',
        'content': 'I once was lost, but now am found'
      };
      const spy = chai.spy();

      return chai.request(app)
        .put(`/v3/notes/${badId}`)
        .send(updateNote)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch(err => {
          expect(err).to.have.status(400);
          expect(err.response.body.message).to.equal(`Request path id: (${badId}) doesn't exist.`);
        });
    });

    it('should return an error when missing "title" or "content" properties', () => {
      const invalidNote = {
        'title': 'just one!'
      };
      const spy = chai.spy();

      return chai.request(app)
        .put('/v3/notes/000000000000000000000002')
        .send(invalidNote)
        .then(spy)
        .then(() => {
          expect(spy).to.not.have.been.called();
        })
        .catch(err => {
          expect(err).to.have.status(400);
          expect(err.response.body.message).to.equal('Missing `title` or `content` in request body');
        });    
    });

  });


  describe('DELETE methods /v3/note/:id', () => {

    it('should delete an item by id', () => {
      let note;

      return Note.findOne()
        .then( dbData => {
          note = dbData;
          return chai.request(app)
            .delete(`/v3/notes/${note.id}`);
        })
        .then(response => {
          expect(response).to.have.status(204);
        });
    });

    it('should respond with a 404 for an invalid id', () => {
      const spy = chai.spy();

      return chai.request(app)
        .delete('/v3/notes/1908')
        .then(spy)
        .then(() => {
          expect(spy).to.have.not.been.called();
        })
        .catch(err => {
          expect(err).to.have.status(404);
          expect(err.response.body.message).to.equal('Request path id doesn\'t exist.');
        });
    });

  });

});