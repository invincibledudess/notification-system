/**
 * Created by Neha on 25-12-2015.
 */


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    name     : String,
    displayName     : String,
    subscriptions       : [
        {
            characterId:{
                type: Schema.Types.ObjectId,
                ref: 'Characters'
            },
            subscriptionType:{
                type: Schema.Types.ObjectId,
                ref: 'Subscriptions'
            }
        }
    ]
});

mongoose.model('Users', userSchema, 'Users');
