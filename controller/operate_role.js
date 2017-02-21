

'use strict';

const OperateRoleModel = require('../models/operate_role');
const tools = require('../common/tools');
const _ = require('lodash');
const Promise=require('bluebird');
const config=require('../config');
const baseController = require('./base_controller')

const OperateRole = {
    create : function(req, res, next){
        let operateName = tools.getParam(req,'operateName');
        let route = tools.getParam(req,'route');
        let roleIdArr = tools.getParam(req,'roleIdArr');
        if (tools.notEmpty([operateName, route ])) {
            return tools.sendResult(res,-1);
        }
        if(!_.isArray(roleIdArr)){
            roleIdArr = roleIdArr.split(',');
        }
        OperateRoleModel.create({
            operateName:operateName,
            route:route,
            roleId:roleIdArr
        }).then(role =>{
            tools.sendResult(res,0);
        }).catch(err => {
                // return next(err);
            return tools.sendResult(res,600);
        })
    },

    edit : function(req, res, next){
        let operateName = tools.getParam(req,'operateName');
        let route = tools.getParam(req,'route');
        let roleIdArr = tools.getParam(req,'roleIdArr');
        let id = tools.getParam(req,'id');

        if(!_.isArray(roleIdArr)){
            roleIdArr = roleIdArr.split(',');
        }
        let _operateRole = {
            operateName:operateName,
            route:route,
            roleId:roleIdArr,
            _id:id
        }

        if (tools.notEmpty([operateName, route,id])) {
            return tools.sendResult(res,-1);
        }
        OperateRoleModel.getOperateNameById(_operateRole._id).then( reData => {
            if(!reData){
                return tools.sendResult(res,1000);
            }
            let modifyOperateRole = _.extend(reData, _operateRole);
            modifyOperateRole.save((err, reData) => {
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
            reData:OperateRoleModel.find({},'_id operateName route roleId createAt updateAt',options).populate('roleId' , 'rolename roleId'),
            totalRecord:OperateRoleModel.count({})
        }).then(reData => {
            tools.sendResult(res,0,reData);
        }).catch(err =>{
            return tools.sendResult(res,600);
        })
    },
    view : function(req,res){
        let id = tools.getParam(req,'id');
        if (tools.notEmpty([id ])) {
            return tools.sendResult(res,-1);
        }
        console.log(id)
        OperateRoleModel.findOne({'_id':id},'_id operateName route roleId createAt updateAt').populate('roleId' , 'rolename roleId').
            then(reData =>{
            tools.sendResult(res,0,reData);
        })
    },

}

module.exports = OperateRole;

