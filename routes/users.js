var crypto = require('crypto');
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-http').BasicStrategy
var pbkdf2 = require('pbkdf2');
var router = express.Router();

// Pull in the mongoose library
const mongoose = require('mongoose');

// User schema
const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
		type: String,
		required: true
	},
    password: {
		type: String,
		required: true
	},
    salt: String,
    date: { 
		type: Date,
		default: Date.now },
    admin: {
		type: Boolean,
		default: false }
	
});

// User model
const User = mongoose.model('User', userSchema);

const validPassword = function(password, salt, hash){
	let key = pbkdf2.pbkdf2Sync(password, salt, 1, 32, 'sha512');

	if(key.toString('hex') != hash){
		return false;
	}
	return true;
}

passport.use(new Strategy(
	function(username, password, done) {
	  User.findOne({ username: username }, function (err, user) {
		  // Can't connect to Db?  We're done.
		if (err) {
			return done(err);
		}
		// User doesn't exist?  We're done.
		if (!user) { 
			console.log("No user found.");
			return done(null, false);
		}
		// Got this far?  Check the password.
		if (!validPassword(password, user.salt, user.password)) { 
			console.log("Wrong password.");
			return done(null, false);
		}
		// Otherwise, let them in and store the user in req.
		return done(null, user);
	  });
	}
  )
);

const checkAuth = passport.authenticate('basic', { session: false });

/* GET users listing. */
router.get('/', checkAuth, async function(req, res, next) {
	if(req.user.admin){
		var users = await User.find({})
		res.json(users);
	} else {
		res.send(401);
	}
});

router.post('/', checkAuth, async function(req, res, next){
	console.log(req.body);
	if(req.user.admin){
		var newUser = User();
		newUser.email = req.body.username;
		newUser.salt = crypto.randomBytes(32).toString('hex');
		console.log("Received: " + req.body.password);
		newUser.password = pbkdf2.pbkdf2Sync(req.body.password, newUser.salt, 1, 32, 'sha512').toString('hex');
		newUser.admin = false;
		newUser.save();
		res.send(200);
        } else {
                res.send(401);
        }
});

module.exports = { checkAuth, router, User };
