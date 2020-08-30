var passport = require('passport');
var localStrategy = require('passport-local');
var User = require('./models/user');
var JwtStrategy =  require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FacebookTokeStrategy = require('passport-facebook-token');

var config = require('./config');

exports.local = passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); 
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if(err){
                return done(err,false);
            }
            else if(user){
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req, res, next) => {
    if(req.user.admin){
        return next();
    }
    else {
        err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
}

exports.facebookPassport =  passport.use(new 
FacebookTokeStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret 
    }, (accessToken, refreshToken, profile, done) => {
        User.findOne({facebookId: profile.id}, (err, user)=> { // al autenticarse primero busca el usuario
        
            if (err){
                return done(err, false);
            }
            if (!err && user !== null){
                return done(null, user);
            }
            else {//Registro de usuario primer login
                user =  new User({ username: 
                profile.displayName});
                user.facebookId = profile.id;//para que funcione el login
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if (err){
                        return done(err, false);
                    }
                    else{
                        return done(null, user);
                    }
                })
            }
        });
    }

));

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZjM2MGM4ZGIyNmFhNzBhYWM4MGY1YTEiLCJpYXQiOjE1OTczNzc3NTQsImV4cCI6MTU5NzM4MTM1NH0.VCSXm2ZaI5mDDCvPb3tSgDKemYNNdtayiB8A3_M_PGk
//5f360defb26aa70aac80f5a3