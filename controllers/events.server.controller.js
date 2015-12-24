/**
 * Created by Neha on 12/23/2015.
 */

var mongoose = require('mongoose'),
    event = require('../models/event.server.model'),
    Events = mongoose.model('events');


exports.findById = function(req, res) {
    var id = req.params.id;
    console.info('id : ', id);
    Events.findOne({'_id':id}).exec().then(function(item) {
        console.info('yuhoooooooo', item);
        res.send(item);
    });
};


exports.findAll = function(req, res) {
    console.info('got through');
    Events.find({}).exec().then(function( items) {
        res.send(items);
    });
};

exports.addEvent = function(req, res) {
    var event = req.body,
        eventObj = new Events(event);

    eventObj.save().then(function(e) {
        res.send(e);
    }, function(err) {
        console.info(err);
    });
};

exports.updateEvent = function(req, res) {
    var id = req.params.id;
    var event = req.body;

    Events.update({'_id':id}, event, {safe:true}).exec().then(function(result) {
        res.send(event);
    });
};

exports.deleteEvent = function(req, res) {
    var id = req.params.id;

    Events.remove({'_id':id}, {safe:true}).exec().then(function(result) {
        res.send(req.body);
    });
};