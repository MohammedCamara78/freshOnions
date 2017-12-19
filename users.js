/*jshint esversion: 6 */

var express = require('express');
var router = express.Router();

var env = require('dotenv').config();
const Client = require('pg').Client;
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
client.connect(); //connect to database

var passport = require('passport');
var bcrypt = require('bcryptjs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.send('respond with a resource');
  res.render('user', { user: req.user }); //display user.hbs
});

router.get('/logout', function(req, res){
    req.logout(); //passport provide it
    res.redirect('/users'); // Successful. redirect to localhost:3000/users
});

function loggedIn(req, res, next) {
  if (req.user) {
    next(); // req.user exists, go to the next function (right after loggedIn)
  } else {
    res.redirect('/users/login'); // user doesn't exists redirect to localhost:3000/users/login
  }
}

router.get('/profile',loggedIn, function(req, res){
      // req.user: passport middleware adds "user" object to HTTP req object
      res.render('profile', { person: req.user });
});

function notLoggedIn(req, res, next) {
  if (!req.user) {
    next();
  } else {
    res.redirect('/users/profile');
  }
}

router.get('/login', notLoggedIn, function(req, res){
    //success is set true in sign up page
    //req.flash('error') is mapped to 'message' from passport middleware
    res.render('login', {success:req.query.success, errorMessage: req.flash('error')});
});

router.post('/login',
  // This is where authentication happens - app.js
  // authentication locally (not using passport-google, passport-twitter, passport-github...)
  passport.authenticate('local', { failureRedirect: 'login', failureFlash:true }),
  function(req, res,next) {
    res.redirect('/users/profile'); // Successful. redirect to localhost:3000/users/profile
});

router.get('/signup',function(req, res) {
    // If logged in, go to profile page
    if(req.user) {
      return res.redirect('/users/profile');
    }
    res.render('signup'); // signup.hbs
});
// check if username has spaces, DB will whine about that
function validUsername(username) {
  var login = username.trim(); // remove spaces
  return login !== '' && login.search(/ /) < 0;
}

function createUser(req, res, next){

  var salt = bcrypt.genSaltSync(10);
  var pwd = bcrypt.hashSync(req.body.password, salt);

  client.query('INSERT INTO users (username, password) VALUES($1, $2)', [req.body.username, pwd], function(err, result) {
    if (err) {
      console.log("unable to query INSERT");
      return next(err); // throw error to error.hbs.
    }
    console.log("User creation is successful");
    res.redirect('/users/profile?success=true');
  });
}

router.post('/signup',
  function(req, res,next) {
    res.redirect('/users/profile'); // Successful. redirect to localhost:3000/users/profile
  // Reject users
  if (!validUsername(req.body.username)) {
    return res.render('signup');
  }

  client.query('SELECT * FROM users WHERE username=$1',[req.body.username], function(err,result){
    if (err) {
      console.log("sql error ");
      next(err); // throw error to error.hbs.
    }
    else if (result.rows.length > 0) {
      console.log("user exists");
      res.render('signup', { errorMessage: "true" });
    }
    else {
      console.log("no user with that name");
      createUser(req, res, next);
    }
  });
});
// GET REVIEWS
router.get('/review', function(req, res){
  res.render('review', { person: req.user });

});

router.post('/review', function(req, res, next){


});

// GET ps
router.get('/playstation', function(req, response){
  client.query('SELECT * FROM games WHERE console=$1', ['playstation'],function(err, result){
    if (err) {
      next(err);
    }
    response.render('playstation',result);
  });
});

router.post('/playstation', function(req, response, next){
  client.query('SELECT * FROM games WHERE title=$1', [req.body.gametitle],function(err, result){
    if (err) {
      next(err);
    }
    response.render('gamePage',result);
  });
});

// GET xboxone
router.get('/xbox', function(req, response, next){
  client.query('SELECT * FROM games WHERE console=$1', ['xbox'],function(err, result){
    if (err) {
      next(err);
    }
    response.render('xbox',result);
  });
});

