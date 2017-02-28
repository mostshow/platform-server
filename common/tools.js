
'use strict'
const moment = require('moment');
const _  = require('lodash');
const WebStatus = require('./webStatus');
const config = require('../config');
const Promise=require('bluebird');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const util = require("util");
const env = process.env.NODE_ENV || "development";
const consolePrint = config.debug ;
const mailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const transport = mailer.createTransport(smtpTransport(config.mail_opts));

moment.locale('zh-cn');

if (!fs.existsSync("./log")) {
    fs.mkdirSync("./log");
}
const tools = {

    formatDate : function(date, friendly) {
        date = moment(date);
        if (friendly) {
            return date.fromNow();
        } else {
            return date.format('YYYY-MM-DD HH:mm');
        }
    },

    logger:function(infos,logType = 'info') {
        let filePrint = logType !== 'debug';
        let prefix = '*describe*';
        let end = '**';
        let logStr = ''

        if(_.isObject(infos)){
            logStr = JSON.stringify(infos);
            console.log(logStr)
        }else{
            logStr = infos
        }
        let line =  util.format('[%s]:%s%s%s%s',logType,prefix,logStr,end,moment().format());
        if (filePrint)
            fs.appendFile('./log/' + env + '.log', line + "\n");
        if (consolePrint)
            console.log(line);
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

    sendMail : function (data) {
        let ctx = this;
        transport.sendMail(data, function(err) {
            if (err) {
                ctx.logger(err,'error');
            }
        });
    },

    sendProjectMail : function(opt = {username:'',project:'',action:'',version:''}) {
        var from = util.format('%s <%s>', config.name, config.mail_opts.auth.user);
        var to = config.mailTo.join(',');
        var subject = '项目'+opt.action + '邮件';
        var html = [
            '<p> 服务器：{{server}} </p>',
            '<p> 项目：{{project}} </p>',
            '<p> 状态：{{action}}成功 </p>',
            '<p> 访问地址：{{address}} </p>',
            '<p> 版本：{{version}} </p>',
            '<p> 操作人：{{username}} </p>',
            '<p> 日志：{{onlineLog}}</p>'
        ].join(' ').replace(/{{(.*?)}}/g,function(item,$1){
            return opt[$1]||'N/A'
        })
        this.sendMail({
            from: from,
            to: to,
            subject: subject,
            html: html
        });
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
