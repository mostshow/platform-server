

'use strict';

const projectCategoryModel = require('../models/project_category');
const tools = require('../common/tools');
const _ = require('lodash');
const config=require('../config');
const Promise=require('bluebird');
const baseController = require('./base_controller')

const projectCategory = {
    create : function(req, res, next){
        let name = tools.getParam(req,'name');
        if (tools.notEmpty([name])) {
            return tools.sendResult(res,-1);
        }

        projectCategoryModel.create({
            name:name,
            createBy:req.session.user._id,
            updateBy:req.session.user._id
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
        let id = tools.getParam(req,'id');

        let _record = {
            name:name,
            _id:id
        }

        if (tools.notEmpty([name, id])) {
            return tools.sendResult(res,-1);
        }
        projectCategoryModel.getById(_record._id).then( reData => {
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
        baseController.del.apply(projectCategoryModel,arguments)
    },

    list : function(req, res){

        Promise.props({
            reData:projectCategoryModel.find({},'_id name createBy updateBy')
            .populate('createBy','username')
            .populate('updateBy','username'),
        }).then(reData => {
            if(!reData){
                tools.sendResult(res,1000);
                return  null;
            }
            tools.sendResult(res,0,reData);
            return  null;
        }).catch(err =>{
            return tools.sendResult(res,600);
        })
    }
}

module.exports = projectCategory;



