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
  
  User.create( {fullname, username, password} )
    .then( user => res.json(user).status(201).location(`${req.originalUrl}/${user.id}`))
    .catch(next);
});


module.exports = router;