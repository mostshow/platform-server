/**
 * 数据库连接
 */
'use strict'
const mongoose = require('mongoose');
const Promise = require('bluebird');
const util = require("util");

function MongooseKeeper() {
    this.db = mongoose.createConnection();
    mongoose.set('debug', true)
    this.open_count = 0;
}

MongooseKeeper.prototype.config = function(conf) {

    mongoose.Promise = Promise;
    let opts = {
        db: {
            native_parser: true
        },
        server: {
            poolSize: 5,
            auto_reconnect: true
        },
        user: conf.userid,
        pass: conf.password
    };
    let connStr;

    if (process.env.MONGO_DB_STR) {
        connStr = process.env.MONGO_DB_STR;
    } else {
         connStr = 'mongodb://{{userid}}:{{password}}@{{host}}:{{port}}/{{database}}'.replace(/\{\{(.*?)\}\}/g,function(item,$1){
              return conf[$1]
         })
    }

    mongoose.connect(connStr, function(err) {
        if (err) {
            console.log(connStr)
            console.error('connect to %s error: ', connStr, err.message);
            process.exit(1);
        }
        console.log('connect is ok!')
    });
    var dbcon = mongoose.connection;
    //监听关闭事件并重连
    dbcon.on('disconnected', function() {
        console.log('disconnected');
        dbcon.close();
    });
    dbcon.on('open', function() {
        console.log('connection success open');
        this.recon = true;
    });
    dbcon.on('close', function(err) {
        console.log('closed');
        // dbcon.open(host, dbName, port, opts, function() {
        // console.log('closed-opening');
        // });
        reConnect('*');
    });

    function reConnect(msg) {
        console.log('reConnect' + msg);
        if (this.recon) {
            console.log('reConnect-**');
            dbcon.open(conf.host, conf.database, conf.port, opts, function() {
                console.log('closed-opening');
            });
            this.recon = false;
            console.log('reConnect-***');
        }
        console.log('reConnect-end');
    }
};

exports = module.exports = new MongooseKeeper();

