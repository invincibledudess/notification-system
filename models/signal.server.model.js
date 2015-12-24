/**
 * Created by Neha on 12/23/2015.
 */


var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var signalSchema = new Schema({
    eventTitle     : String,
    instanceData   : String
});

mongoose.model('subscription', signalSchema);
