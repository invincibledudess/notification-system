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
                type: Schema.Types.ObjectId/*,
                ref: 'Character'*/
            },
            subscriptionType:{
                type: Schema.Types.ObjectId/*,
                ref: 'Subscription'*/
            }
        }
    ]
});

mongoose.model('Users', userSchema, 'Users');
