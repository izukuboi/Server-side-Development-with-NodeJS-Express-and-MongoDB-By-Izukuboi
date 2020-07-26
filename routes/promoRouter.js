const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Conten-Type', 'text/plain');
    next();
})
.get((req,res,next) =>{
    res.end('Will send all the promotions to you!');
})
.post((req,res,next) =>{
    res.end('Will add the promotion: '+ req.body.name + ' with details: '+ req.body.description);
})
.put((req,res,next) =>{
    res.statusCode = 403;
    res.end('PUT operation not suported on /promotions');
})
.delete((req,res,next) =>{
    res.end('Deleting all the promotions to you!');
});

promoRouter.get('/:promoId', (req,res,next) =>{
    res.end('Will send details of the promotion: '+ req.params.promoId +' to you');
})
.post('/:promoId', (req,res,next) =>{
    res.statusCode = 403;
    res.end('PUT operation not suported on /promotions/'+ req.params.promoId);
})
.put('/:promoId', (req,res,next) =>{
    res.write('Updating the promotion: '+ req.params.promoId+ '\n'); 
    res.end('Will update the promotion: ' + req.body.name +' with details: '+ req.body.description);
})
.delete('/:promoId', (req,res,next) =>{
    res.end('Deleting promotion:'+ req.params.promoId);
})

module.exports = promoRouter; 