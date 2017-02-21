

'use strict';

const pictureModel = require('../models/picture');
const tools = require('../common/tools');
const _ = require('lodash');
const Promise=require('bluebird');
const config=require('../config');
const baseController = require('./base_controller')

const picture = {
    create : function(req, res, next){
        let categoryId = tools.getParam(req,'categoryId');
        let thumbnail = tools.getParam(req,'thumbnail');
        let url = tools.getParam(req,'url');
        let name = tools.getParam(req,'name');
        let type = tools.getParam(req,'type');
        let size = tools.getParam(req,'size');
        if (tools.notEmpty([categoryId, url ,name])) {
            return tools.sendResult(res,-1);
        }

        pictureModel.create({
            name:name,
            category:categoryId,
            thumbnail:thumbnail,
            url:url,
            size:size,
            type:type
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
        let categoryId = tools.getParam(req,'categoryId');
        let id = tools.getParam(req,'id');
        if (tools.notEmpty([categoryId, id ,name])) {
            return tools.sendResult(res,-1);
        }
        let _record = {
            name:name,
            category:categoryId,
            _id:id
        }

        if (tools.notEmpty([name,category])) {
            return tools.sendResult(res,-1);
        }
        pictureModel.getById(_record._id).then( reData => {
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
        baseController.del.apply(pictureModel,arguments)
    },

    list : function(req, res,next){

        let dataFrom = tools.getParam(req,'dataFrom')||config.defaultDataFrom;
        let dataCount = tools.getParam(req,'dataCount')||config.defaultDataCount;
        let options = {skip: Number(dataFrom), limit: Number(dataCount), sort: {createAt: -1}};
        Promise.props({
            reData:pictureModel.find({},'_id name url  category thumbnail createAt updateAt',options).populate('category','name'),
            totalRecord:pictureModel.count({})
        }).then(reData => {
            if(!reData){
                return tools.sendResult(res,1000);
            }
            tools.sendResult(res,0,reData);
        }).catch(err =>{
            return next(err)
            return tools.sendResult(res,600);
        })
    },
    view : function(req,res){
        let id = tools.getParam(req,'id');
        if (tools.notEmpty([id])) {
            return tools.sendResult(res,-1);
        }
        pictureModel.findOne({'_id':id},'_id name url  category thumbnail createAt updateAt').populate('category','name').
            then(reData =>{
            if(!reData){
                return tools.sendResult(res,1000);
            }
            tools.sendResult(res,0,reData);
        })
    }
}

module.exports = picture;



