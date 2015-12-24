/**
 * Created by Neha on 12/23/2015.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var eventsSchema = new Schema({
    title     : String
});

mongoose.model('events', eventsSchema, 'Events');