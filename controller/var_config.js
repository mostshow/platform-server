

'use strict';

const varConfigModel = require('../models/var_config');
const tools = require('../common/tools');
const _ = require('lodash');
const Promise=require('bluebird');
const baseController = require('./base_controller')

const varConfig = {
    create : function(req, res, next){
        let key = tools.getParam(req,'key');
        let value = tools.getParam(req,'value');
        let remark = tools.getParam(req,'remark');
        if (tools.notEmpty([key, value ])) {
            return tools.sendResult(res,-1);
        }
        varConfigModel.create({
            key:key,
            value:value,
            remark:remark
        }).then(record =>{
            tools.sendResult(res,0);
        }).catch(err => {
                // return next(err);
            return tools.sendResult(res,600);
        })
    },

    edit : function(req, res, next){
        // let operateName = tools.getParam(req,'key');
        let value = tools.getParam(req,'value');
        let remark = tools.getParam(req,'remark');
        let id = tools.getParam(req,'id');

        let _record = {
            value:value,
            remark:remark,
            _id:id
        }

        if (tools.notEmpty([value])) {
            return tools.sendResult(res,-1);
        }
        varConfigModel.getById(_record._id).then( reData => {
            if(!reData){
                return tools.sendResult(res,1000);
            }
            let modifyConfig = _.extend(reData, _record);
            modifyConfig.save((err, reData) => {
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

    list : function(req, res){

        let dataFrom = tools.getParam(req,'dataFrom')||config.defaultDataFrom;
        let dataCount = tools.getParam(req,'dataCount')||config.defaultDataCount;
        let options = {skip: Number(dataFrom), limit: Number(dataCount), sort: {createAt: -1}};
        Promise.props({
            reData:varConfigModel.find({},'_id key value remark createAt updateAt',options),
            totalRecord:varConfigModel.count({})
        }).then(reData => {
            tools.sendResult(res,0,reData);
        }).catch(err =>{
            return tools.sendResult(res,600);
        })
    },
    view : function(req,res){
        let id = tools.getParam(req,'id');
        varConfigModel.findOne({'_id':id},'_id key value remark createAt updateAt').
            then(reData =>{
            tools.sendResult(res,0,reData);
        })
    }
}

module.exports = varConfig;


