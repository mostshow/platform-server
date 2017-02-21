
'use strict';
const ProjectModel = require('../models/project');
const PublishModel= require('../models/publish');
const tools = require('../common/tools');
const Client= require('../common/conn_client');
const ProjectOp = require('../common/project_operate');
const _ = require('lodash');
const Promise=require('bluebird');
const config=require('../config');
const uuidV4 = require('uuid/v4');
const path = require('path');
const baseController = require('./base_controller')
const exec = require('child_process').exec;
const local = path.join.bind(path,config.projectDir);

const project = {
    create : function(req, res, next){
        let name = tools.getParam(req,'name');
        let branch = tools.getParam(req,'branch');
        let gitPath = tools.getParam(req,'gitPath');
        let category = tools.getParam(req,'category');
        // let home = tools.getParam(req,'home');
        // let domain = tools.getParam(req,'domain');
        // let status = tools.getParam(req,'status');
        // let     dir = uuidV4()+'';
        // describe
        // let     name= '活动页面';
        // let     gitPath= 'git@10.16.15.113:web-dev/activity.git';
        // let     branch= 'test-project';
        // let     category='586f30605b502f92e8950968';
        let  commit = ' commit info'
        let  dir = gitPath.split('/').pop().split('.')[0];
        if (tools.notEmpty([name,branch, gitPath,category])) {
            return tools.sendResult(res,-1);
        }
        let params = {
            name : name,
            dir : dir,
            branch : branch,
            gitPath : gitPath,
            category : category,
            commit : commit
        }
        ProjectModel.find({gitPath:params.gitPath}).then((reData)=>{
            if(!_.isEmpty(reData)){
                console.log('fetch')

                ProjectOp.fetch({dir:params.dir,branch:params.branch},function(err){
                    if(err){
                        console.log(err)
                        return tools.sendResult(res,500);
                    }
                    save(params,req,res)
                })
            }else{
                console.log('clone')
                ProjectOp.clone({gitPath:params.gitPath,dir:params.dir},function(err){
                    if(err){
                        console.log(err)
                        return tools.sendResult(res,500);
                    }
                    save(params,req,res)
                })
            }
        })
        function save(params,req,res){
            ProjectModel.create({
                name:params.name,
                dir:params.dir,
                gitPath:params.gitPath,
                branch:params.branch,
                category:params.category,
                createBy:req.session.user._id,
                updateBy:req.session.user._id
            }).then(record =>{
                tools.sendResult(res,0);
            }).catch(err => {
                // return next(err);
                return tools.sendResult(res,600);
            })
        }
    },

    edit : function(req, res, next){
        // let operateName = tools.getParam(req,'key');
        let name = tools.getParam(req,'name');
        // let dir = tools.getParam(req,'dir');
        // let gitPath = tools.getParam(req,'gitPath');
        let home = tools.getParam(req,'home');
        let domain = tools.getParam(req,'domain');
        let category = tools.getParam(req,'category');
        let status = tools.getParam(req,'status');
        let id = tools.getParam(req,'id');
        if (tools.notEmpty([name, id ,dir])) {
            return tools.sendResult(res,-1);
        }
        let _record = {
            name:name,
            // dir:dir,
            // gitPath:gitPath,
            home:home,
            domain:domain,
            category:category,
            status:status,
            updateBy :req.session.user._id,
            _id:id
        }

        if (tools.notEmpty([name])) {
            return tools.sendResult(res,-1);
        }
        ProjectModel.getById(_record._id).then( reData => {
            if(_.isEmpty(reData)){
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
        baseController.del.apply(ProjectModel,arguments)
    },

    list : function(req, res,next){

        let dataFrom = tools.getParam(req,'dataFrom')||config.defaultDataFrom;
        let dataCount = tools.getParam(req,'dataCount')||config.defaultDataCount;
        let options = {skip: Number(dataFrom), limit: Number(dataCount), sort: {createAt: -1}};
        Promise.props({
            reData:ProjectModel.find({},'_id name dir  gitPath category branch createBy updateBy createAt updateAt',options)
            .populate('status','name className')
            .populate('category','name')
            .populate('createBy','username')
            .populate('updateBy','username'),
            totalRecord:ProjectModel.count({})
        }).then(reData => {
            if(_.isEmpty(reData)){
                return tools.sendResult(res,1000);
            }

            tools.sendResult(res,0,reData);
        }).catch(err =>{
            return next(err)
            return tools.sendResult(res,600);
        })
    },
    online : function(req,res){
        // let _record = {
        //     _id : tools.getParam(req,'id'),
        //     status : tools.getParam(req,'status'),
        // }
        let  project_id='588096dabc094110e0ab5852';//project
        let  publish_id='588172626b3aab2813d73840';//publish
        // if (tools.notEmpty([id,status,publishName])) {
        //     return tools.sendResult(res,-1);
        // }
        ProjectModel.getById(project_id).then( projectReData => {
            if(_.isEmpty(projectReData)){
                return tools.sendResult(res,1000);
            }
            console.log('switch')
            ProjectOp.switch({dir:projectReData.dir,branch:projectReData.branch},function(err){
                if(err){
                    return tools.sendResult(res,500);
                }
                let release =publish_id.slice(0,10)+project_id.slice(0,10);
                exec('cd '+local(projectReData.dir)+' &&rm -rf '+release+'&& fis3 release -d '+local(release), (error, stdout, stderr) => {
                    if (error) {
                        console.error(`exec error: ${error}`);
                        return tools.sendResult(res,500);
                    }
                    exec('cd '+local()+' && drf '+ release +' --pack',(error, stdout, stderr) => {
                        if (error) {
                            console.error(`exec error: ${error}`);
                            return tools.sendResult(res,500);
                        }
                        console.log(`stdout: ${stdout}`);

                        PublishModel.getById(publish_id).then((reData)=>{
                            if(_.isEmpty(reData)){
                                return tools.sendResult(res,1000);
                            }
                            let conn_ip = reData.ip;
                            // let sftp = _.keyBy(config.connConfig.sftp, 'host');
                            let sftp = _.keyBy(config.connConfig.ssh, 'host');
                            let connConfig = {
                                host: sftp[conn_ip]['host'],
                                port: 22,
                                username: sftp[conn_ip]['name'],
                                password: sftp[conn_ip]['pass'],
                            }
                            Client.UploadFile({
                                connConfig:connConfig,
                                localPath:local(release+'-pack.zip'),
                                remotePath:path.resolve(reData.dir,release+'-pack.zip'),
                                dirname:release
                            },function(err,data){
                                if(err){
                                    console.log(err)
                                }
                                console.log('cd '+reData.dir+' && drf '+release+' ' +release+'-pack.zip'+ "\r\nexit\r\n")
                                Client.Shell({
                                    connConfig:connConfig,
                                    cmd:'cd '+reData.dir+' && drf '+release+' ' +release+'-pack.zip'+ "\r\nexit\r\n"
                                },function(err,data){
                                    if(err) return tools.sendResult(res,501);
                                    console.log(data)
                                    console.log('http://'+reData.domain+(reData.generate?'/'+release+'/':'/')+'index.html')
                                    projectReData.publish = remove(projectReData.publish,publish_id)
                                    projectReData.publish.push(publish_id)
                                    let modify = _.extend(projectReData, {});
                                    modify.save((err, projectReData) => {
                                        if (err) {
                                            return tools.sendResult(res,500)
                                        }
                                        tools.sendResult(res,0)
                                    })
                                })
                            })

                        }).catch(err => {
                            console.log(err);
                            return tools.sendResult(res,600);
                        });



                        // tools.sendResult(res,0)

                    })
                });
            })
        }).catch(err => {
            //return next(err);
            return tools.sendResult(res,600);
        });

    },
    offline : function(req,res){
        // let _record = {
        //     _id : tools.getParam(req,'id'),
        //     status : tools.getParam(req,'status')
        // }
        // if (tools.notEmpty([id,status])) {
        //     return tools.sendResult(res,-1);
        // }
        let  project_id='588096dabc094110e0ab5852';//project
        let  publish_id='588172626b3aab2813d73840';//publish
        ProjectModel.getById(project_id).then( projectReData => {
            if(_.isEmpty(projectReData)){
                return tools.sendResult(res,1000);
            }
            let release =publish_id.slice(0,10)+project_id.slice(0,10);

            PublishModel.getById(publish_id).then((reData)=>{
                if(_.isEmpty(reData)){
                    return tools.sendResult(res,1000);
                }
                let conn_ip = reData.ip;
                // let sftp = _.keyBy(config.connConfig.sftp, 'host');
                let sftp = _.keyBy(config.connConfig.ssh, 'host');
                let connConfig = {
                    host: sftp[conn_ip]['host'],
                    port: 22,
                    username: sftp[conn_ip]['name'],
                    password: sftp[conn_ip]['pass'],
                }
                Client.Shell({
                    connConfig:connConfig,
                    cmd:'cd '+reData.dir+' && rm -rf '+release+ "\r\nexit\r\n"
                },function(err,data){
                    if(err) return tools.sendResult(res,501);
                    console.log(data)
                    console.log('http://'+reData.domain+(reData.generate?'/'+release+'/':'/')+'index.html')
                    console.log(projectReData.publish)
                    projectReData.publish = remove(projectReData.publish,publish_id)
                    console.log(projectReData.publish.indexOf(publish_id))
                    let modify = _.extend(projectReData, {});
                    modify.save((err, projectReData) => {
                        if (err) {
                            return tools.sendResult(res,500)
                        }
                        tools.sendResult(res,0)
                    })
                })
            }).catch(err => {
                console.log(err);
                return tools.sendResult(res,600);
            });
        }).catch(err => {
                console.log(err);
            //return next(err);
            return tools.sendResult(res,600);
        });
    }
}
function remove(arr,ele){
    let newArr = []
    arr.forEach((item,index) => {
        if(item != ele){
            newArr.push(item);
        }
    })
    return newArr;
}
module.exports = project;

