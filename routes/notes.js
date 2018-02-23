'use strict';

const express = require('express');
// Create an router instance (aka "mini-app")
const router = express.Router();
const mongoose = require('mongoose');

const Note = require('../models/note.model');
const Folder = require('../models/folder.model');
const Tag = require('../models/tag.model');


/* ========== GET/READ ALL NOTES ========== */
router.get('/notes', (req, res, next) => {

  const { searchTerm, folderId } = req.query;
  const userId = req.user.id;

  let filter = { userId };
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
  
  Note.find( filter, projection )
    .select('title created folderId tags userId')
    .populate('tags folderId')
    .sort(sort)
    .then(notes => {
      res.json(notes);
    })
    .catch(err => next(err));

});


/* ========== GET/READ A SINGLE NOTE ========== */
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


/* ========== POST/CREATE A NOTE ========== */
router.post('/notes', (req, res, next) => {

  const { title, content, folderId, tags } = req.body;
  const  userId  = req.user.id;

  console.log('FID', folderId);

  if (!title || !content) {
    const err = new Error('Missing `title` or `content` in request body');
    err.status = 400;
    return next(err);
  }

  // Folder.find({ _id: folderId, userId })
  //   .count()
  //   .then( count => {
  //     if (count < 1) {
  //       const err = new Error('Invalid folder id');
  //       err.status = 404;
  //       next(err);
  //     }
  //   })
  //   .then( tags.map( tag => {
  //     return Tag.find({ _id: tag, userId });
  //   }) )
  //   .then ( result => {
  //     if (!result) {
  //       const err = new Error('Invalid tag id');
  //       err.status = 404;
  //       next(err);
  //     }
  //   })
  //   .catch(next);

  if (folderId) {
    Folder.find({ _id: folderId, userId })
      .count()
      .then(count => {
        if (count < 1) {
          const err = new Error('Invalid folder id');
          err.status = 404;
          next(err);
        }
      })
      .catch(next);
  }

  if (tags.length > 0) {
    tags.map( tag => {
      return Tag.find({ _id: tag, userId })
        .then( result => {
          console.log('RESULT', result);
          if (result.length < 1) {
            const err = new Error('Invalid tag id');
            err.status = 404;
            next(err);
          }
        })
        .catch(next);
    });
  }

  Note.create({ title, content, folderId, tags, userId })
    .then(note => res.json(note))
    .catch(err => next(err));

  // tags.map(tag => {
  //   console.log('TAG', tag);
  //   return Tag.find({ _id: tag, userId })
  //     .then(result => {
  //       console.log('RESULT', result);
  //       if (result.length < 1) {
  //         const err = new Error(`You can't use the tag id: ${tag.id}`);
  //         err.status = 404;
  //         next(err);
  //       }
  //     });
  // });

  // const verifyTag = tags.forEach( tag => { 
  //   return Tag.find({ _id: tag.id, userId });
  // })
  //   .then( result => {
  //     console.log('RESULT', result);
  //     if (result.length = tags.length) {
  //       return Promise.resolve('ok');
  //     } else {
  //       const err = new Error('This note cannot be created in this folder');
  //       err.status = 404;
  //       next(err);
  //     }
  //   })
  //   .catch(next)


  // const verifyTag = Tag.find({ userId })
  //   .then( tags => {
  //     tags.find(tag => )
  //     if (count === 1) {
  //       return Promise.resolve('ok');
  //     }
  //     else {
  //       const err = new Error('This note cannot be created in this folder');
  //       err.status = 404;
  //       next(err);
  //     }
  //   }).catch(next);

});


/* ========== PUT/UPDATE A SINGLE NOTE ========== */
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

  // Folder.find({ _id: folderId })
  //   .count()
  //   .then(count => {
  //     if (count === 1) {
  //       tags.forEach(tag => {
  //         if (!(Tag.find({ _id: tag.id, userId }))) {
  //           const err = new Error(`You can't use the tag id: ${tag.id}`);
  //           err.status = 404;
  //           next(err);
  //         }
  //       });
  //     } else {
  //       const err = new Error('This note cannot be created in this folder');
  //       err.status = 404;
  //       next(err);
  //     }
  //   })
  //   .catch(next);

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


/* ========== DELETE/REMOVE A SINGLE NOTE ========== */
router.delete('/notes/:id', (req, res, next) => {
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error('Request path id doesn\'t exist.');
    err.status = 404;
    return next(err);
  }  

  Note.findOneAndRemove( {_id : req.params.id, userId} )
    .then( count => {
      if (count) {
        return res.status(204).end();
      }
      const err = new Error('You don\'t have permission to delete this note');
      err.status = 400;
      next(err);
    })
    .catch(next);
});

module.exports = router;