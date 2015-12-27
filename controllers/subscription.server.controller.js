/**
 * Created by Neha on 12/23/2015.
 */

var mongoose = require('mongoose'),
    subscriptions = require('../models/subscription.server.model'),
    Subscription = mongoose.model('Subscription');

exports.findById = function(req, res) {
    var id = req.param('id').toString();

    Subscription.findOne({'_id':id}).exec().then(function(err, item) {
        res.send(item);
    });
};

exports.findAll = function(req, res) {

    Subscription.find({}).exec().then(function(err, items) {
        res.send(items);
    });
};

exports.addSubscription = function(req, res) {
    var subscription = new Subscription(req.body);

    subscription.save().then(function(err, result) {
        res.send(result[0]);
    });
};

exports.updateSubscription = function(req, res) {
    var id = req.param('id').toString();
    var subscription = req.body;

    Subscription.update({'_id':id}, subscription, {safe:true}).exec().then(function(err, result) {
        res.send(subscription);
    });
};

exports.deleteSubscription = function(req, res) {
    var id = req.param('id').toString();

    Subscription.remove({'_id':id}, {safe:true}).exec().then(function(err, result) {
        res.send(req.body);
    });
};
