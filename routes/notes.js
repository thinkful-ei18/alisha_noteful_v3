'use strict';

const express = require('express');
// Create an router instance (aka "mini-app")
const router = express.Router();

const Note = require('../models/note');


/* ========== GET/READ ALL ITEM ========== */
router.get('/notes', (req, res, next) => {

  const { searchTerm } = req.query;
  let filter = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.title = { $regex: re };
  }
  return Note.find(filter)
    .select('title content created')
    .sort('created')
    .then( note => {
      res.json(note);
    })
    .catch( err => next(err) );

});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {

  Note.findById(req.params.id)
    .then( note => res.json(note) )
    .catch(err => next(err) );

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {

  console.log('Create a Note');
  res.location('path/to/new/document').status(201).json({ id: 2 });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {

  console.log('Update a Note');
  res.json({ id: 2 });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {

  console.log('Delete a Note');
  res.status(204).end();

});

module.exports = router;