

'use strict';

const fs = require('fs')
const pictureModel = require('../models/picture');
const tools = require('../common/tools');
const _ = require('lodash');
const Promise=require('bluebird');
const config=require('../config');
const baseController = require('./base_controller')
const upload = require('jquery-file-upload-middleware')
const multiparty = require('multiparty');

upload.configure({
    uploadDir: __dirname + '/public/uploads',
    uploadUrl: '/api/image/create',
    imageVersions: {
        thumbnail: {
            width: 80,
            height: 80
        }
    }
});
const picture = {
    create : function(req, res, next){
        //生成multiparty对象，并配置上传目标路径
        var form = new multiparty.Form();
        // form.encoding = 'utf-8';
        // form.uploadDir = "./uploads/images/";
        // form.maxFilesSize = 2 * 1024 * 1024;
        form.parse(req, function(err, fields, files) {
            // console.log(fields)
            var filesTmp = JSON.stringify(files,null,2);

            if(err){
                console.log('parse error: ' + err);
            } else {
                console.log('parse files: ' + filesTmp);
                var inputFile = files.file[0];
                var uploadedPath = inputFile.path;
                var dstPath = './' + inputFile.originalFilename;
                // fs.renameSync(files.path,files.originalFilename);
                fs.rename(uploadedPath, dstPath, function(err) {
                    if(err){
                        console.log('rename error: ' + err);
                    } else {
                        console.log('rename ok');
                    }
                });
            }
        })

        return;
        //上传完成后处理
        // upload.fileHandler()(req, res, next)
        // req.filemanager = upload.fileManager();
        // upload.fileManager().getFiles(function (files) {
        //     console.log(files)
        //     res.json(files);
        // });
        // upload.fileHandler({
        //     uploadDir: function () {
        //         return __dirname + '../public/uploads/'
        //     },
        //     uploadUrl: function () {
        //         return '/create'
        //     }
        // })(req, res, next);
        // upload.on('end', function (fileInfo, req, res) {
        //     return tools.sendResult(res,0);
        // });
        return;
        let categoryId = tools.getParam(req,'categoryId');
        let thumbnail = tools.getParam(req,'thumbnail');
        let url = tools.getParam(req,'url');
        let name = tools.getParam(req,'name');
        let type = tools.getParam(req,'type');
        let size = tools.getParam(req,'size');
        let file = tools.getParam(req,'file')
        console.log('-------');
        console.log(req.IncomingMessage);

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



