var express = require('express');
var router = express.Router();
var user = require('./users.js');
var checkAuth = user.checkAuth;

// Pull in the mongoose library
const mongoose = require('mongoose');
const { Schema } = mongoose;

const pointSchema = new Schema({
	type: {
		type: String,
		enum: ['Point'],
		required: true
	},
	coordinates: {
		type: [Number],
		required: true
	}
});

const entrySchema = new Schema({
	userId: mongoose.ObjectId,
        date: {
		type: Date,
		default: Date.now
	},
	mood: {
		type: String,
		required: true
	},
	entry: {
		type: String,
		required: true
	},
	location: {
		type: pointSchema,
		required: true
	},
	weather: String
});

const Point = mongoose.model('Point', pointSchema);
const Entry = mongoose.model('Entry', entrySchema);

/* GET entry listing for logged in user. */
router.get('/', checkAuth, async function(req, res, next) {
	var entries = await Entry.find({ userId: req.user._id });
	res.status(200);
	res.json(entries);
});

router.post('/', checkAuth, async function(req, res, next){
	try {
		if(!(req.body.entry && req.body.mood && req.body.location)){
			var error = new Error('Missing required information.');
			error.status = 400;
			throw error;
		}
		var entry = new Entry({
			userId: req.user._id,
			entry: req.body.entry,
			mood: req.body.mood,
			location: req.body.location
		});
		entry.save();
		res.status(200).send("Entry saved.");
	} catch (err){
		return next(err);
	}
});

router.put('/:entryId', checkAuth, async function(req, res, next){
	try {
		var entry = await Entry.find({
			userId : req.user._id,
			_id : req.params.entryId
		});

		if(!entry){
			var error = new Error('Entry not found.');
			error.status = 404;
			throw error;
		}

		if(!(req.body.entry && req.body.mood && req.body.location && req.body.weather)){
			var error = new Error('Missing required information.');
			error.status = 400;
			throw error;
		}

		entry.entry = req.body.entry;
		entry.mood = req.body.mood;
		entry.location = req.body.location;
		entry.weather = req.body.weather;
		entry.save();
		res.status(200).send('Entry saved.');
	} catch (err){
		return next(err);
	}
});

router.delete('/:entryId', checkAuth, async function(req, res,next){
	try{
		const entry = Entry.deleteOne({
			userId : req.users._id,
			_id : req.params.entryId
		});

		if(!entry){

		}
	} catch(err){
		return next(err);
	}
});

module.exports = { router };
