const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.get((req,res,next) =>{
    Dishes.find({})
    .then((dishes) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(dishes);
    }, (err) =>next(err))
    .catch((err)=> next(err));
})
.post((req,res,next) =>{
    Dishes.create(req.body)
    .then((dish) =>{
        console.log('Dish Created', dish.toJSON());
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(dish);
        
    },(err)=> next(err))
    .catch((err)=> next(err));
})
.put((req,res,next) =>{
    res.statusCode = 403;
    res.end('PUT operation not suported on /dishes');
})
.delete((req,res,next) =>{
    Dishes.remove({})
    .then((resp)=> {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(resp);
    }, (err)=> next(err))
    .catch((err)=> next(err))
});

dishRouter.route('/:dishId')
.get((req,res,next) =>{
    Dishes.findById(req.params.dishId)
    .then((dish) =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(dish);
    },(err)=> next(err))
    .catch((err)=> next(err));
})
.post((req,res,next) =>{
    res.statusCode = 403;
    res.end('PUT operation not suported on /dishes/'+ req.params.dishId);
})
.put((req,res,next) =>{
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
.delete((req,res,next) =>{
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp)=> {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliaction/json');
        res.json(resp);
    }, (err)=> next(err))
    .catch((err)=> next(err))
});

dishRouter.route('/:dishId/comments')
.get((req,res,next) =>{
    Dishes.findById(req.params.dishId)
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
.post((req,res,next) =>{
    Dishes.findById(req.params.dishId)
    .then((dish) =>{
        if (dish != null) {
            dish.comments.push(req.body);
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'appliaction/json');
                res.json(dish);
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
.put((req,res,next) =>{
    res.statusCode = 403;
    res.end('PUT operation not suported on /dishes' + req.params.dishId + '/comments');
})
.delete((req,res,next) =>{
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
.get((req,res,next) =>{
    Dishes.findById(req.params.dishId)
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
.post((req,res,next) =>{
    res.statusCode = 403;
    res.end('PUT operation not suported on /dishes/'+ req.params.dishId + '/comments/' + req.params.commentId);
})
.put((req,res,next) =>{
    Dishes.findById(req.params.dishId) // busco el plato
    .then((dish) =>{// promesa que devuelve plato despues de buscarlo
        if (dish != null && dish.comments.id(req.params.commentId) != null) {// verifico si el plato y el cometario existe
            if (req.body.rating) {//verifico si existe el rating
                dish.comments.id(req.params.commentId).rating =  req.body.rating;//modifico el raing con el request dado
                
            }
            if (req.body.comment){//verifico si exsite el comentario
                dish.comments.id(req.params.commentId).comment = req.body.comment;//modifico el comentario con el request dado
            }
            dish.save()//guardo los cambios
            .then((dish) => {//promesa que devuelve el plato guardado
                res.statusCode = 200;
                res.setHeader('Content-Type', 'appliaction/json');
                res.json(dish);
            }, (err) => next(err));
        }
        else if(dishh == null) {//si no existe el plato
            err = new Error('Dish' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err)
        }
        else {//si no existe el comentario
            err = new Error('Comment' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err)
        }
    },(err)=> next(err))
    .catch((err)=> next(err));
})
.delete((req,res,next) =>{
    Dishes.findById(req.params.dishId) // busco el plato
    .then((dish) =>{// promesa que devuelve plato despues de buscarlo
        if (dish != null && dish.comments.id(req.params.commentId) != null) {// verifico si el plato y el cometario existe
            dish.comments.id(req.params.commentId).remove();//elimino el comentario
            dish.save()//guardo los cambios
            .then((dish) => {//promesa que devuelve el plato guardado
                res.statusCode = 200;
                res.setHeader('Content-Type', 'appliaction/json');
                res.json(dish);
            }, (err) => next(err));
        }
        else if(dishh == null) {//si no existe el plato
            err = new Error('Dish' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err)
        }
        else {//si no existe el comentario
            err = new Error('Comment' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err)
        }
    },(err)=> next(err))
    .catch((err)=> next(err));
});

module.exports = dishRouter; 