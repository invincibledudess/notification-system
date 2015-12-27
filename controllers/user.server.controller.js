/**
 * Created by Neha on 25-12-2015.
 */

var mongoose = require('mongoose'),
    users = require('../models/user.server.model'),
    User = mongoose.model('Users');

exports.sendNotification = function(val, io) {
    User.find({"subscriptions.characterId": val.characterId, "subscriptions.subscriptionType" : val.type}).exec().then(function(users, err) {
        console.info('users : ', users);

    });
};
