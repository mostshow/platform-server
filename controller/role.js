
'use strict';

// import RoleModel from '../models/role'
// import tools from '../common/tools'


const RoleModel = require('../models/role');
const OperateRoleModel = require('../models/operate_role');
const tools = require('../common/tools');
const Promise=require('bluebird');
const _  = require('lodash');
const config=require('../config');
const baseController = require('./base_controller')

const Role = {
    create : function(req, res){
        let rolename = tools.getParam(req,'rolename');
        let roleId = tools.getParam(req,'roleId');
        if (tools.notEmpty([rolename, roleId ])) {
            return tools.sendResult(res,-1);
        }
        RoleModel.create({
            rolename:rolename,
            roleId:roleId
        }).then(role =>{
            tools.sendResult(res,0);
        }).catch(err => {
            //     return next(err);
            return tools.sendResult(res,-1);
        })
    },
    edit : function(req, res, next){
        let rolename = tools.getParam(req,'rolename');
        let roleId = tools.getParam(req,'roleId');
        let id = tools.getParam(req,'id');
        let _role = {
            rolename:rolename,
            roleId:roleId,
            _id:id
        }

        if (tools.notEmpty([rolename, roleId,id])) {
            return tools.sendResult(res,-1);
        }
        RoleModel.getRoleNameByRoleId(_role._id).then( reData => {
            if(!reData){
                return tools.sendResult(res,1000);
            }
            let modifyRole = _.extend(reData, _role);
            modifyRole.save((err, reData) => {
                if (err) {
                    return tools.sendResult(res,500)
                }
                tools.sendResult(res,0)
            })
        }).catch(err => {
            return tools.sendResult(res,600);
        });
    },

    del : function(req, res, next) {
        baseController.del.apply(RoleModel,arguments)
    },

    list : function(req, res){

        let dataFrom = tools.getParam(req,'dataFrom')||config.defaultDataFrom;
        let dataCount = tools.getParam(req,'dataCount')||config.defaultDataCount;
        let options = {skip: Number(dataFrom), limit: Number(dataCount), sort: {createAt: -1}};
        Promise.props({
            reData:RoleModel.find({},'_id rolename roleId createAt updateAt',options),
            totalRecord:RoleModel.count({})
        }).then(reData => {
            tools.sendResult(res,0,reData);
        }).catch(err =>{
            return tools.sendResult(res,600);
        })
    }
}

module.exports = Role;

