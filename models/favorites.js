const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Dishes = require('./dishes');


var favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Dish'
        //Dishes.Schema //El schema de pecho para probar
    }]
},{
    timestamps: true
});


var Favorites = mongoose.model('Favorite',favoriteSchema);

module.exports = Favorites;

// mongod --dbpath=data --bind_ip 127.0.0.1 
//user token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjM2MGM4ZGIyNmFhNzBhYWM4MGY1YTEiLCJpYXQiOjE1OTg5MjQ5NjcsImV4cCI6MTU5ODkyODU2N30.VeAVG-B0FdGwYpEVJGQbhQzm283Gv7ArKcJiPjRNrho