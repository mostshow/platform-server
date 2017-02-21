'use strict'
const moment = require('moment');
const _  = require('lodash');
const WebStatus = require('./webStatus');
const config = require('../config');
const Promise=require('bluebird');
const bcrypt = require('bcryptjs');

moment.locale('zh-cn');
const tools = {
    formatDate : function(date, friendly) {
        date = moment(date);
        if (friendly) {
            return date.fromNow();
        } else {
            return date.format('YYYY-MM-DD HH:mm');
        }
    },

    getParam : function(req, fieldName){
        let fieldValue = req.body[fieldName] || req.query[fieldName];
        return _.trim(fieldValue);
    },

    bhash : function(str) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(str, config.SALT_WORK_FACTOR, (err, result) => {
                if (err) {
                    let oErr = WebStatus.init(-1);
                    oErr.setMsg(err)
                    reject(oErr);
                }
                resolve(result);
            });
        });
    },
    notEmpty : function(data){
        if (data.some(function(item) {return _.trim(item) === '';})) {
            return true;
        }
        return false;
    },
    sendResult : function(res,statusCode,data) {
        WebStatus.init(statusCode);
        if (data) {
            WebStatus.setResult(data)
        }
        res.send(WebStatus.toJSON())
    },

    reObj : function(origin,param){
        let temp = {}
        _.each(param,function(n){
            if (Object.hasOwnProperty.call(origin,n)) {
                temp[n] = origin[n];
            }
        })
        return temp;
    }
}
module.exports = tools;
