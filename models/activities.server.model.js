/**
 * Created by Neha on 12/29/2015.
 */


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var activitySchema = new Schema({
    characterId:{
        type: Schema.Types.ObjectId,
        ref: 'Characters'
    },
    subscriptionType:{
        type: Schema.Types.ObjectId,
        ref: 'Subscriptions'
    },
    desc     : String
});

mongoose.model('Activities', activitySchema, 'Activities');