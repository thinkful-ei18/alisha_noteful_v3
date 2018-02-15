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
      
    });

  });


  describe('GET by id /v3/folders/:id', () => {

    it('should return one folder', () => {
      
    });

    it('should return a 400 error for an invalid ID', function () {
      
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