'use strict';

const { Strategy: LocalStrategy } = require('passport-local'); // const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user.model');

const localStrategy = new LocalStrategy( (username, password, done) => {
 
  User.findOne({ username })
    .then(user => {
      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username',
          location: 'username'
        });
      }
      const isValid = user.validatePassword(password);
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect password',
          location: 'password'
        });
      }
      return done(null, user);
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return done(null, false);
      }

      return done(err);
    });
});

module.exports = localStrategy;
