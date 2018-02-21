'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  fullname: { type : String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true}
});

// http://mongoosejs.com/docs/guide.html#methods
userSchema.methods.apiRepr = function () {
  return {
    id: this.id,
    username: this.username,
    fullname: this.fullname
  };
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// http://mongoosejs.com/docs/guide.html#statics
userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

// http://mongoosejs.com/docs/guide.html#toObject
// userSchema.set('toObject', {
//   transform: function (doc, ret) {
//     ret.id = ret._id;
//     delete ret._id;
//     delete ret.__v;
//     delete ret.password;
//   }
// });

const User = mongoose.model('User', userSchema);

module.exports = User;