
'use strict'
const UserModel = require('../models/user');

const CertMiddleWare = require('../common/cert');
const tools= require('../common/tools');

const Promise=require('bluebird');
const config = require('../config');
const _  = require('lodash');
const baseController = require('./base_controller')
const jwt = require('jsonwebtoken');


const User = {
    create : function(req, res, next) {
        let username = tools.getParam(req,'username');
        let password = tools.getParam(req,'password');
        let rePassword = tools.getParam(req,'rePassword');
        let roleId = tools.getParam(req,'roleId');
        let email = tools.getParam(req,'email');
        let _user = {
            username:username,
            password:password,
            email:email,
            roleId:roleId
        }

        if (tools.notEmpty([username, password, email, rePassword, roleId])) {
            return tools.sendResult(res,-1);
        }
        if (password !== rePassword) {
            return tools.sendResult(res,-6);;
        }
        UserModel.getUserByUserName( _user.username).then(reData => {
            if (reData) {
                return tools.sendResult(res,-4);
            }
            let user = new UserModel(_user)
            user.save((err, user) => {
                if (err) {
                    tools.sendResult(res,-1);
                }
                tools.sendResult(res,0);
            })
        }).catch(err => {
            //return next(err);
            return tools.sendResult(res,-1);
        });
    },
    login : function(req, res, next) {
        let username = tools.getParam(req,'username');
        let password = tools.getParam(req,'password');
        if (!username || !password) {
            return tools.sendResult(res,-1);
        }

        UserModel.getUserByUserName(username).then(user => {
            if (!user) {
                return tools.sendResult(res,1000);
            }
            let passhash = user.password;
            user.comparePassword(password, (err, isMatch)=> {
                if (err) {
                    return tools.sendResult(res,500)
                }
                if (isMatch) {
                    CertMiddleWare.rootSession(user, res, next);
                    const token = jwt.sign({
                        username:user.username,
                        id:user._id,
                        roleId:user.roleId
                    }, config.jwtSecret);
                    const result = {
                        token:token
                    }
                    tools.sendResult(res,0,result)
                }else{
                    tools.sendResult(res,1000)
                }
            })
        }).catch(err => {
            //return next(err);
            return tools.sendResult(res,-1);
        });

    },
    logout : function(req, res, next) {
        req.session.destroy();
        res.clearCookie(config.certCookieName, {
            path: '/'
        });
        tools.sendResult(res,0)
    },
    list : function(req,res,next){

        let dataFrom = tools.getParam(req,'dataFrom')||config.defaultDataFrom;
        let dataCount = tools.getParam(req,'dataCount')||config.defaultDataCount;
        let options = {skip: Number(dataFrom), limit: Number(dataCount), sort: {createAt: -1}};
        Promise.props({
            reData:UserModel.find({},'_id username roleId email createAt',options).populate('roleId','rolename'),
            totalRecord:UserModel.count({})
        }).then(reData => {
            tools.sendResult(res,0,reData);
        }).catch(err =>{
            return tools.sendResult(res,600);
        })

    },
    del : function(req, res, next) {
        baseController.del.apply(pictureModel,arguments)
    },
    edit : function(req, res, next){
        let username = tools.getParam(req,'username');
        let password = tools.getParam(req,'password');
        let rePassword = tools.getParam(req,'rePassword');
        let roleId = tools.getParam(req,'roleId');
        let email = tools.getParam(req,'email');
        let id = tools.getParam(req,'id');
        let _user = {
            username:username,
            password:password,
            roleId:roleId,
            email:email,
            _id:id
        }

        if (tools.notEmpty([username, email,  password, rePassword, roleId ,id])) {
            return tools.sendResult(res,-1);
        }
        if (password !== rePassword) {
            return tools.sendResult(res,-6);;
        }

        UserModel.getUserById(_user._id).then( reData => {
            if(!reData){
                return tools.sendResult(res,1000);
            }

            UserModel.getUserByUserName(_user.username).then(user => {
                if (user && user._id != _user._id) {
                    return tools.sendResult(res,-4);
                }
                let modifyUser = _.extend(reData, _user);
                modifyUser.save((err, reData) => {
                    if (err) {
                        return tools.sendResult(res,500)
                    }
                    tools.sendResult(res,0)
                })
            }).catch(err => {
                return next(err);
            });
        }).catch(err => {
            //return next(err);
            return tools.sendResult(res,-1);
        });
    },
    modify : function(req, res, next){

        let username = tools.getParam(req,'username');
        let password = tools.getParam(req,'password');
        let newPassword = tools.getParam(req,'newPassword');
        let rePassword = tools.getParam(req,'rePassword');
        let id = tools.getParam(req,"id");
        if (!username || !password|| !newPassword|| !id || !rePassword) {
            return tools.sendResult(res,-1);
        }

        if (newPassword !== rePassword) {
            return tools.sendResult(res,-6);;
        }
        let _user = {
            username:username,
            password:newPassword,
            _id:id
        }
        UserModel.getUserById(_user._id).then( reData => {
            if(!reData){
                return tools.sendResult(res,1000);
            }else if(reData.username != _user.username){
                return tools.sendResult(res,-7);
            }
            reData.comparePassword(password, (err, isMatch)=> {
                if (err) {
                    return tools.sendResult(res,500)
                }
                if (isMatch) {
                    let user = _.extend(reData, _user);
                    user.save((err, reData) => {
                        if (err) {
                            return tools.sendResult(res,500)
                        }
                        tools.sendResult(res,0)
                    })
                }else{
                    tools.sendResult(res,1000)
                }
            })
        }).catch(err => {
            return tools.sendResult(res,-1);
            //return next(err);
        });
    }
}
module.exports = User;

