'use strict';

const express = require('express');
const router = express.Router();

const User = require('../models/user.model');



router.get('/users/:id', (req, res) => {

  return User.findById(req.params.id)
    .then(user => res.json(user.apiRepr()))
    .catch(err => res.status(500).json({ message: 'Internal server error' }));

});


router.post('/users', (req, res, next) => {

  // verify the required fields are present in the req.body
  const requiredFields = [ 'username', 'password' ];
  const missingField = requiredFields.find( field => !(field in req.body));

  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  // verify that each of the fields are a string
  const stringFields = [ 'username', 'password', 'fullname' ];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    const err = new Error(`Field: '${nonStringField}' must be type String`);
    err.status = 422;
    return next(err);
  }

  // verify that the un/pw don't have whitespace
  const mandatoryTrimmedFields = ['username', 'password'];
  const nonTrimmedField = mandatoryTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    const err = new Error(`Field: '${nonTrimmedField}' cannot start or end with whitespace`);
    err.status = 422;
    return next(err);
  }

  // verify that the length of the un/pw meet the requirements
  const sizedFields = {
    username: { min: 1 },
    password: { min: 8, max: 72 } // bcrypt truncates after 72 characters
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] && // check the sizedFields key to see if it has the 'min' key
      req.body[field].trim().length < sizedFields[field].min 
  );

  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField) {
    const min = sizedFields[tooSmallField].min;
    const err = new Error(`Field: '${tooSmallField}' must be at least ${min} characters long`);
    err.status = 422;
    return next(err);
  }

  if (tooLargeField) {
    const max = sizedFields[tooLargeField].max;
    const err = new Error(`Field: '${tooSmallField}' must be at most ${max} characters long`);
    err.status = 422;
    return next(err);
  }
  
  let { fullname = '', username, password } = req.body;
  fullname = fullname.trim(); // trim the name if there's whitespace
  

  return User.find({ username })
    .count()
    .then( count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return User.hashPassword(password);
    })
    .then(digest => {
      return User.create({
        username,
        password: digest,
        fullname
      });
    })
    .then(user => res.status(201).location(`/v3/users/${user.id}`).json(user.apiRepr())
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });

});


module.exports = router;