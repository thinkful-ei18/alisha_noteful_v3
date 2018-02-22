'use strict';

const express = require('express');
// Create an router instance (aka "mini-app")
const router = express.Router();
const mongoose = require('mongoose');

const Note = require('../models/note.model');


/* ========== GET/READ ALL ITEM ========== */
router.get('/notes', (req, res, next) => {

  const { searchTerm, folderId } = req.query;
  
  let filter = {};
  let projection = {};
  let sort = {created: -1}; // default sorting

  if (folderId) { 
    filter.folderId = folderId;
  } 

  if (searchTerm) {
    filter.$text = { $search: searchTerm };   // https://docs.mongodb.com/manual/reference/operator/query/text/
    projection.score = { $meta: 'textScore' }; // https://docs.mongodb.com/manual/reference/operator/projection/meta/
    sort = projection;
  }
  
  Note.find(filter, projection)
    .select('title created folderId tags userId')
    .populate('tags folderId')
    .sort(sort)
    .then(notes => {
      res.json(notes);
    })
    .catch(err => next(err));

});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findOne( {_id: id, userId} )
    .select('title content created folderId tags')
    .populate('tags folderId')
    .then( note => {
      if (note === null) {
        next();
      }
      res.json(note); 
    })
    .catch(next);

});


/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {

  const { title, content, folderId, tags } = req.body;
  const  userId  = req.user.id;

  if (!title || !content) {
    const err = new Error('Missing `title` or `content` in request body'); 
    err.status = 400; 
    return next(err); 
  }

  Note.create( { title, content, folderId, tags, userId } )
    .then( note => res.json(note))
    .catch(err => next(err));

});


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {

  const { title, content, folderId, tags } = req.body;
  const { id } = req.params;
  const userId = req.user.id;

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

  const updatedNote = { 
    title, 
    content, 
    folderId, 
    tags,
    userId,
    created: Date.now() 
  };

  Note.findOneAndUpdate( { _id: id} , updatedNote, {new: true} )
    .then( note => {

      if (note.userId.toString() !== userId) {
        const err = new Error('You don\'t have permission to update this note');
        err.status = 400;
        return next(err);
      }
      res.json(note).status(204).end();
    })
    .catch(next);

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