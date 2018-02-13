'use strict';

const mongoose = require('mongoose');
// mongoose.Promise = global.Promise;

// const { PORT, MONGODB_URI } = require('.config');


const notesSchema = mongoose.Schema({
  title: String,
  content: String,
  create: Date.now
});

const note = mongoose.model('note', notesSchema);

module.exports = note;