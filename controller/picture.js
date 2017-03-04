

'use strict';

const fs = require('fs-extra')
const multiparty = require('multiparty')
const OSS = require('ali-oss')
const co = require('co');
const uuidV4 = require('uuid/v4')
const pictureModel = require('../models/picture')
const tools = require('../common/tools')
const _ = require('lodash')
const Promise=require('bluebird')
const util = require('util')
const moment = require('moment')
const config=require('../config')
const baseController = require('./base_controller')
const client = new OSS(config.ossConfig)

const picture = {
    create : function(req, res, next){
        var form = new multiparty.Form();
        form.encoding = 'utf-8';
        // form.uploadDir = "./image/create";
        form.maxFilesSize = 10 * 1024 * 1024;
        form.parse(req, function(err, fields, files) {
            // let filesTmp = JSON.stringify(files,null,2);
            if(err){
                console.log('parse error: ' + err);
                return tools.sendResult(res,-1);
            } else {
                let categoryId = fields['categoryId'][0];
                if (tools.notEmpty([categoryId])) {
                    return tools.sendResult(res,-1);
                }
                const curTime = moment();
                let uploadedPath = files.file[0].path;
                let url =  util.format('%s/%s/%s/%s/%s','qgz',curTime.get('year'),curTime.get('month')+1,curTime.get('date'),uuidV4().split('-')[0]+'.'+uploadedPath.split('.').pop());
                co(function* () {
                    let result = yield client.put(url, uploadedPath);
                    pictureModel.create({
                        category:categoryId,
                        url:url
                    }).then(record =>{
                        let data = {
                            url: config.imgDomain+record.url
                        }
                        tools.sendResult(res,0,data);
                    }).catch(err => {
                        console.log(err)
                        return tools.sendResult(res,600);
                    })
                }).catch(function (err) {
                    console.log(err);
                    return tools.sendResult(res,600);
                });
                // _.each(files.file,function(item){
                //     const curTime = moment();
                //     let inputFile = item;
                //     let uploadedPath = inputFile.path;
                //     let dirUrl =  util.format('%s/%s/%s/%s/%s','qgz',curTime.get('year'),curTime.get('year'),curTime.get('month')+1,curTime.get('date'),uuidV4().split('-')[0]+'.'+uploadedPath.split('.').pop());
                //     co(function* () {
                //         let result = yield client.put(dirUrl, uploadedPath);
                //         ++curentNum
                //         if(curentNum == totalNum ){
                //             pictureModel.create({
                //                 category:categoryId,
                //             }).then(record =>{
                //                 tools.sendResult(res,0);
                //             }).catch(err => {
                //                 return tools.sendResult(res,600);
                //             })
                //         }
                //     }).catch(function (err) {
                //         console.log(err);
                //         return tools.sendResult(res,600);
                //     });
                // })

            }
        })

    },
    upload : function(req, res, next){
        let posterData = req.files.uploadPoster
        let name = tools.getParam(req,'name');
        let categoryId = tools.getParam(req,'categoryId');
        let filePath = posterData.path
        let originalFilename = posterData.originalFilename

        if (originalFilename) {
            fs.readFile(filePath, function(err, data) {
                var timestamp = Date.now()
                var type = posterData.type.split('/')[1]
                var poster = timestamp + '.' + type
                var newPath = path.join(__dirname, '../upload/' + poster)

                fs.writeFile(newPath, data, function(err) {
                    if (err) {
                        return tools.sendResult(res,500)
                    }
                    // req.poster = poster
                    return tools.sendResult(res,0)
                })
            })
        }else{
            return tools.sendResult(res,-1);
        }
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



