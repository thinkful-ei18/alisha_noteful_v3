'use strict';

const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
  title: String,
  content: String,
  created: { type: Date, default: Date.now() }
});

const Note = mongoose.model('Note', noteSchema);

noteSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = Note;