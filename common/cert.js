/**
 * 用户权限控制
 */
'use strict'
const mongoose = require('mongoose');
const UserModel = require('../models/user');
const OperateRoleModel = require('../models/operate_role');
const RoleModel = require('../models/role');
const config = require('../config');
const Promise=require('bluebird');

const WebStatus = require('./webStatus');


const CertMiddleWare = {
    /**
     * 需要登录
     */
    userRequired:function (req, res, next) {
        if (!req.session || !req.session.user) {
            return res.send(WebStatus.init(-3).toJSON());
        }
        next();
    },
    /**
     * 需要管理员权限
     */
    adminRequired:function(req, res, next) {
        if (!req.session.user) {
            return res.send(WebStatus.init(-3).toJSON());
        }
        if (req.session.userRoleId != config.adminRoleId ) {
            return res.send(WebStatus.init(403).toJSON());
        }
        next();
    },
    /**
     * cookie签名保存
     */
    rootSession:function(user, res, next) {
        let authToken = user._id + '$$$$';
        let opts = {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7 ,
            signed: true, //如果true,express会使用req.secret来完成签名，需要cookie-parser配合使用
            httpOnly: true
        };
        res.cookie(config.certCookieName, authToken, opts);
        next();
    },

    /**
     * 权限操作控制
     */
    accessControl : function(req,res,next){
        if (!req.session.user) {
            return res.send(WebStatus.init(-3).toJSON());
        }
        // if (req.session.userRoleId != config.adminRoleId ) {

            let url = req.baseUrl;
            let singleUrl = url.replace('/api/','');
            let tempUrl = singleUrl.split('/');

            tempUrl.pop();
            tempUrl.push('*');

            let multipleUrl = tempUrl.join('/');
            Promise.props({
                singleData:OperateRoleModel.getRoleIdByRoute(singleUrl),
                multipleData:OperateRoleModel.getRoleIdByRoute(multipleUrl)
            }).then(reData => {
                let singleArr = (reData.singleData&&reData.singleData.roleId)||[];
                let multipleDataArr = (reData.multipleData&&reData.multipleData.roleId)||[];
                let roleId =req.session.user.roleId;
                let tempArr = multipleDataArr.concat(singleArr).map(function(item){return String(item)})
                if(~tempArr.indexOf(String(roleId))){
                    next()
                }else{
                    res.send(WebStatus.init(403).toJSON());
                }
            }).catch(err =>{
                res.send(WebStatus.init(500).toJSON());
            })
        // }else{
        //     next()
        // }
    },
    /**
     * setHeader
     *
     */
    setHeader: function(req, res, next){
        //res.setHeader("Content-Type","text/html;charset=utf-8");
        res.setHeader('Access-Control-Allow-Origin', '*');
        // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3011');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
        next();
    },
    /**
     * 验证用户是否登录
     */
    authUser:function(req, res, next) {
        if (req.session.user) {
            setUser(req.session.user);
        } else {
            let authToken = req.signedCookies[config.certCookieName];
            if (!authToken) {
                return next();
            }
            let auth = authToken.split('$$$$');
            let userId = auth[0];

            UserModel.getUserById(userId).then(user=>{
                setUser(user);
                return null;
            }).catch(err=>{
                return next(err);
            });
        }

        function setUser(user) {
            if (!user) {
                return next();
            }
            user = req.session.user = new UserModel(user);
            RoleModel.findOne({_id:user.roleId}).then(reData =>{
                req.session.userRoleId = reData.roleId;
                next();
            }).catch(err=>{
                console.log(err)
                res.send(WebStatus.init(-8).toJSON());
                // return next(err);
            });

        }
    }
}


module.exports = CertMiddleWare;
