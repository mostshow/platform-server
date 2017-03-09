
'use strict'
const express=require('express');
const path=require('path');
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
const session=require('express-session');
const mongokeeper = require('./models/mongokeeper');
const webRouter=require('./routes/web_router');
const apiRouter=require('./routes/api_router');
const config=require('./config');
const CertMiddleWare = require('./common/cert');
const app=express();

app.enable('trust proxy');

app.use(express.static(path.join(__dirname,'../view')));
// app.set('trust proxy',1) // trust first proxy
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser(config.certCookieName));

process.env.NODE_ENV='development';

if (process.env.NODE_ENV=='development') {
    process.env.MONGO_DB_STR = config.dbConfig; //config.devDbUrl;
}
if (process.env.NODE_ENV=='development') {
    let MongoStore = require('connect-mongo')(session);
    app.use(session({
        secret: config.sessionSecret,
        key: config.certCookieName,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24
        },
        resave: true,
        saveUninitialized: false,
        store: new MongoStore({
            url: config.devDbUrl
        })
    }));

} else {
    //redis保存session
    const redis = require('redis');
    const RedisStore = require('connect-redis')(session);
    const client = redis.createClient(config.redis_port, config.redis_port,config.redis_opt);
    client.on("error", function(err) {
        console.log("redis client Error " + err);
    });
    client.auth(config.redis_auth);
    app.use(session({
        secret: config.session_secret,
        key: config.auth_cookie_name,
        store: new RedisStore({
            client: client
        }),
        resave: true,
        saveUninitialized: false
    }));
}
mongokeeper.config(config.dbConfig);

app.use(CertMiddleWare.setHeader);
app.use(CertMiddleWare.authUser);
app.use('/',webRouter);
app.use('/api',apiRouter);

app.listen(config.httpPort, function() {
    console.log("You can debug your app with http://" + config.localhost + ':' +config.httpPort );
});

module.exports = app;
