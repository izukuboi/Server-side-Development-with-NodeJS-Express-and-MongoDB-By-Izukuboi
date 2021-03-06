const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.options(cors.corsWithOptions, (req, res)=> {res.sendStatus(200);})
.get(cors.cors, (req,res,next) =>{
    Dishes.find({})
    .populate('comments.author')
    .then((dishes) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(dishes);
    }, (err) =>next(err))
    .catch((err)=> next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    Dishes.create(req.body)
    .then((dish) =>{
        console.log('Dish Created', dish.toJSON());
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(dish);
        
    },(err)=> next(err))
    .catch((err)=> next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    res.statusCode = 403;
    res.end('PUT operation not suported on /dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    Dishes.remove({})
    .then((resp)=> {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(resp);
    }, (err)=> next(err))
    .catch((err)=> next(err))
});

dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res)=> {res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req,res,next) =>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(dish);
    },(err)=> next(err))
    .catch((err)=> next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    res.statusCode = 403;
    res.end('PUT operation not suported on /dishes/'+ req.params.dishId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    Dishes.findByIdAndUpdate(req.params.dishId, { //id
        $set: req.body //lo que se tiene que actualizar
    }, {new: true})//devuelve el doc
    .then((dish) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(dish);
    },(err)=> next(err))
    .catch((err)=> next(err));
     //si cuando concluya la operacion, devolvera el valor actualizado si es true.
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp)=> {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(resp);
    }, (err)=> next(err))
    .catch((err)=> next(err))
});

dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions, (req, res)=> {res.sendStatus(200);})
.get(cors.cors, (req,res,next) =>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) =>{
        if (dish != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'appliaction/json');
            res.json(dish.comments);
        }
        else {
            err = new Error('Dish' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err)
        }
    }, (err) =>next(err))
    .catch((err)=> next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Dishes.findById(req.params.dishId)
    .then((dish) =>{
        if (dish != null) {
            req.body.author = req.user._id;// ponemos el object id del usario autentificado para que cuando pushee los cambios los tenga
            dish.comments.push(req.body);
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'appliaction/json');
                    res.json(dish);
                })

            }, (err) => next(err));
        }
        else {
            err = new Error('Dish' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err)
        }
    },(err)=> next(err))
    .catch((err)=> next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    res.statusCode = 403;
    res.end('PUT operation not suported on /dishes' + req.params.dishId + '/comments');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) =>{
    Dishes.findById(req.params.dishId)
    .then((dish)=> {
        if (dish != null){
            console.log('lmao');
            console.log(dish.comments.length -1);
            
            
            for (var i =(dish.comments.length -1); i >= 0; i--) {
                //console.log('efe');
                
                //console.log(dish.comments.id(dish.comments[i]._id));
                
                dish.comments.id(dish.comments[i]._id).remove(); 
                //console.log(dish.comments.id(dish.comments[i]._id));
            }
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'appliaction/json');
                res.json(dish);
            }, (err) => next(err));
        }
        else  {
            err = new Error('Dish' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err)
        }
    }, (err)=> next(err))
    .catch((err)=> next(err))
});

dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions, (req, res)=> {res.sendStatus(200);})
.get(cors.cors, (req,res,next) =>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) =>{
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'appliaction/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if(dishh == null) {
            err = new Error('Dish' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err)
        }
        else {
            err = new Error('Comment' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err)
        }
    },(err)=> next(err))
    .catch((err)=> next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    res.statusCode = 403;
    res.end('PUT operation not suported on /dishes/'+ req.params.dishId + '/comments/' + req.params.commentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Dishes.findById(req.params.dishId) // busco el plato
    .then((dish) =>{
        var comment = dish.comments.id(req.params.commentId);
        //if (req.user._id === dish.comments.author._id){
            // promesa que devuelve plato despues de buscarlo
        if (dish != null && comment != null && req.user._id.equals(comment.author._id) ){// verifico si el plato, el cometario existe y si son los mismos usuarios
            if (req.body.rating) {//verifico si existe el rating
                dish.comments.id(req.params.commentId).rating =  req.body.rating;//modifico el raing con el request dado
                
            }
            if (req.body.comment){//verifico si exsite el comentario
                dish.comments.id(req.params.commentId).comment = req.body.comment;//modifico el comentario con el request dado
            }
            dish.save()//guardo los cambios
            .then((dish) => {//promesa que devuelve el plato guardado
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((populatedDish) =>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'appliaction/json');
                    res.json(populatedDish);
                })

            }, (err) => next(err));
        }
        else if(dish == null) {//si no existe el plato
            err = new Error('Dish' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err)
        }
        else if(comment == null) {//si no existe el comentario
            err = new Error('Comment' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err)
        }
        else if (!req.user._id.equals(comment.author._id)){
            err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err)
        }
    },(err)=> next(err))
    .catch((err)=> next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Dishes.findById(req.params.dishId) // busco el plato
    .then((dish) =>{// promesa que devuelve plato despues de buscarlo
        var comment = dish.comments.id(req.params.commentId);
        if (dish != null && comment != null && req.user._id.equals(comment.author._id) ) {// verifico si el plato y el cometario existe
            dish.comments.id(req.params.commentId).remove();//elimino el comentario
            dish.save()//guardo los cambios
            .then((dish) => {//promesa que devuelve el plato guardado
                Dishes.findById(dish._id)//Busco el plato para popularlo con los comentarios para asi devolver bien los datos
                .populate('comments.author')
                .then((populatedDish) =>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'appliaction/json');
                    res.json(populatedDish);
                })

            }, (err) => next(err));
        }
        else if(dishh == null) {//si no existe el plato
            err = new Error('Dish' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err)
        }
        else if(comment == null) {//si no existe el comentario
            err = new Error('Comment' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err)
        }
        else if (!req.user._id.equals(comment.author._id)){
            err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err)
        }
    },(err)=> next(err))
    .catch((err)=> next(err));
});

module.exports = dishRouter; 