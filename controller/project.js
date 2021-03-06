
'use strict';
const ProjectModel = require('../models/project');
const PublishModel= require('../models/publish');
const tools = require('../common/tools');
const Client= require('../common/conn_client');
const ProjectOp = require('../common/project_operate');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
const Promise=require('bluebird');
const config=require('../config');
const uuidV4 = require('uuid/v4');
const path = require('path');
const baseController = require('./base_controller')
const exec = require('child_process').exec;
const local = path.join.bind(path,config.projectDir);
const refTime = 10*60*1000// 测试10分钟；3*24*60*60*1000
const execSync = require('child_process').execSync;

const project = {
    create : function(req, res, next){
        let name = tools.getParam(req,'name');
        let branch = tools.getParam(req,'branch');
        let gitPath = tools.getParam(req,'gitPath');
        let description = tools.getParam(req,'description');
        let category = tools.getParam(req,'category');
        let accessDir = tools.getParam(req,'accessDir') || uuidV4().split('-')[0];
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
            description : description,
            category : category,
            accessDir:accessDir,
            commit : commit,
            backupInfo:{}
        }
        ProjectModel.find({gitPath:params.gitPath}).then((reData)=>{
            if(!_.isEmpty(reData)){
                console.log('fetch')

                ProjectOp.fetch(params,function(err){
                    if(err){
                        console.log(err)
                        return tools.sendResult(res,500);
                    }
                    save(params,req,res)
                })
            }else{
                console.log('clone')
                ProjectOp.clone(params,function(err){
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
                description:params.description,
                category:params.category,
                accessDir:params.accessDir,
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
        let name = tools.getParam(req,'name');
        let accessDir = tools.getParam(req,'accessDir');
        let gitPath = tools.getParam(req,'gitPath');
        let home = tools.getParam(req,'home');
        let domain = tools.getParam(req,'domain');
        let branch = tools.getParam(req,'branch');
        let category = tools.getParam(req,'category');
        let status = tools.getParam(req,'status');
        let description = tools.getParam(req,'description');
        let id = tools.getParam(req,'id');
        let _record = {
            name:name,
            accessDir:accessDir,
            gitPath:gitPath,
            category:category,
            description:description,
            branch:branch,
            updateBy :req.session.user._id,
            _id:id
        }

        if (tools.notEmpty([name, id ,accessDir])) {
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
    get : function(req, res, next){
        let id = tools.getParam(req,'id');
        if (tools.notEmpty([id])) {
            return tools.sendResult(res,-1);
        }

        ProjectModel.findOne({_id: id})
        .populate('publish','publishName')
        .populate('category','name')
        .populate('updateBy','username')
        .then( reData => {
            if(_.isEmpty(reData)){
                return tools.sendResult(res,1000);
            }
            return tools.sendResult(res,0,reData)
        }).catch(err => {
            //return next(err);
            return tools.sendResult(res,600);
        });
    },
    list : function(req, res,next){

        let dataFrom = tools.getParam(req,'dataFrom')||config.defaultDataFrom;
        let dataCount = tools.getParam(req,'dataCount')||config.defaultDataCount;
        let category = tools.getParam(req,'category')
        let options = {skip: Number(dataFrom), limit: Number(dataCount), sort: {createAt: -1}};
        let params = {}
        if(category != 0){
            Object.assign(params,{category})
        }
        Promise.props({
            reData:ProjectModel.find(params,'',options)
            .populate('category','name')
            .populate('createBy','username')
            .populate('updateBy','username'),
            totalRecord:ProjectModel.count(params)
        }).then(reData => {
            if(_.isEmpty(reData)){
                tools.sendResult(res,1000);
                return  null;
            }

            tools.sendResult(res,0,reData);
            return  null;
        }).catch(err =>{
            next(err)
            return tools.sendResult(res,600);
        })
    },
    local_online : function(req,res){
        let  onlineLog = ''
        let  project_id = tools.getParam(req,'project_id')//project
        let  publish_id = tools.getParam(req,'publish_id');//publish
        if (tools.notEmpty([project_id,publish_id])) {
            return tools.sendResult(res,-1);
        }
        ProjectModel.getById(project_id).then( projectReData => {
            if(_.isEmpty(projectReData)){
                return tools.sendResult(res,1000);
            }

            PublishModel.getById(publish_id).then((reData)=>{
                if(_.isEmpty(reData)){
                    return tools.sendResult(res,1000);
                }
                console.log('switch')

                ProjectOp.switch({dir:projectReData.dir,branch:projectReData.branch},function(err){
                    if(err){
                        console.log(err)
                        return tools.sendResult(res,500);
                    }
                    let release =projectReData.accessDir;
                    let domain = reData.generate?release:''
                    try {
                        var source = fs.readFileSync(local(projectReData.dir)+'/modules/common/api/api.js', {encoding: 'utf8'});
                        fs.writeFileSync(local(projectReData.dir)+'/modules/common/api/api.js', source.replace("require('mock_api/mock_api')",false));
                    } catch (e) {
                        return tools.sendResult(res,1015)
                    }

                    try {
                        let data = fs.readFileSync(local(projectReData.dir)+'/fis-conf.js', {encoding: 'utf8'})
                        fs.writeFileSync(local(projectReData.dir)+'/fis-conf.js',
                            data.replace(/\$domain\$/g,domain).replace(/\$r_path_dir\$/g,local(release))
                        )
                    } catch (e) {
                        return tools.sendResult(res,1016)
                    }

                    exec('cd '+local(projectReData.dir)+'&&rm -rf ../'+release+'&& fis3 release prod &&git checkout . ', (error, stdout, stderr) => {
                        if (error) {
                            console.error(`exec error: ${error}`);
                            return tools.sendResult(res,500);
                        }
                        onlineLog += stdout;
                        // try {
                        //     fs.writeFileSync(local(release)+'/fis-conf.js', getFisConf(),false);
                        //     execSync('cd '+local(release) +'&& fis3 release uglify && rm fis-conf.js')
                        // } catch (e) {
                        //     return tools.sendResult(res,1017)
                        // }
                        exec('cd '+local()+' && drf '+ release +' --pack',(error, stdout, stderr) => {
                            if (error) {
                                console.error(`exec error: ${error}`);
                                return tools.sendResult(res,500);
                            }
                            console.log(`stdout: ${stdout}`);
                            onlineLog += stdout;
                            exec('cp -rf '+ local(release+'-pack.zip') +' '+ path.resolve(reData.dir,release+'-pack.zip'),(err, data, stderr) => {

                                if(err){
                                    console.log(err)
                                    return tools.sendResult(res,500)
                                }
                                let deleteBakStr = ''
                                let deleteDiff = ''
                                let nowTime = new Date().getTime();
                                let deleteFlag = false;
                                onlineLog += data;
                                let version = getVersion();
                                let backData = projectReData.backupInfo || {}

                                let backup = (backData[publish_id]&&projectReData.backupInfo[publish_id].backup)||[];
                                let deleteBak = (backData[publish_id]&&projectReData.backupInfo[publish_id].deleteBak)||[nowTime];

                                let lastTime = deleteBak.pop();

                                let relativeTime = nowTime-lastTime

                                if(relativeTime > refTime){
                                    deleteDiff = '&&drf '+release+' --del-diff'
                                    if(!_.isEmpty(deleteBak)){
                                        deleteBak =  deleteBak.map(function(item){
                                            return 'backup/'+item+'.zip'
                                        })
                                        deleteBakStr = '&&rm -rf ' + deleteBak.join(' ')
                                        deleteFlag = true;
                                    }
                                }
                                exec('cd '+reData.dir+deleteDiff+deleteBakStr+' && drf '+release+' ' +release+'-pack.zip  --bak-name='+version, (err,data) => {

                                    if(err) return tools.sendResult(res,501);
                                    onlineLog += data;
                                    console.log('http://'+reData.domain+(reData.generate?'/'+release+'/':'/')+'index.html')

                                    projectReData.publish = remove(projectReData.publish,publish_id)
                                    projectReData.publish.push(publish_id)

                                    backup.unshift(release+'-bak-'+version);
                                    let deleteBakNew = backup.splice(10);
                                    deleteBakNew.push(nowTime)
                                    console.log(deleteBakNew)

                                    let backupInfo = {
                                        backup:backup,
                                        deleteBak:deleteFlag?deleteBakNew:deleteBak.concat(deleteBakNew),
                                        revertVersion:''
                                    }

                                    backData[publish_id] = backupInfo;
                                    let modify = _.extend(projectReData,{backupInfo:backData});
                                    modify.markModified('backupInfo')
                                    modify.save((err, projectReData) => {
                                        if (err) {
                                            return tools.sendResult(res,500)
                                        }
                                        let obj = {
                                            username:req.session.user.username,
                                            action:'上线',
                                            project:modify.name,
                                            server:reData.publishName,
                                            address:'http://'+reData.domain+(reData.generate?'/'+release+'/':'/')+'index.html',
                                            // onlineLog:onlineLog
                                        }
                                        try{
                                            tools.sendProjectMail(obj)
                                            tools.logger(obj)
                                        }catch(e){
                                            console.log(e)
                                        }

                                        return tools.sendResult(res,0,projectReData)

                                    })
                                })
                            })
                        })
                    });
                })
            }).catch(err => {
                console.log(err);
                return tools.sendResult(res,600);
            });
            // tools.sendResult(res,0)
        }).catch(err => {
            //return next(err);
            return tools.sendResult(res,600);
        });

    },
    local_offline : function(req,res){

        let  project_id = tools.getParam(req,'project_id')//project
        let  publish_id = tools.getParam(req,'publish_id');//publish
        if (tools.notEmpty([project_id,publish_id])) {
            return tools.sendResult(res,-1);
        }
        ProjectModel.getById(project_id).then( projectReData => {
            if(_.isEmpty(projectReData)){
                return tools.sendResult(res,1000);
            }
            //test
            // projectReData.publish = remove(projectReData.publish,publish_id)
            // console.log(projectReData.publish.indexOf(publish_id))
            // let modify = _.extend(projectReData, {});
            // modify.save((err, projectReData) => {
            //     if (err) {
            //         return tools.sendResult(res,500)
            //     }
            //     tools.sendResult(res,0)
            // })
            // return;
            //test
            let release =projectReData.accessDir;

            PublishModel.getById(publish_id).then((reData)=>{
                if(_.isEmpty(reData)){
                    return tools.sendResult(res,1000);
                }

                exec('cd '+reData.dir+' && rm -rf '+release, (err,data) => {
                    if(err) return tools.sendResult(res,501);
                    // console.log(data)
                    console.log('http://'+reData.domain+(reData.generate?'/'+release+'/':'/')+'index.html')
                    projectReData.publish = remove(projectReData.publish,publish_id)
                    // let backData = projectReData.backupInfo || {}
                    // let backup = (backData[publish_id]&&projectReData.backupInfo[publish_id].backup)||[];
                    // let deleteBak = backup.splice(5);
                    // let backupInfo = {
                    //     backup:backup,
                    //     deleteBak:deleteBak,
                    //     revertVersion:''
                    // }
                    // backData[publish_id] = backupInfo;
                    let modify = _.extend(projectReData, {});
                    // modify.markModified('backupInfo')

                    modify.save((err, projectReData) => {
                        if (err) {
                            return tools.sendResult(res,500)
                        }

                        let obj = {
                            username:req.session.user.username,
                            action:'下线',
                            project:modify.name,
                            server:reData.publishName,
                            address:'http://'+reData.domain+(reData.generate?'/'+release+'/':'/')+'index.html'
                        }
                        try{
                            tools.sendProjectMail(obj)
                            tools.logger(obj)
                        }catch(e){
                            console.log(e)
                        }
                        return tools.sendResult(res,0,projectReData)
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
    },

    local_revert:function(req,res){
        let  revertVersion = tools.getParam(req,'revertVersion')
        let  project_id = tools.getParam(req,'project_id')//project
        let  publish_id = tools.getParam(req,'publish_id');//publish
        if (tools.notEmpty([revertVersion, project_id, publish_id])) {
            return tools.sendResult(res,-1);
        }
        ProjectModel.getById(project_id).then( projectReData => {
            if(_.isEmpty(projectReData)){
                return tools.sendResult(res,1000);
            }
            let release =projectReData.accessDir;
            PublishModel.getById(publish_id).then((reData)=>{
                if(_.isEmpty(reData)){
                    return tools.sendResult(res,1000);
                }

                let revertVersionZip = revertVersion + '.zip'

                exec( 'cd '+reData.dir+' && cp ./backup/'+revertVersionZip+' '+revertVersionZip+'&&drf '+release+' ' +revertVersionZip+'  --unpack', (err,data) => {
                    if(err) return tools.sendResult(res,501);

                    console.log(data)
                    console.log('http://'+reData.domain+(reData.generate?'/'+release+'/':'/')+'index.html')

                    projectReData.publish = remove(projectReData.publish,publish_id)
                    projectReData.publish.push(publish_id)
                    projectReData.backupInfo[publish_id].revertVersion = revertVersion;

                    let modify = _.extend(projectReData, {});
                    modify.markModified('backupInfo')
                    modify.save((err, projectReData) => {
                        if (err) {
                            return tools.sendResult(res,500)
                        }
                        let obj = {
                            username:req.session.user.username,
                            action:'回滚',
                            project:modify.name,
                            version:revertVersion,
                            server:reData.publishName,
                            address:'http://'+reData.domain+(reData.generate?'/'+release+'/':'/')+'index.html'
                        }
                        try{
                            tools.sendProjectMail(obj)
                            tools.logger(obj)
                        }catch(e){
                            console.log(e)
                        }
                        return tools.sendResult(res,0,projectReData)

                    })
                })
            }).catch(err => {
                console.log(err);
                return tools.sendResult(res,600);
            });
        }).catch(err => {
            //return next(err);
            return tools.sendResult(res,600);
        });


    },

    online : function(req,res){
        // let _record = {
        //     _id : tools.getParam(req,'id'),
        //     status : tools.getParam(req,'status'),
        // }

        let  onlineLog = ''
        let  project_id = tools.getParam(req,'project_id')//project
        let  publish_id = tools.getParam(req,'publish_id');//publish

        if(isLocker()){
            return tools.sendResult(res, 1019)
        }else{
            locker()
        }

        if (tools.notEmpty([project_id,publish_id])) {
            return tools.sendResultA(res,-1);
        }
        ProjectModel.getById(project_id).then( projectReData => {
            if(_.isEmpty(projectReData)){
                return tools.sendResultA(res,1000);
            }

            //test
            // projectReData.publish = remove(projectReData.publish,publish_id)
            // projectReData.publish.push(publish_id)
            // let modify = _.extend(projectReData, {});
            // modify.save((err, projectReData) => {
            //     if (err) {
            //         return tools.sendResultA(res,500)
            //     }
            //     tools.sendResultA(res,0)
            // })
            // return;

            //test


            PublishModel.getById(publish_id).then((reData)=>{
                if(_.isEmpty(reData)){
                    return tools.sendResultA(res,1000);
                }
                console.log('switch')

                ProjectOp.switch({dir:projectReData.dir,branch:projectReData.branch},function(err){
                    if(err){
                        console.log(err)
                        return tools.sendResultA(res,500);
                    }
                    let release =projectReData.accessDir;
                    let domain = reData.generate?release:''
                    // try {
                    //     var source = fs.readFileSync(local(projectReData.dir)+'/modules/common/api/api.js', {encoding: 'utf8'});
                    //     fs.writeFileSync(local(projectReData.dir)+'/modules/common/api/api.js', source.replace("require('mock_api/mock_api')",false));
                    // } catch (e) {

                    //     return tools.sendResultA(res,1015)
                    // }

                    try {
                        let data = fs.readFileSync(local(projectReData.dir)+'/fis-conf.js', {encoding: 'utf8'})

                        fs.writeFileSync(local(projectReData.dir)+'/fis-conf.js',
                            data.replace(/\$domain\$/g,domain).replace(/\$r_path_dir\$/g,local(release))
                        )

                    } catch (e) {
                        return tools.sendResultA(res,1016)
                    }

                    exec('cd '+local(projectReData.dir)+'&&rm -rf ../'+release+'&& fis3 release test && git checkout . ', (error, stdout, stderr) => {
                        if (error) {
                            console.error(`exec error: ${error}`);
                            return tools.sendResultA(res,500);
                        }
                        onlineLog += stdout;
                        try {
                            fs.writeFileSync(local(release)+'/fis-conf.js', getFisConf(),false);
                            execSync('cd '+local(release) +'&& fis3 release uglify && rm fis-conf.js')
                        } catch (e) {
                            return tools.sendResultA(res,1017)
                        }
                        exec('cd '+local()+' && drf '+ release +' --pack',(error, stdout, stderr) => {
                            if (error) {
                                console.error(`exec error: ${error}`);
                                return tools.sendResultA(res,500);
                            }
                            console.log(`stdout: ${stdout}`);
                            onlineLog += stdout;
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
                                    return tools.sendResultA(res,500)
                                }
                                let deleteBakStr = ''
                                let deleteDiff = ''
                                let nowTime = new Date().getTime();
                                let deleteFlag = false;
                                onlineLog += data;
                                let version = getVersion();
                                let backData = projectReData.backupInfo || {}

                                let backup = (backData[publish_id]&&projectReData.backupInfo[publish_id].backup)||[];
                                let deleteBak = (backData[publish_id]&&projectReData.backupInfo[publish_id].deleteBak)||[nowTime];

                                let lastTime = deleteBak.pop();

                                let relativeTime = nowTime-lastTime

                                if(relativeTime > refTime){
                                    deleteDiff = '&&drf '+release+' --del-diff'
                                    if(!_.isEmpty(deleteBak)){
                                        deleteBak =  deleteBak.map(function(item){
                                            return 'backup/'+item+'.zip'
                                        })
                                        deleteBakStr = '&&rm -rf ' + deleteBak.join(' ')
                                        deleteFlag = true;
                                    }
                                }
                                Client.Shell({
                                    connConfig:connConfig,
                                    cmd:'cd '+reData.dir+deleteDiff+deleteBakStr+' && drf '+release+' ' +release+'-pack.zip  --bak-name='+version+  "\r\nexit\r\n"
                                },function(err,data){
                                    if(err) return tools.sendResultA(res,501);
                                    onlineLog += data;
                                    console.log('http://'+reData.domain+(reData.generate?'/'+release+'/':'/')+'index.html')

                                    projectReData.publish = remove(projectReData.publish,publish_id)
                                    projectReData.publish.push(publish_id)

                                    backup.unshift(release+'-bak-'+version);
                                    let deleteBakNew = backup.splice(10);
                                    deleteBakNew.push(nowTime)
                                    console.log(deleteBakNew)

                                    let backupInfo = {
                                        backup:backup,
                                        deleteBak:deleteFlag?deleteBakNew:deleteBak.concat(deleteBakNew),
                                        revertVersion:''
                                    }

                                    backData[publish_id] = backupInfo;
                                    let modify = _.extend(projectReData,{backupInfo:backData});
                                    modify.markModified('backupInfo')
                                    modify.save((err, projectReData) => {
                                        if (err) {
                                            return tools.sendResultA(res,500)
                                        }
                                        let obj = {
                                            username:req.session.user.username,
                                            action:'上线',
                                            project:modify.name,
                                            server:reData.publishName,
                                            address:'http://'+reData.domain+(reData.generate?'/'+release+'/':'/')+'index.html',
                                            // onlineLog:onlineLog
                                        }
                                        try{
                                            tools.sendProjectMail(obj)
                                            tools.logger(obj)
                                        }catch(e){
                                            console.log(e)
                                        }

                                        return tools.sendResultA(res,0,projectReData)

                                    })
                                })
                            })
                        })
                    });
                })
            }).catch(err => {
                console.log(err);
                return tools.sendResultA(res,600);
            });
            // tools.sendResultA(res,0)
        }).catch(err => {
            //return next(err);
            return tools.sendResultA(res,600);
        });

    },
    offline : function(req,res){

        let  project_id = tools.getParam(req,'project_id')//project
        let  publish_id = tools.getParam(req,'publish_id');//publish
        if (tools.notEmpty([project_id,publish_id])) {
            return tools.sendResult(res,-1);
        }
        ProjectModel.getById(project_id).then( projectReData => {
            if(_.isEmpty(projectReData)){
                return tools.sendResult(res,1000);
            }
            //test
            // projectReData.publish = remove(projectReData.publish,publish_id)
            // console.log(projectReData.publish.indexOf(publish_id))
            // let modify = _.extend(projectReData, {});
            // modify.save((err, projectReData) => {
            //     if (err) {
            //         return tools.sendResult(res,500)
            //     }
            //     tools.sendResult(res,0)
            // })
            // return;
            //test
            let release =projectReData.accessDir;

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
                    // console.log(data)
                    console.log('http://'+reData.domain+(reData.generate?'/'+release+'/':'/')+'index.html')
                    projectReData.publish = remove(projectReData.publish,publish_id)
                    // let backData = projectReData.backupInfo || {}
                    // let backup = (backData[publish_id]&&projectReData.backupInfo[publish_id].backup)||[];
                    // let deleteBak = backup.splice(5);
                    // let backupInfo = {
                    //     backup:backup,
                    //     deleteBak:deleteBak,
                    //     revertVersion:''
                    // }
                    // backData[publish_id] = backupInfo;
                    let modify = _.extend(projectReData, {});
                    // modify.markModified('backupInfo')

                    modify.save((err, projectReData) => {
                        if (err) {
                            return tools.sendResult(res,500)
                        }

                        let obj = {
                            username:req.session.user.username,
                            action:'下线',
                            project:modify.name,
                            server:reData.publishName,
                            address:'http://'+reData.domain+(reData.generate?'/'+release+'/':'/')+'index.html'
                        }
                        try{
                            tools.sendProjectMail(obj)
                            tools.logger(obj)
                        }catch(e){
                            console.log(e)
                        }
                        return tools.sendResult(res,0,projectReData)
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
    },
    revert:function(req,res){
        let  revertVersion = tools.getParam(req,'revertVersion')
        let  project_id = tools.getParam(req,'project_id')//project
        let  publish_id = tools.getParam(req,'publish_id');//publish
        if (tools.notEmpty([revertVersion, project_id, publish_id])) {
            return tools.sendResult(res,-1);
        }
        ProjectModel.getById(project_id).then( projectReData => {
            if(_.isEmpty(projectReData)){
                return tools.sendResult(res,1000);
            }
            let release =projectReData.accessDir;
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
                let revertVersionZip = revertVersion + '.zip'
                Client.Shell({
                    connConfig:connConfig,
                    cmd:'cd '+reData.dir+' && cp ./backup/'+revertVersionZip+' '+revertVersionZip+'&&drf '+release+' ' +revertVersionZip+'  --unpack  \r\nexit\r\n'
                },function(err,data){
                    if(err) return tools.sendResult(res,501);

                    console.log(data)
                    console.log('http://'+reData.domain+(reData.generate?'/'+release+'/':'/')+'index.html')

                    projectReData.publish = remove(projectReData.publish,publish_id)
                    projectReData.publish.push(publish_id)
                    projectReData.backupInfo[publish_id].revertVersion = revertVersion;

                    let modify = _.extend(projectReData, {});
                    modify.markModified('backupInfo')
                    modify.save((err, projectReData) => {
                        if (err) {
                            return tools.sendResult(res,500)
                        }
                        let obj = {
                            username:req.session.user.username,
                            action:'回滚',
                            project:modify.name,
                            version:revertVersion,
                            server:reData.publishName,
                            address:'http://'+reData.domain+(reData.generate?'/'+release+'/':'/')+'index.html'
                        }
                        try{
                            tools.sendProjectMail(obj)
                            tools.logger(obj)
                        }catch(e){
                            console.log(e)
                        }
                        return tools.sendResult(res,0,projectReData)

                    })
                })
            }).catch(err => {
                console.log(err);
                return tools.sendResult(res,600);
            });
        }).catch(err => {
            //return next(err);
            return tools.sendResult(res,600);
        });


    }
}
function getFisConf(){
    return "fis.media('uglify')\
        .match('*.js', {\
            optimizer: fis.plugin('uglify-js', {\
                sourceMap:true\
            })\
        })\
        .match('*', {\
            deploy: fis.plugin('local-deliver', {\
                to: './'\
        })\
    });"
}
function getVersion(){
    const curTime = moment();
    const timeArr = [];
    timeArr.push(curTime.get('year'));
    timeArr.push(curTime.get('month')+1);
    timeArr.push(curTime.get('date'));
    timeArr.push(curTime.get('hour'));
    timeArr.push(curTime.get('minute'));
    timeArr.push(curTime.get('second'));
    return timeArr.join('-');
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
function isLocker(){
    return global.currOnline;
}
function locker(){
    global.currOnline = true;
}
tools.sendResultA = function(){
    global.currOnline = false;
    let arg = Array.prototype.slice.call(arguments);
    tools.sendResult.apply(null, arg)
}
module.exports = project;

