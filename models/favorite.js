const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var User = require('./user');
var authenticate = require('../authenticate');

var favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }],
    timestamps: true,
});
var Favorites = mongoose.model('Favorites', favoriteSchema);

module.exports = Favorites;