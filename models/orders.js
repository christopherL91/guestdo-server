'use strict';

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

var orders = mongoose.model('order', mongoose.Schema({
}));

exports.getAllOrders = function (hotel_id) {
    return orders.find({
        hotel_id : new ObjectId(hotel_id)
    }).exec();
};