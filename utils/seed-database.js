'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { MONGODB_URI } = require('../config');
const Note = require('../models/note.model');
const Folder = require('../models/folder.model');
const Tag = require('../models/tag.model');


const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');
const seedTags = require('../db/seed/tags');



mongoose.connect(MONGODB_URI)
  .then( () =>  mongoose.connection.db.dropDatabase() )
  .then( () => {
    return Promise.all([
      Note.insertMany(seedNotes),
      Note.createIndexes(),
      Folder.insertMany(seedFolders),
      Folder.createIndexes(),
      Tag.insertMany(seedTags),
      Tag.createIndexes()
    ]);
  })
  .then( () => mongoose.disconnect() )
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });