
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
/**
  @api {POST} /user/create 创建用户
  @apiVersion 1.0.0
  @apiName create
  @apiGroup user

      @apiParam {String} username  用户
      @apiParam {String} password  密码
      @apiParam {String} rePassword 确认密码
      @apiParam {String} roleId   角色id
      @apiParam {String} email   邮箱

      @apiParamExample {json} Request-Example:
        {
            username:'username',
            password:'password',
            rePassword:'rePassword',
            roleId:'roleId',
            email:'email',
        }
  @apiExample Example usage:
    curl -H "Content-Type: application/json" -X POST http://localhost:3000/user/create

  @apiSuccessExample {json} Success-Response:
    HTTP/1.1 200 OK
    {
        code : 0,
        msg: "msg",
        result:{}
    }

  @apiErrorExample {json} Error-Response:
    HTTP/1.1 422 Unprocessable Entity
      {
        status: -1,
        msg": "error",
        result:{}
      }
 */
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
/**
  @api {POST} /user/login 登录
  @apiVersion 1.0.0
  @apiName login
  @apiGroup user

  @apiParam {String} username  用户名
  @apiParam {String} password   密码

  @apiParamExample {json} Request-Example:
      {
        "username": "username",
        "password": "password"
      }
  @apiExample Example usage:
    curl -H "Content-Type: application/json" -X POST http://localhost:3000/user/login

  @apiSuccessExample {json} Success-Response:
    HTTP/1.1 200 OK
    {
        code : 0,
        msg: "msg",
        result:{}
    }

  @apiErrorExample {json} Error-Response:
    HTTP/1.1 422 Unprocessable Entity
      {
        status: -1,
        msg": "error",
        result:{}
      }
 */
    login : function(req, res, next) {
        let username = tools.getParam(req,'username');
        let password = tools.getParam(req,'password');
        if (!username || !password) {
            return tools.sendResult(res,-1);
        }

        UserModel.getUserByUserName(username).then(user => {
            if (!user) {
                return tools.sendResult(res,-9);
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
                    tools.sendResult(res,-9)
                }
            })
        }).catch(err => {
            //return next(err);
            return tools.sendResult(res,-1);
        });

    },
    /**
      @api {GET} /user/logout    登出
      @apiVersion 1.0.0
      @apiName   logout
      @apiGroup   user

      @apiExample Example usage:
        curl -H "Content-Type: application/json" -X POST http://localhost:3000/user/logout

      @apiSuccessExample {json} Success-Response:
        HTTP/1.1 200 OK
        {
            code : 0,
            msg: "msg",
            result:{}
        }

      @apiErrorExample {json} Error-Response:
        HTTP/1.1 422 Unprocessable Entity
          {
            status: -1,
            msg": "error",
            result:{}
          }
     */
    logout : function(req, res, next) {
        req.session.destroy();
        res.clearCookie(config.certCookieName, {
            path: '/'
        });
        tools.sendResult(res,0)
    },

    /**
      @api {POST} /user/list 用户列表
      @apiVersion 1.0.0
      @apiName list
      @apiGroup user

      @apiParam {Number} dataCount  每页条数
      @apiParam {Number} dataFrom   开始条数

      @apiParamExample {json} Request-Example:
          {
            "dataCount": 10,
            "dataFrom": 0
          }

      @apiExample Example usage:
        curl -H "Content-Type: application/json" -X POST http://localhost:3000/user/list

      @apiSuccessExample {json} Success-Response:
        HTTP/1.1 200 OK
        {
            code : 0,
            msg: "msg",
            result:{
                reData:{
                    _id:'58d495809b2c8f126575f0c8',
                    createAt:'2017-03-24T03:41:52.171Z',
                    email:'yunwei@qguanzi.com',
                    username:'username',
                    roleId:{
                        _id:'58d491f29b2c8f126575f0b4',
                        rolename:'运维'
                    }
                }
            }
        }

      @apiErrorExample {json} Error-Response:
        HTTP/1.1 422 Unprocessable Entity
          {
            status: -1,
            msg": "error",
            result:{}
          }
     */
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

    /**
      @api {POST} /user/del 删除用户
      @apiVersion 1.0.0
      @apiName del
      @apiGroup user

      @apiParam {String} id    用户id

      @apiParamExample {json} Request-Example:
        {
            id:'id'
        }
      @apiExample Example usage:
        curl -H "Content-Type: application/json" -X POST http://localhost:3000/user/del

      @apiSuccessExample {json} Success-Response:
        HTTP/1.1 200 OK
        {
            code : 0,
            msg: "msg",
            result:{}
        }

      @apiErrorExample {json} Error-Response:
        HTTP/1.1 422 Unprocessable Entity
          {
            status: -1,
            msg": "error",
            result:{}
          }
     */
    del : function(req, res, next) {
        baseController.del.apply(UserModel,arguments)
    },


    /**
      @api {POST} /user/edit 编辑用户
      @apiVersion 1.0.0
      @apiName edit

      @apiGroup user

      @apiParam {String} username  用户
      @apiParam {String} password  密码
      @apiParam {String} rePassword 确认密码
      @apiParam {String} roleId   角色id
      @apiParam {String} email   邮箱
      @apiParam {String} id    用户id

      @apiParamExample {json} Request-Example:
        {
            username:'username',
            password:'password',
            rePassword:'rePassword',
            roleId:'roleId',
            email:'email',
            id:'id'
        }
      @apiExample Example usage:
        curl -H "Content-Type: application/json" -X POST http://localhost:3000/user/edit

      @apiSuccessExample {json} Success-Response:
        HTTP/1.1 200 OK
        {
            code : 0,
            msg: "msg",
            result:{
            }
        }

      @apiErrorExample {json} Error-Response:
        HTTP/1.1 422 Unprocessable Entity
          {
            status: -1,
            msg": "error",
            result:{}
          }
     */
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

    /**
      @api {POST} /user/modify 个人资料修改
      @apiVersion 1.0.0
      @apiName modify
      @apiGroup user

      @apiParam {String} username  用户
      @apiParam {String} password  密码
      @apiParam {opassword} opassword 原密码
      @apiParam {rePassword} rePassword   确认密码
      @apiParam {String} id    用户id

      @apiParamExample {json} Request-Example:
        {
            username:'username',
            password:'password',
            rePassword:'rePassword',
            roleId:'roleId',
            email:'email',
            id:'id'
        }
      @apiExample Example usage:
        curl -H "Content-Type: application/json" -X POST http://localhost:3000/user/modify
        {
            username:'username',
            password:'password',
            opassword:'opassword',
            rePassword:'rePassword',
            id:'id'
        }

      @apiSuccessExample {json} Success-Response:
        HTTP/1.1 200 OK
        {
            code : 0,
            msg: "msg",
            result:{
            }
        }

      @apiErrorExample {json} Error-Response:
        HTTP/1.1 422 Unprocessable Entity
          {
            status: -1,
            msg": "error",
            result:{}
          }
     */
    modify : function(req, res, next){

        let username = tools.getParam(req,'username');
        let password = tools.getParam(req,'opassword');
        let newPassword = tools.getParam(req,'password');
        let rePassword = tools.getParam(req,'rePassword');
        let id = tools.getParam(req,"id");

        if (tools.notEmpty([username, password,  newPassword, rePassword, id])) {
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

