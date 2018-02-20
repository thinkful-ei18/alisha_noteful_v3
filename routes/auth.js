'use strict';

const express = require('express');
const router = express.Router();
const options = { session: false, failWithError: true };
const passport = require('passport');
const localAuth = passport.authenticate('local', options);

router.post('/login', localAuth, (req, res) => {
  return res.json(req.user);
  
});