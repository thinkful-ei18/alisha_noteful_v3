'use strict';

const app = require('../server'); // first I must access the server
const express = require('express'); // the server connects to my routes through Router, so I have to access express
const router = express.Router(); // now I can use the router
const mongoose = require('mongoose'); // and access my db

const Tag = require('../models/tag.model'); // the collection I'll be referencing



/* ========== GET/READ ALL ITEM ========== */
router.get('/tags', (req, res, next) => {

  Tag.find()
    .sort('name')
    .then( tags => res.json(tags))
    .catch( err => next(err));
    
});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/tags/:id', (req, res, next) => {


});


/* ========== POST/CREATE AN ITEM ========== */
router.post('/tags', (req, res, next) => {


});


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/tags/:id', (req, res, next) => {


});


/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/tags/:id', (req, res, next) => {


});


module.exports = router; // expose the routes