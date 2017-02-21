

'use strict';

const publishModel = require('../models/publish');
const tools = require('../common/tools');
const _ = require('lodash');
const config=require('../config');
const baseController = require('./base_controller')

const projectCategory = {
    create : function(req, res, next){
        let publishName = tools.getParam(req,'publishName');
        let ip = tools.getParam(req,'ip');
        let dir = tools.getParam(req,'dir');
        let domain = tools.getParam(req,'domain');
        let generate = tools.getParam(req,'generate');
        if (tools.notEmpty([name])) {
            return tools.sendResult(res,-1);
        }
        publishModel.create({
            publishName:publishName,
            ip:ip,
            dir:dir,
            domain:domain,
            generate:generate
        }).then(record =>{
            tools.sendResult(res,0);
        }).catch(err => {
                // return next(err);
            return tools.sendResult(res,600);
        })
    },

    edit : function(req, res, next){
        // let operateName = tools.getParam(req,'key');
        let publishName = tools.getParam(req,'publishName');
        // let ip = tools.getParam(req,'ip');
        // let dir = tools.getParam(req,'dir');
        // let domain = tools.getParam(req,'domain');
        // let generate = tools.getParam(req,'generate');
        let id = tools.getParam(req,'id');

        if (tools.notEmpty([publishName])) {
            return tools.sendResult(res,-1);
        }
        let _record = {
            publishName:publishName,
            // ip:ip,
            // dir:dir,
            // domain:domain,
            // generate:generate
            _id:id
        }
        publishModel.getById(_record._id).then( reData => {
            if(_.isEmpty(reData)){
                return tools.sendResult(res,1000);
            }

            let modify = _.extend(reData, _record);
            modify.save((err, reData) => {
                if (err) {
                    return tools.sendResult(res,500)
                }
                tools.sendResult(res,0)
            })
        }).catch(err => {
            //return next(err);
            return tools.sendResult(res,600);
        });
    },

    del : function(req, res, next) {
        baseController.del.apply(publishModel,arguments)
    },

    list : function(req, res){
        publishModel.find({},'_id publishName ').then(reData =>{
            // if(_.isEmpty(reData)){
            //     return tools.sendResult(res,1000);
            // }

            tools.sendResult(res,0,reData);
        }).catch(err =>{
            return tools.sendResult(res,600);
        })
    }
}

module.exports = projectCategory;



