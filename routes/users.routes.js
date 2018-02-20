'use strict';

const express = require('express');
const router = express.Router();

const User = require('../models/user.model');



router.post('/users', (req, res, next) => {
  const { fullname, username, password } = req.body;

  if (!username || !password) {
    const err = new Error('Please include a username and password');
    err.status = 404;
    return next(err);
  }
  
  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        fullname
      };
      return User.create(newUser);
    })
    .then(user => res.status(201).location(`/v3/users/${user.id}`).json(user))
    .catch( err => {
      if (err.code === 11000) {
        err = new Error('That username already exists');
        err.status = 400;
      }
      next(err);
    });





  // User.create( {fullname, username, password} )
  //   .then( user => res.json(user).status(201).location(`${req.originalUrl}/${user.id}`))
  //   .catch(next);
});


module.exports = router;