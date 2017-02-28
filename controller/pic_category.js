

'use strict';

const picCategoryModel = require('../models/pic_category');
const pictureModel = require('../models/picture');
const tools = require('../common/tools');
const Promise=require('bluebird');
const _ = require('lodash');
const config=require('../config');
const baseController = require('./base_controller')

const picCategory = {
    create : function(req, res, next){
        let name = tools.getParam(req,'name');
        let pid = tools.getParam(req,'pid');
        if (tools.notEmpty([name ])) {
            return tools.sendResult(res,-1);
        }
        picCategoryModel.create({
            name:name,
            pid:pid||config.firstPid
        }).then(record =>{
            tools.sendResult(res,0);
        }).catch(err => {
                return next(err);
            return tools.sendResult(res,600);
        })
    },

    edit : function(req, res, next){
        // let operateName = tools.getParam(req,'key');
        let name = tools.getParam(req,'name');
        let pid = tools.getParam(req,'pid');
        let id = tools.getParam(req,'id');

        let _record = {
            name:name,
            pid:pid,
            _id:id
        }

        if (tools.notEmpty([name])) {
            return tools.sendResult(res,-1);
        }
        picCategoryModel.getById(_record._id).then( reData => {
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
        baseController.del.apply(picCategoryModel,arguments)
    },

    list : function(req, res){

        Promise.props({
            reData:picCategoryModel.find({},'_id name createBy updateBy')
            .populate('createBy','username')
            .populate('updateBy','username'),
        }).then(reData => {
            if(!reData){
                return tools.sendResult(res,1000);
            }
            tools.sendResult(res,0,reData);
        }).catch(err =>{
            return tools.sendResult(res,600);
        })
    },
    view : function(req,res){
        let id = tools.getParam(req,'id');
        let dataFrom = tools.getParam(req,'dataFrom')||config.defaultDataFrom;
        let dataCount = tools.getParam(req,'dataCount')||config.defaultDataCount;
        if (tools.notEmpty([id])) {
            return tools.sendResult(res,-1);
        }
        pictureModel.fetch({'category':id}).
            then(reData =>{
                if(!reData){
                    return tools.sendResult(res,1000);
                }
                let results = reData.slice(dataFrom, dataFrom+dataCount)
                tools.sendResult(res,0,{
                    reData:results,
                    totalRecord:reData.length
                });
        })
    }
}

module.exports = picCategory;



