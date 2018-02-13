'use strict';

const express = require('express');
// Create an router instance (aka "mini-app")
const router = express.Router();
const mongoose = require('mongoose');

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
    .catch(err => next(err));

});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {

  Note.findById(req.params.id)
    .then( note => res.json(note) )
    .catch(err => next(err));

});


/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {

  const { title, content } = req.body;

  if (!title || !content) {
    const message = 'Missing `title` or `content` in request body';
    console.error(message);
    return res.status(400).send(message);
  }

  Note.create( { title, content } )
    .then( note => res.json(note))
    .catch(err => next(err));

});


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {

  const { title, content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const message = (
      `Request path id: (${req.params.id}) doesn't exist.`);
    console.error(message);
    return res.status(400).json({ message: message });
  }

  if (!title || !content) {
    const message = 'Missing `title` or `content` in request body';
    console.error(message);
    return res.status(400).send(message);
  }  

  const updatedNote = { title, content, create: Date };

  Note.findByIdAndUpdate(req.params.id, updatedNote, {new: true} )
    .then( note => res.json(note).status(204).end())
    .catch( err => next(err));

});


/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {

  Note.findByIdAndRemove(req.params.id)
    .then( note => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;