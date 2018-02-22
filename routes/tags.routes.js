'use strict';

const express = require('express'); // the server connects to my routes through Router, so I have to access express
const router = express.Router(); // now I can use the router
const mongoose = require('mongoose'); // and access my db

const Tag = require('../models/tag.model'); // the collection I'll be referencing
const Note = require('../models/note.model');


/* ========== GET/READ ALL ITEM ========== */
router.get('/tags', (req, res, next) => {
  const userId = req.user.id;

  Tag.find( {userId} )
    .sort('name')
    .then( tags => res.json(tags))
    .catch(next);

});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/tags/:id', (req, res, next) => {
  
  const id = req.params.id; 

  if (!mongoose.Types.ObjectId.isValid(id)) { // mongoose requires ID's to be 12 or 24 characters. anything else will trigger this error.
    const err = new Error('Please input a 12 or 24 character length id');
    err.status = 400;
    return next(err);
  }

  Tag.findById(id)
    .then( tag => {
      if (tag === null) {
        const err = new Error('That id cannot be found');
        err.status = 404;
        return next(err);
      }
      res.json(tag).status(200);
    })
    .catch(next);

});


/* ========== POST/CREATE AN ITEM ========== */
router.post('/tags', (req, res, next) => {

  const { name } = req.body;

  if (!name) {
    const err = new Error('All tags must have a name');
    err.status = 404;
    return next(err);
  }

  Tag.create( {name} )
    .then( tag => res.location(`${req.originalUrl}/${tag.id}`).status(201).json(tag))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('That tag name already exists');
        err.status = 400;
      }
      next(err);
    });

});


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/tags/:id', (req, res, next) => {

  const id = req.params.id;
  const { name } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Please input a 12 or 24 character length id');
    err.status = 400;
    return next(err);
  }

  if (!name) {
    const err = new Error('All tags must have a name');
    err.status = 404;
    return next(err);
  }

  Tag.findByIdAndUpdate(id, {name}, {new: true})
    .then( tag => {
      if (tag === null) {
        const err = new Error('That id cannot be found');
        err.status = 404;
        return next(err);
      }

      res.json(tag).status(200);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('That tag name already exists');
        err.status = 400;
      }
      next(err);
    });

});


/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/tags/:id', (req, res, next) => {
  
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Please input a 12 or 24 character length id');
    err.status = 400;
    return next(err);
  }
  
  const removeTagPromise = Tag.findByIdAndRemove(id);
  const removeTagFromNotesPromise = Note.updateMany( {tags: id}, {$pull: {tags: id}} );

  return Promise.all([removeTagPromise, removeTagFromNotesPromise])
    .then(
      ([tagResult]) => {
        if (!tagResult) {
          const err = new Error('That id cannot be found');
          err.status = 404;
          return next(err);
        }
        res.status(204).end();
      })
    .catch(next);

});


module.exports = router; // expose the routes