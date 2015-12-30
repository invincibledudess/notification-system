var mongoose = require('mongoose'),
    path     = require('path'),
    express = require('express'),
    app = express(),
    http = require('http'),
    io = require('socket.io'),
    users = require('./models/user.server.model'),
    User = mongoose.model('Users'),
    subscription = require('./models/subscription.server.model'),
    Subscription = mongoose.model('Subscriptions'),
    character = require('./models/character.server.model'),
    Character = mongoose.model('Characters'),
    activities = require('./models/activities.server.model'),
    Activities = mongoose.model('Activities');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */
var DB_HOST =process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost';
var dbConfig = {
    uri: 'mongodb://' + DB_HOST + '/neha'
};

/*Set EJS template Engine*/
app.use(express.static(path.join(__dirname, 'public')));
app.set('views','./views');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public'));

io = io.listen(app.listen(3000, function() {
    console.info('Application started on port : 3000');
}));

var db = mongoose.connect(dbConfig.uri);
db.connection.on('open', function callback() {
    io.sockets.on('connection', function (socket) {

        /*Event Handlers*/
        socket.on('subscription', function (obj) {
            User.findOne({_id:obj.user})
                .populate('subscriptions.subscriptionType')
                .populate('subscriptions.characterId')
                .exec()
                .then(function(subs){
                    console.info('hereeeeee.... ', subs);
                    socket.emit('subscription', {subs: subs});

                });
        });

        socket.on('notification', function(obj) {
            var collection = mongoose.connection.db.collection('Activities');
            /* Create tailable cursor for Activities collection */
            var stream = collection.find({}, {
                tailable: true,
                awaitdata: true,
                numberOfRetries: Number.MAX_VALUE
            }).stream();

            stream.on('data', function(activity) {
                var actObj = activity;
                if(activity.read === false && activity.type == obj.typeId && activity.characterId == obj.characterId) {
                    socket.emit('notify', {obj:activity});
                    actObj.read = true;
                    Activities.update({_id:activity._id}, actObj, function(a, b){});
                }
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

/*Render index.html as homepage*/
app.get('/',function(req,res){
    res.render('index.html',{title:"Notification System"});
});

/* Get Users from database */
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

/* Get subscription for the selected user */
app.get('/users/:userId/subscription', function(req, res) {
    //console.info(req.params.userId);
    User.findOne({_id:req.params.userId})
        .populate('subscriptions.subscriptionType')
        .populate('subscriptions.characterId')
        .exec()
        .then(function(subs){
            res.send(subs);
        });
});

