'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema ({
  name: { type: String }, // https://docs.mongodb.com/manual/core/index-unique/
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

tagSchema.createIndex({ name: 1, userId: 1 }, { unique: true }); // https://docs.mongodb.com/v3.0/tutorial/create-a-compound-index/

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