var express = require('express');
var router = express.Router();

var db = require('../queries');




//mobile shit
router.get('/users', db.getAllUsers);
router.get('/users/:up_mail', db.getOneUser);
router.post('/users', db.postDetails);

//web shit
router.get('/web', db.get);
router.post('/web', db.post);
router.get('/prof', db.prof);
router.post('/announce', db.announce);
router.get('/announce', db.announce2);
router.get('/viewAnn', db.announcements);

module.exports = router;