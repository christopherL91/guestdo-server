'use strict';

var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    jwt = require('express-jwt'),
    jsonwebtoken = require('jsonwebtoken'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    hotels = require('./models/hotels'),
    orders = require('./models/orders'),
    colors = require('colors/safe'),
    bcrypt = require('bcrypt-then');

// Connect to mongoDB
//var db = mongoose.connect('mongodb://localhost/guest_do');
var db = mongoose.connect('mongodb://lillt:1234@ds031671.mongolab.com:31671/guestdo');

// JWT secret.
var secret = 'unicorns are awesome';
//Server port
var port = 3000;

// Enable CORS
app.use(cors());
app.options('*', cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials","true");
    res.header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept, Accept-Encoding, X-CSRF-Token, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "OPTIONS,GET,PUT,POST,DELETE");
    next();
});

// Log every request
app.use(morgan('dev'));
// Parse everything as JSON.
app.use(bodyParser.json({}));

// Set JWT middleware on every route except login.
app.use(jwt({secret: secret}).unless({path: ['/api/login']}));

//login route
app.post('/api/login', function (req, res, next) {
    var username = req.body.username,
        password = req.body.password,
        id = '';
    if ((username && password)) {
        hotels.login(username)
            .then(function (data) {
                var result = data.toObject();
                id = result._id;
                var hashedPassword = result.password;
                return bcrypt.compare(password, hashedPassword);
            })
            .then(function (valid) {
                if (!valid) {
                    next({type: 'login', error: 'Could not login'});
                }
                return res.json({
                    token: jsonwebtoken.sign({
                        hotel_id: id
                    },
                        secret, {
                            // Expire in 2 weeks.
                            expiresInMinutes: 60*24*14,
                            noTimestamp: true
                        })
                });
            }, function (err) {
                console.log(err);
                next({type: 'login', error: 'Could not login'});
            });
    } else {
        next({type: 'login_fields', error: 'not sufficient fields'});
    }
});

app.get('/api/current', function(req, res, next) {
    hotels.getCurrentGuests(req.user.hotel_id)
        .then(function (data) {
            console.log(data);
            res.json({
               guests: data
            });
        },function (err) {
            console.log(err);
            next(err);
        });
});

app.post('/api/current', function(req,res,next) {
    var hotel_id = req.user.hotel_id,
        guest = req.body;

    hotels.addCurrentGuest(hotel_id,guest,function(err,doc) {
        if (err) {
            next(err);
        }
        res.json({
            status: doc
        });
    });
});

app.delete('/api/current', function(req,res,next) {
    var hotel_id = req.user.hotel_id,
        guest_id = req.body.guest_id;

    hotels.removeCurrentGuest(hotel_id,guest_id)
        .then(function (data) {
            console.log(data);
            res.json({
               status: 'removed guest'
            });
        }, function(err) {
           next(err);
        });
});

app.get('/api/future', function(req, res, next) {
    hotels.getFutureGuests(req.user.hotel_id)
        .then(function (data) {
            console.log(data);
            res.json({
                guests: data
            });
        },function (err) {
            next(err);
        });
});

app.delete('/api/future', function(req,res,next) {
    var hotel_id = req.user.hotel_id,
        guest_id = req.body.guest_id;

    hotels.removeFutureGuest(hotel_id,guest_id)
        .then(function (data) {
            console.log(data);
            res.json({
                status: 'removed guest'
            });
        }, function(err) {
            next(err);
        });
});

app.get('/api/info', function(req, res, next) {
    hotels.getSettings(req.user.hotel_id)
        .then(function (data) {
            var result = data.toObject();
            res.json({
               info: result.info
            });
        },function (err) {
            next(err);
        });
});

app.post('/api/info',function(req,res,next) {
    var hotel_id = req.user.hotel_id,
        settings = req.body.settings;
    if(!settings) {
        next({type : 'settings_field', error: 'settings field missing'});
    }
    hotels.updateSettings(hotel_id,settings)
        .then(function (data) {
            console.log(data);
            res.json({
                'status' : 'updated settings'
            });
        },function(err) {
            console.log(err);
            next(err);
        });
});

app.get('/api/roomservice', function(req, res, next) {
    orders.getAllOrders(req.user.hotel_id)
        .then(function (data) {
            console.log(data);
            res.json({
                orders: data
            });
        },function(err) {
            console.log(err);
            next(err);
        });
});

// if user failed to login
app.use(function login_failed(err, req, res ,next) {
    if (err.type === 'login') {
        res.status(401).json({
            status: err.error
        });
    } else {
        next(err);
    }
});

// if user did not post a username and a password.
app.use(function insuffient_fields(err, req, res, next) {
    if (err.type === 'login_fields') {
        res.status(403).json({
            status: err.error
        });
    } else {
        next(err);
    }
});

app.use(function otherError(err, req,res, next) {
    if(err.type && err.error) {
        res.status(403).json({
            status: err.error
        });
    }else {
        next(err);
    }
});

// if user did not post a valid token in the header.
app.use(function unauthorized(err, req, res,next) {
    if (err.name === 'UnauthorizedError') {
        console.log(err);
        res.status(401).json({
            status: 'Unauthorized access'
        });
    } else {
        next(err);
    }
});

app.listen(port,function () {
    console.log(colors.red('Server started on ' + port));
});