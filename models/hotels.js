'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var hotels = mongoose.model('hotel', mongoose.Schema({
    _id: ObjectId,
    username: {type: String , required: true},
    password: {type: String, required:true},
    info: {
        name: {type: String, required: true},
        address: {type: String, required: true}
    }
}));

var currentGuests = mongoose.model('currentguest', mongoose.Schema({
    hotel_id: ObjectId,
    surname: String,
    familyname: String,
    age : Number,
    country: String,
    language: String,
    hotel: String,
    email: String,
    mode: String,
    room: Number,
    in: Date,
    out: Date,
    image: String
}));

var futureGuests = mongoose.model('futureguest', mongoose.Schema({
    hotel_id: ObjectId,
    surname: String,
    familyname: String,
    age : Number,
    country: String,
    language: String,
    hotel: String,
    email: String,
    mode: String,
    room: Number,
    in: Date,
    out: Date,
    image: String
}));

exports.login = function (username) {
    return hotels.findOne({
        username: username
    }).exec();
};

exports.getSettings = function(hotel_id) {
    return hotels.findOne({
        _id: hotel_id
    }).select({ "info": 1, "_id": 0}).exec();
};

exports.updateSettings = function(hotel_id,info) {
    return hotels.findByIdAndUpdate(hotel_id,{
        $set: {
            'info':info
        }
    }).exec();
};

exports.getCurrentGuests = function(hotel_id) {
    return currentGuests.find({
        hotel_id : hotel_id
    }).exec();
};

exports.addCurrentGuest = function(hotel_id,guest,cb) {
    console.log(guest.hotel_id);
    currentGuests.create({
        hotel_id: new mongoose.Types.ObjectId(guest.hotel_id),
        surname: guest.surname,
        familyname: guest.familyname,
        age: guest.age,
        country: guest.country,
        language: guest.language,
        hotel: guest.hotel,
        email: guest.email,
        mode: guest.mode,
        room: guest.room,
        in: guest.in,
        out: guest.out,
        image: guest.image
    },cb);
};

exports.getFutureGuests = function(hotel_id) {
    return futureGuests.find({
        hotel_id: hotel_id
    }).exec();
};

exports.removeCurrentGuest = function(hotel_id,guest_id) {
    return currentGuests.findOneAndRemove({
        _id: guest_id,
        hotel_id: hotel_id
    }).exec();
};

exports.removeFutureGuest = function(hotel_id,guest_id) {
    return futureGuests.findOneAndRemove({
        _id: guest_id,
        hotel_id: hotel_id
    }).exec();
};