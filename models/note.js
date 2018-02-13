'use strict';

const mongoose = require('mongoose');

const notesSchema = mongoose.Schema({
  title: String,
  content: String,
  create: Date
});

const Note = mongoose.model('Note', notesSchema);

module.exports = Note;