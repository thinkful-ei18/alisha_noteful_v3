'use strict';

const express = require('express');
const router = express.Router();

const User = require('../models/user.model');



router.get('/users/:id', (req, res) => {

  return User.findById(req.params.id)
    .then(user => res.json(user.apiRepr()))
    .catch(err => res.status(500).json({ message: 'Internal server error' }));

});


router.post('/users', (req, res) => {

  // verify the required fields are present in the req.body
  const requiredFields = [ 'username', 'password' ];
  const missingField = requiredFields.find( field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  // verify that each of the fields are a string
  const stringFields = [ 'username', 'password', 'fullname' ];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  // verify that the un/pw don't have whitespace
  const mandatoryTrimmedFields = ['username', 'password'];
  const nonTrimmedField = mandatoryTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  // verify that the length of the un/pw meet the requirements
  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      max: 72 // bcrypt truncates after 72 characters
    }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] && // why this line?
      req.body[field].trim().length < sizedFields[field].min
  );

  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
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
    .then(user => res.status(201).location(`/v3/users/${user.id}`).json(user.apiRepr()))
    .catch( err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });

});


module.exports = router;