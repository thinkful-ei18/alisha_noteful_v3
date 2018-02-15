'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// const Note = require('../models/note.model');
const Folder = require('../models/folder.model');



/* ========== GET/READ ALL ITEM ========== */
router.get('/folders', (req, res, next) => {

  Folder.find()
    .sort('name')
    .then( folders => {
      res.json(folders);
    })
    .catch( err => next(err));

});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/folders/:id', (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Folder.findById(req.params.id)
    .then( note => res.json(note))
    .catch( err => next(err));

});


/* ========== POST/CREATE AN ITEM ========== */
router.post('/folders', (req, res, next) => {

  

});


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/folders/:id', (req, res, next) => {



});


/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/folders/:id', (req, res, next) => {



});

module.exports = router;