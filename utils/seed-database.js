'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { MONGODB_URI } = require('../config');
const Note = require('../models/note.model');
const Folder = require('../models/folder.model');

const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');


mongoose.connect(MONGODB_URI)
  .then( () => {
    return mongoose.connection.db.dropDatabase()
      .then(result => {
        console.info(`Dropped Database: ${result}`);
      });
  })
  .then(() => {
    return Folder.insertMany(seedFolders)
      .then(results => {
        console.info(`Inserted ${results.length} Folders`);
      });
  })
  .then(() => {
    return Note.insertMany(seedNotes)
      .then(results => {
        console.info(`Inserted ${results.length} Notes`);
      });
  })
  .then(() => {
    return Note.createIndexes()
      .then(() => {
        console.info('Indexes created');
      });
  })
  .then(() => {
    return mongoose.disconnect()
      .then(() => {
        console.info('Disconnected');
      });
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });