'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema ({
  name: {
    type: String,
    unique: true
  }
});

// http://mongoosejs.com/docs/guide.html#toObject
tagSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;