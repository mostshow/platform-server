/**
 * 数据库连接
 */
'use strict'
const mongoose = require('mongoose');
const Promise = require('bluebird');

function MongooseKeeper() {
    this.db = mongoose.createConnection();
    mongoose.set('debug', true)
    this.open_count = 0;
}

MongooseKeeper.prototype.config = function(conf) {

    let connStr;
    mongoose.Promise = Promise;
    if (process.env.MONGO_DB_STR) {
        connStr = process.env.MONGO_DB_STR;
    }
    mongoose.connect(connStr, function(err) {
        if (err) {
            console.error('connect to %s error: ', connStr, err.message);
            // process.exit(1);
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
    });

};

exports = module.exports = new MongooseKeeper();

