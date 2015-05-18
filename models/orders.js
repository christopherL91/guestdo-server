'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var orders = mongoose.model('order', mongoose.Schema({
    _id: ObjectId,
    hotel_id: ObjectId,
    name: String,
    description: String,
    time: Date,
    room: Number,
    price: Number
}));

exports.getAllOrders = function (hotel_id) {
    return orders.find({
        hotel_id : hotel_id
    }).exec();
};

exports.removeOrder = function(hotel_id,order) {
    return orders.findOneAndRemove({
        _id: order._id,
        hotel_id: hotel_id
    }).exec();
};