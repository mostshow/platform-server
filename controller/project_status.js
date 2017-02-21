

'use strict';

const projectStatusModel = require('../models/project_status');
const tools = require('../common/tools');
const _ = require('lodash');
const config=require('../config');
const baseController = require('./base_controller')

const projectStatus = {
    create : function(req, res, next){
        let name = tools.getParam(req,'name');
        let className = tools.getParam(req,'className');
        if (tools.notEmpty([name, className])) {
            return tools.sendResult(res,-1);
        }
        projectStatusModel.create({
            name:name,
            className:className
        }).then(record =>{
            tools.sendResult(res,0);
        }).catch(err => {
                // return next(err);
            return tools.sendResult(res,600);
        })
    },

    edit : function(req, res, next){
        // let operateName = tools.getParam(req,'key');
        let name = tools.getParam(req,'name');
        let className = tools.getParam(req,'className');
        let id = tools.getParam(req,'id');

        let _record = {
            name:name,
            className:className,
            _id:id
        }

        if (tools.notEmpty([name, id, className])) {
            return tools.sendResult(res,-1);
        }
        projectStatusModel.getById(_record._id).then( reData => {
            if(!reData){
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
        baseController.del.apply(projectStatusModel,arguments)
    },

    list : function(req, res){
        projectStatusModel.find({},'_id name className').then(reData =>{
            if(!reData){
                return tools.sendResult(res,1000);
            }
            tools.sendResult(res,0,reData);
        }).catch(err =>{
            return tools.sendResult(res,600);
        })
    }
}

module.exports = projectStatus;




