var mongoose = require('mongoose'),
    oplogsMongoose = require('mongoose'),
    path     = require('path'),
    bodyParser = require('body-parser'),
    chalk = require('chalk'),
    express = require('express'),
    app = express(),
    http = require('http'),
    io = require('socket.io')(),
    session = require('express-session'),
    users = require('./models/user.server.model'),
    User = mongoose.model('Users');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */
var DB_HOST =process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost';
var config = {
    dbUri: 'mongodb://' + DB_HOST + '/notification',
    oplogsDbUri: 'mongodb://' + DB_HOST + '/local',
    dbOptions: {
        server: {
            poolSize: 20,
            socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}
        },
        user: '',
        pass: ''
    },
    sessionSecret: 'MEAN',
    sessionCollection: 'sessions',
    sessionName: 'sample'
};

/*Set EJS template Engine*/
app.set('views','./views');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public'));

io = io.listen(app.listen(3000, function() {
    console.info('Application started on port : 3000');
}));

var db = mongoose.connect(config.dbUri);
var sample;

io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });

    oplogsMongoose.connection.on('open', function callback() {
        var collection = mongoose.connection.db.collection('Activities');
        var stream = collection.find({}, {
            tailable: true,
            awaitdata: true,
            numberOfRetries: Number.MAX_VALUE
        }).stream();

        stream.on('data', function(val) {
            User.find({"subscriptions.characterId": val.characterId, "subscriptions.subscriptionType" : val.type})
                .exec()
                .then(function(users, err) {
                    console.info('users : ', users);
                    socket.emit('message', val.desc);
                });
        });

        stream.on('error', function(val) {
            console.log('Error: %j', val);
        });

        stream.on('end', function(){
            console.log('End of stream');
        });
    });

});

app.get('/',function(req,res){
    res.render('index.html',{title:"Notification System"});
});

/*console.log('registering event routes with express');
 app.get('/events', event.findAll);
 app.get('/events/:id', event.findById);
 app.post('/events', event.addEvent);
 app.put('/events/:id', event.updateEvent);
 app.delete('/events/:id', event.deleteEvent);

 console.log('registering subscription routes with express');
 app.get('/subscriptions', sub.findAll);
 app.get('/subscriptions/:id', sub.findById);
 app.post('/subscriptions', sub.addSubscription);
 app.put('/subscriptions/:id', sub.updateSubscription);
 app.delete('/subscriptions/:id', sub.deleteSubscription);*/

