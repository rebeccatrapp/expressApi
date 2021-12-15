var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = require('./users.js').User;
var Entry = require('./entries.js').Entry;
var validPassword = require('./users.js').validPassword;

passport.use(new LocalStrategy(
  function(username, password, done){ 
    User.findOne({username: username }, function(err, user){
      if(err) { return done(err); }
      if(!user) { return done(null, false); }
      if(!validPassword(password, user.salt, user.password)){ return done(null, false); }
      return done(null, user);
    }
   )
 }));

var checkAuthLocal = passport.authenticate('local', { failureRedirect: '/', session: true });

/* GET home page. */
router.get('/', function(req, res, next) {
    var name;
  if(req.user){
    var name = req.user.email;
  }
  res.render('index', { title: 'MyJournal - Data Collection Device', name: name });
});

router.get('/about', function(req, res, next){
  res.render('about', { title: 'About MyJournal'});
});

router.post('/login', checkAuthLocal, function(req, res, next){
  res.redirect('/');
});

router.get('/newUser', function(req, res, next){
  res.render('newUser');
});

router.get('/addUser', checkAuthLocal, function(req, res, next){
  if(req.user.admin){
	res.render('addUser');
  } else {
	res.render('index');
  }
});

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

router.get('/journal', async function(req, res){
	if(!req.isAuthenticated()){
		res.redirect('/');
	} else {
		var entries = await Entry.find({ userId : req.user._id });
		res.render('journal', { entries : entries } );
	}
});

router.get('/newJournalEntry', function(req, res, next){
  res.render('newJournalEntry');
});

module.exports = router;
