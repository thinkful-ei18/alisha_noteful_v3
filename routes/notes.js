'use strict';

const express = require('express');
// Create an router instance (aka "mini-app")
const router = express.Router();
const mongoose = require('mongoose');

const Note = require('../models/note');
//

/* ========== GET/READ ALL ITEM ========== */
router.get('/notes', (req, res, next) => {

  const { searchTerm } = req.query;

  let filter = {};
  let projection = {};
  let sort = {created: -1}; // default sorting

  if (searchTerm) {
    filter.$text = { $search: searchTerm };
    projection.score = { $meta: 'textScore' };
    sort = projection;
  }
  
  Note.find(filter, projection)
    .select('title created')
    .sort(sort)
    .then(notes => {
      res.json(notes);
    })
    .catch(err => next(err));

});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findById(req.params.id)
    .then( note => res.json(note) )
    .catch(err => next(err));

});


/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {

  const { title, content } = req.body;

  if (!title || !content) {
    const err = new Error('Missing `title` or `content` in request body'); 
    err.status = 400; 
    return next(err); 
  }

  Note.create( { title, content } )
    .then( note => res.json(note))
    .catch(err => next(err));

});


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {

  const { title, content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error (`Request path id: (${req.params.id}) doesn't exist.`);
    err.status = 400;
    return next(err);
  }

  if (!title || !content) {
    const err = new Error('Missing `title` or `content` in request body');
    err.status = 400;
    return next(err);
  }  

  const updatedNote = { title, content, created: Date.now() };

  Note.findByIdAndUpdate(req.params.id, updatedNote, {new: true} )
    .then( note => {
      res.json(note).status(204).end();
    })
    .catch( err => next(err));

});


/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error('Request path id doesn\'t exist.');
    err.status = 404;
    return next(err);
  }  

  Note.findByIdAndRemove(req.params.id)
    .then( res.status(204).end() )
    .catch(err => next(err));
});

module.exports = router;