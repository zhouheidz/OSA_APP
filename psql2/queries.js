var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://postgres:p@ssw0rd@localhost/osaapp';
var db = pgp(connectionString);
var express = require('express');
var app = express();
var pg = require('pg');
var client = new pg.Client(connectionString);
client.connect();
var username = 'huchiu@up.edu.ph';


//functions for mobile
function getUsers(req, res, next) {
db.any('select * from users')
  .then(function (data) {
    res.end(JSON.stringify(data));

  })
  .catch(function (err) {
    return next(err);
  });
}

function tryPost (req, res) {
  var user_id = req.param('id');
  var token = req.param('token');
  var geo = req.param('geo'); 

  res.send(user_id + ' ' + token + ' ' + geo); 
}






//functions for web
function User(){
    this.first_name = "";
    this.middle_name= ""; //need to declare the things that i want to be remembered for each user in the database
    this.last_name= "";
    this.up_mail= "";
    this.pass= "";
    this.role= "";
    this.cluster= "";
    this.course= "";
    this.year= "";

};

User.findOne = function(req, callback){
    var isNotAvailable = false; 
    console.log(req.up_mail + ' is in the findOne function test');
    client.query('SELECT * from users WHERE up_mail= $1 AND pass=$2', [req.up_mail, req.pass], function(err, result){
        console.log(result.rows);
        if(err){
            console.log(req.up_mail + ' is not available');
            return callback(err, isNotAvailable, this);
        }
        if (result.rows.length > 0){
            isNotAvailable = true; // update the user for return in callback
            console.log(req.up_mail + ' is not available!');
        }
        else{
            isNotAvailable = false;
            console.log(req.up_mail + ' is available');
        }
        //client.end();
        return callback(false, isNotAvailable, this);
    });
};

function get(req, res) {
  console.log('entered');
  console.log("Cookies: ", req.cookies);
  res.render('index');
}


function post(req, res) {
  console.log(req.body.up_mail + " " + req.body.pass);
  User.findOne({up_mail: req.body.up_mail, pass: req.body.pass}, function(err, user) {
    if(!user) {
      res.render('index', { error: "Incorrect email/password."});
    } else {
      if(req.body.password == user.password) {
        res.redirect('/prof');
      } else {
        res.render('index', { error: "Incorrect email/password."});
      }
    }
  });
};


function prof(req, res) {
  console.log('enter profile');
  client.query('SELECT * FROM posts ORDER BY timestamp DESC', function(err, result) {
      if(err) {
        return console.error('naay error', err);
      }
      console.log({posts: result.rows});
      res.render('profile', {posts: result.rows});
   });
};

function announce(req, res) {
  //console.log('poster is ' + user.up_mail);
  console.log('trying to add');
  console.log(username);
  console.log(req.body.type);
  console.log(req.body.title);
  console.log(req.body.description);
  //res.send(username + " has posted " + req.body.title);
   client.query('INSERT INTO posts(up_mail, post, title, description) VALUES($1, $2, $3, $4)', [username, req.body.type, req.body.title, req.body.description]);
   prof(req, res);
};

function announcements(req, res) {
  res.render('profile', {posts: result.rows});
}


module.exports = {
  getUsers: getUsers,
  get: get,
  post: post,
  prof: prof,
  tryPost: tryPost,
  announce: announce,
  announcements:announcements
  // getUsers2: getUsers2
  // getWeb: getWeb
};
