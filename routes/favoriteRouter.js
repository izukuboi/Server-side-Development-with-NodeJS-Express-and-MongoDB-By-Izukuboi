const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');
const authenticate = require('../authenticate');

const Favorites = require('../models/favorites');
const Dishes = require('../models/dishes');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());


favoriteRouter.route('/')
.get(authenticate.verifyUser, (req,res,next) =>{
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(favorites);
    }, (err) =>next(err))
    .catch((err)=> next(err));
})
.post(authenticate.verifyUser, (req,res,next) =>{
    var the_fav;
    Favorites.findOne({ user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
        the_fav = favorite;
        //var dishes = favorite.dishes;
        
        if (!the_fav){//si no existe
            the_fav = new Favorites({user: req.user._id});
            console.log('favorite list created', the_fav.toJSON());
        }
        for(let i of req.body){
            //the_fav.dishes.find()
            if(the_fav.dishes.find((d_id) => {
                if(d_id._id){
                    return d_id._id.toString() === i._id.toString();
                }
            }))
                continue;
            the_fav.dishes.push(i._id);
        }
       /* for (var i =(req.body.length -1); i >= 0; i--){
            the_fav.dishes.findOne(req.body[i]._id)
            .then((dish)=>{
                console.log(dish.toJSON());
                if(!dish){
                    the_fav.dishes.push(req.body[i]);
                }
             },(err)=> next(err))
             .catch((err)=> next(err))
            //if (the_fav.dishes.id(req.body[i]._id) === null){
            //    the_fav.dishes.push(req.body[i]);
            //}
        }*/
        the_fav.save()
        .then((favorite) => {
            console.log('Favorite list updated', favorite.toJSON());
            res.statusCode = 200;
            res.setHeader('Content-Type', 'appliaction/json');
            res.json(favorite);
        }, (err)=> next(err))
        
    },(err)=> next(err))
    .catch((err)=> next(err));
})
.delete(authenticate.verifyUser, (req,res,next) =>{
    Favorites.findOneAndRemove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err))
})

favoriteRouter.route('/:dishId')
.post(authenticate.verifyUser, (req,res,next) =>{
    Favorites.findOne({user: req.user._id})
    .then((favorite) =>{
        the_fav = favorite;
        //var dishes = favorite.dishes;
        
        if (!the_fav){//si no existe
            the_fav = new Favorites({user: req.user._id});
            console.log('favorite list created', the_fav.toJSON());
        }
        if(!the_fav.dishes.find((d_id) => {
            if(d_id._id){
                return d_id._id.toString() === req.params.dishId.toString();
            }
        })){
            the_fav.dishes.push(req.params.dishId);
        }
        else{
            err = new Error('Dish already in your favorites!');
            err.status = 403;
            return next(err)
        }
        the_fav.save()
        .then((favorite) => {
            console.log('Favorite list updated', favorite.toJSON());
            res.statusCode = 200;
            res.setHeader('Content-Type', 'appliaction/json');
            res.json(favorite);
        }, (err) => next(err))
        
    }, (err)=> next(err))
    .catch((err) => next(err))

    
})
.delete(authenticate.verifyUser, (req,res,next) =>{
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        
        if(favorite !== null){
            favorite.dishes = favorite.dishes.filter((dishid) => dishid._id.toString() !== req.params.dishId.toString());
            
            favorite.save()
            .then((favorite) => {
                Favorites.find(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((populatedFav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'appliaction/json');
                    res.json(populatedFav);
                },(err) => next(err))

            })
        }
        else if (favorite == null){
            err = new Error('No favorite list!');
            err.status = 403;
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})

module.exports = favoriteRouter;
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjM2MGM4ZGIyNmFhNzBhYWM4MGY1YTEiLCJpYXQiOjE1OTg5ODU2MDgsImV4cCI6MTU5ODk4OTIwOH0.EB_EPUXebnFJ4MWro1ZEBMHMRfrdGnNWOb5GKX-mzC4