router.post('/xbox', function(req, response, next){
  client.query('SELECT * FROM games WHERE title=$1', [req.body.gametitle],function(err, result){
    if (err) {
      next(err);
    }
    response.render('gamePage',result);
  });
});
// GET wii-u
router.get('/nintendo', function(req, response, next){
  client.query('SELECT * FROM games WHERE console=$1', ['nintendo'],function(err, result){
    if (err) {
      next(err);
    }
    response.render('nintendo',result);
  });

});

router.post('/nintendo', function(req, response, next){
  client.query('SELECT * FROM games WHERE title=$1', [req.body.gametitle],function(err, result){
    if (err) {
      next(err);
    }
    response.render('gamePage',result);
  });
});
// GET pc
router.get('/pc', function(req, response){
  client.query('SELECT * FROM games WHERE console=$1', ['pc'],function(err, result){
    if (err) {
      next(err);
    }
    response.render('pc',result);
  });

});

router.post('/pc', function(req, response, next){
  client.query('SELECT * FROM games WHERE title=$1', [req.body.gametitle],function(err, result){
    if (err) {
      next(err);
    }
    response.render('gamePage',result);
  });
});
// <img src="{{image}}" alt="{{title}} pic" height="150" width="200"/>
// GET Mobile
router.get('/mobile', function(req, response){
  client.query('SELECT * FROM games WHERE console=$1', ['mobile'],function(err, result){
    if (err) {
      next(err);
    }
    response.render('mobile',result);
  });
});

router.post('/mobile', function(req, response, next){
  client.query('SELECT * FROM games WHERE title=$1', [req.body.gametitle],function(err, result){
    if (err) {
      next(err);
    }
    response.render('gamePage',result);
  });
});


// GET /contact
router.get('/contact', function(req, res) {
  res.render('contact', { title: req.user });
});
router.post('/contact', function(req, res, next){


});

// GET /about-us
router.get('/aboutUs', function(req, res) {
  res.render('aboutUs', { title: req.user });
});
router.post('/aboutUs', function(req, res, next){


});
router.get('/freshOnions', function(req, res){
  res.render('/freshOnions');
});

router.get('/images', function(req, res){
  res.render('images');
});

router.get('/gamePage', function(req, response, next) {
  client.query('SELECT * FROM games WHERE title=$1', [req.body.gametitle],function(err, result){
    if (err) {
      next(err);
    }
    var rowsp = result.rows;
    client.query('SELECT * FROM reviews WHERE gametitle=$1', [req.body.gametitle],function(err, result){
      if (err) {
        next(err);
      }
      response.render('gamePage',{rows: rowsp, reviews: result.rows});
    });
  });
});

router.post('/gamePage', function(req, response, next){
  var updatedscore = (parseInt(req.body.score)+parseInt(req.body.opinion));
  client.query('UPDATE games SET score = ($1) WHERE title = ($2)', [updatedscore, req.body.gametitle], function(err, result) {
    if (err) {
      console.log("unable to query UPDATE");
      next(err);
    }
    console.log("Score updated");
  });
  var updatedvotes = (parseInt(req.body.votes)+1);
  client.query('UPDATE games SET votes = ($1) WHERE title = ($2)', [updatedvotes, req.body.gametitle], function(err, result) {
    if (err) {
      console.log("unable to query UPDATE");
      next(err);
    }
    console.log("Votes updated");
  });
  var updatedrating = (updatedscore/updatedvotes);
  client.query('UPDATE games SET rating = ($1) WHERE title = ($2)', [updatedrating, req.body.gametitle], function(err, result) {
    if (err) {
      console.log("unable to query UPDATE");
      next(err);
    }
    console.log("Rating updated");
  });
  client.query('SELECT * FROM games WHERE title=$1', [req.body.gametitle],function(err, result){
    if (err) {
      next(err);
    }
    response.render('gamePage',result);
  });
});

router.post('/reviewredirect', function(req, response, next){
  client.query('SELECT * FROM games WHERE title=$1', [req.body.gametitle],function(err, result){
    if (err) {
      next(err);
    }
    response.render('review',result);
  });
});

module.exports = router;
