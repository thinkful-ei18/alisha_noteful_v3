'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Note = require('../models/note.model');
const Folder = require('../models/folder.model');



/* ========== GET/READ ALL ITEM ========== */
router.get('/folders', (req, res, next) => {
  const userId = req.user.id;

  Folder.find( {userId} )
    .sort('name')
    .then( folders => res.json(folders) )
    // .catch( err => next(err)); // this is the longer way of writing out the code below
    .catch(next);


});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/folders/:id', (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) { // // mongoose requires ID's to be 16 characters. anything else will trigger this error. i.e. 'abc123'
    const err = new Error('Please input a proper id');
    err.status = 400;
    return next(err);
  }

  Folder.findById(req.params.id)
    .then( folder => {
      if (folder === null) { // i.e. '111111111111111111111105'. the format is right, but it doesn't match an id in the db
        const err = new Error('That id cannot be found');
        err.status = 404;
        return next(err);
      } 
      res.json(folder);
    })
    .catch(next);

});


/* ========== POST/CREATE AN ITEM ========== */
router.post('/folders', (req, res, next) => {
  const { name } = req.body;

  if(!name) {
    const err = new Error('This folder has no name!');
    err.status = 404;
    return next(err); 
  }

  Folder.create( {name} )
    .then( folder => {
      res.location(`${req.originalUrl}/${folder.id}`)
        .status(201)
        .json(folder);
    })
    .catch( err => {
      if (err.code === 11000) {
        err = new Error('That folder name already exists');
        err.status = 400;
      }
      next(err);
    });

});


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/folders/:id', (req, res, next) => {
  
  const id = req.params.id;
  const { name } = req.body;
  console.log('NAME', name);
  console.log('ID', id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Please input a proper id in order to complete this change');
    err.status = 400;
    return next(err);
  }

  if (!name) {
    const err = new Error('This folder must have a name!');
    err.status = 404;
    return next(err);
  }

  Folder.findByIdAndUpdate( id, {name}, {new: true} )
    .then( folder => res.json(folder))
    .catch(next);

});


/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/folders/:id', (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('Please input a proper id in order to delete this folder');
    err.status = 400;
    return next(err);
  }

  // deletes folder AND associated notes
  Folder.findByIdAndRemove(id)
    .then( () => Note.deleteMany({folderId: id}) )
    .then( res.status(204).end() )
    .catch(next);

  // on delete, set Note.folderId to null
  // Folder.findByIdAndRemove(id)
  //   .then( id => {
  //     Note.updateMany({ folderId: id })
  //   })
  //   .then (
  //     if (/* the id matches the folder*/) {
  //       // delete
  //     }
  //   )
  //   .then(res.status(204).end())
  //   .catch(err => next(err));

  // restrict the delete if the folder contains notes

});

module.exports = router;