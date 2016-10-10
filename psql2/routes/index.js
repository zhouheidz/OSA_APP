var express = require('express');
var router = express.Router();

var db = require('../queries');




//mobile shit
router.get('/users', db.getUsers);
router.post('/try', db.tryPost);




//web shit
router.get('/web', db.get);
router.post('/web', db.post);
router.get('/prof', db.prof);


module.exports = router;