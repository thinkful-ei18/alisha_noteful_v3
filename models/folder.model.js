'use strict';

const mongoose = require('mongoose');

const folderSchema = mongoose.Schema({
  name: { 
    type: String, 
    unique: true // https://docs.mongodb.com/manual/core/index-unique/
  } 
});

// http://mongoosejs.com/docs/guide.html#toObject
folderSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Folder = mongoose.model('Folder', folderSchema);

module.exports = Folder;