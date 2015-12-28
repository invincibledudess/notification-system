var mongoose = require('mongoose'),
    oplogsMongoose = require('mongoose'),
    path     = require('path'),
    bodyParser = require('body-parser'),
    chalk = require('chalk'),
    express = require('express'),
    app = express(),
    http = require('http'),
    io = require('socket.io'),
    session = require('express-session'),
    users = require('./models/user.server.model'),
    User = mongoose.model('Users');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */
var DB_HOST =process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost';
var config = {
    dbUri: 'mongodb://' + DB_HOST + '/neha',
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
app.use(express.static(path.join(__dirname, 'public')));
app.set('views','./views');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public'));

io = io.listen(app.listen(3000, function() {
    console.info('Application started on port : 3000');
}));

var db = mongoose.connect(config.dbUri);
db.connection.on('open', function callback() {
    io.sockets.on('connection', function (socket) {
        socket.emit('notification', { message: 'welcome to the chat' });
        socket.on('send', function (data) {
            io.sockets.emit('notification', data);
        });
        var collection = mongoose.connection.db.collection('Activities');
        var stream = collection.find({}, {
            tailable: true,
            awaitdata: true,
            numberOfRetries: Number.MAX_VALUE
        }).stream();

        stream.on('data', function(val) {
            console.info(val);
            User.find({"subscriptions.characterId": val.characterId, "subscriptions.subscriptionType" : val.type})
                .exec()
                .then(function(users, err) {
                    socket.emit('notification', {message: users});
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

app.get('/users',function(req,res){
    User.find({})
        .exec()
        .then(function(users, err) {
            if(err) {
                console.info('error : ', err);
            } else {
                res.send(users);
            }
        })
});

app.get('/users/:userId/subscription', function(req, res) {
    User.findOne({_id:req.param('userId')},{subscriptions:1})
        .exec()
        .then(function(subs, err){
            if(err) {
                console.info('error : ', err);
            } else {
                console.info('subs : ', subs);
                res.send(subs);
            }
        });
});

