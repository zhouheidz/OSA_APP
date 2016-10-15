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
var latest;
var AnnounecementTimestamp;
var recepient;
var up_mail;
client.connect();




//functions for mobile
function getAllUsers(req, res, next) {
  db.any('select * from users')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved users'
        });
    })
    .catch(function (err) {
      return res.status(200).json ({
        statis: 'error'
      })
    });
}

function getOneUser(req, res, next) {
  db.one('select * from users where up_mail = $1', req.params.up_mail)
  .then(function (data) {
    res.status(200)
      .json({
        status: 'success',
        data: data,
        message: 'Retrieved ONE user'
      });
  })
  .catch(function (err) {
    return next(err);
  });
}

function postDetails (req, res, next) {
  var mail = req.body.up_mail;
  var password = req.body.password;
  response = {
   up_mail:req.body.up_mail,
   pass:req.body.password
  };
  console.log(mail, password);
  db.one('select * from users where up_mail = $1 and pass = $2', [mail, password])
  .then(function (data) {
    res.status(200)
      .json({
        status: 'success',
        data: data,
        message: 'Retrieved ONE user'
      });
  })
  .catch(function (err) {
    return res.status(200).json ({
      status: 'error'
    })
  });
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
  up_mail = req.body.up_mail;
  User.findOne({up_mail: req.body.up_mail, pass: req.body.pass}, function(err, user) {
    if(!user) {
      res.render('index', { error: "Incorrect email/password."});
    } else {
      if(req.body.password == user.password) {
        res.redirect('prof');
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
      //console.log({posts: result.rows});
      //latest = result.rows[0].timestamp;
      //console.log("latest timestamp is " + latest);
      client.query('SELECT organization_name FROM organization', function(err, result2) {
        if(err) {
          return console.error('naay error', err);
        }
        //console.log({posts: result.rows, organization:result2.rows});
        res.render('profile', {posts: result.rows, organization:result2.rows});
      });
      
   });
};

function announce(req, res) {
  console.log('INSIDE Announcement');
  console.log(req.body.type);
  console.log(req.body.title);
  console.log(req.body.description);
  recepient = req.body.recepient;
  //res.send(username + " has posted " + req.body.title);
  client.query('SELECT organization_name FROM organization WHERE organization_name = $1', [req.body.organization], function(err, result) {
    if(err) {
      return console.error('naay error', err);
    }
    console.log("BEFORE INSERT");
    client.query('SELECT * FROM posts ORDER BY timestamp DESC', function(err, result) {
      if(err) {
        return console.error('naay error', err);
      }
      //console.log({posts: result.rows});
      if(typeof recepient == 'undefined') {
        recepient = 'Public';
        client.query('INSERT INTO posts(up_mail, post, title, description) VALUES($1, $2, $3, $4)', [up_mail, 'Announcement', req.body.title, req.body.description]);
        client.query('SELECT timestamp FROM posts ORDER BY timestamp DESC', function(err, result) {
          AnnounecementTimestamp = result.rows[0].timestamp;
          console.log("AFTER INSERT LATEST TIMESTAMP IS: "+AnnounecementTimestamp);
          console.log('recepient is: '+recepient);
          client.query('INSERT INTO announcement(announcement_id,recepient) VALUES($1,$2)', [AnnounecementTimestamp,recepient]);
         });
      }
      client.query('SELECT organization_name from organization WHERE organization_name = $1', [recepient], function(err, result) {
        //console.log("org is " + result.rows[0].organization_name);
        if(result.rows.length > 0) {
          client.query('INSERT INTO posts(up_mail, post, title, description) VALUES($1, $2, $3, $4)', [up_mail, 'Announcement', req.body.title, req.body.description]);
          client.query('SELECT timestamp FROM posts ORDER BY timestamp DESC', function(err, result) {
            AnnounecementTimestamp = result.rows[0].timestamp;
            console.log("AFTER INSERT LATEST TIMESTAMP IS: "+AnnounecementTimestamp);
            console.log('recepient is: '+recepient);
            client.query('INSERT INTO announcement(announcement_id,recepient) VALUES($1,$2)', [AnnounecementTimestamp,recepient]);
           });
        } else {
          console.log("org name does not exist");
          res.render('announce', { error: "Invalid organization"});
        }
      });
          
    });
  });
   res.redirect('prof');
};

function announce2(req, res) {
    console.log('entering index');
    res.render('announce');
};


// function announcements(req, res) { 
//   res.render('viewAnnounce', {posts: result.rows, organization:result2.rows});
// }

function announcements(req, res) { 
  res.render('viewAnnounce', {posts: result.rows, organization:result2.rows, up_mail});
}

function announcements(req, res){
  client.query('SELECT * FROM posts ORDER BY timestamp DESC', function(err, result) {
    if(err) {
        return console.error('error running query', err);
    }
    res.render('viewAnnounce', {posts: result.rows, up_mail});
  });
};



module.exports = {
  //mobile
  getAllUsers: getAllUsers,
  getOneUser: getOneUser,
  postDetails: postDetails,

  //web
  get: get,
  post: post,
  prof: prof,
  announce2: announce2,
  announce: announce,
  announcements:announcements
};
