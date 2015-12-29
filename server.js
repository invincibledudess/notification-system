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
    User = mongoose.model('Users'),
    subscription = require('./models/subscription.server.model'),
    Subscription = mongoose.model('Subscriptions'),
    character = require('./models/character.server.model');
Character = mongoose.model('Characters');


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
        global.socket = socket;
        socket.on('subscription', function (obj) {
            User.findOne({_id:obj.user})
                .populate('subscriptions.subscriptionType')
                .populate('subscriptions.characterId')
                .exec()
                .then(function(subs){
                    socket.emit('subscription', {subs: subs});

                });
        });

        socket.on('notification', function(obj) {
            var collection = mongoose.connection.db.collection('Activities');
            console.info(JSON.stringify(obj));
            var stream = collection.find({}, {
                tailable: true,
                awaitdata: true,
                numberOfRetries: Number.MAX_VALUE
            }).stream();

            stream.on('data', function(activity) {
                console.info('activity.typeId == obj.typeId : ', activity.typeId == obj.typeId);
                console.info('activity.characterId == obj.characterId : ', activity.characterId == obj.characterId);
                if(activity.typeId == obj.typeId && activity.characterId == obj.characterId)
                socket.emit('notify', {obj:activity})
            });

            stream.on('error', function(val) {
                console.log('Error: %j', val);
            });

            stream.on('end', function(){
                console.log('End of stream');
            });
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
                //global.socket.emit('notification', {message: users});
                res.send(users);
            }
        })
});

app.get('/users/:userId/subscription', function(req, res) {
    //console.info(req.params.userId);
    User.findOne({_id:req.params.userId})
        .populate('subscriptions.subscriptionType')
        .populate('subscriptions.characterId')
        .exec()
        .then(function(subs){
            console.info(subs);
            res.send(subs);
        });
});

