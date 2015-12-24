/**
 * Created by Neha on 12/23/2015.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var subscriptionSchema = new Schema({
    eventTitle     : String,
    alertEndpoint   : String
});

mongoose.model('Subscription', subscriptionSchema, 'Subscription');