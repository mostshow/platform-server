
const Fse = require('fs-extra')
const fs = require('fs')
const path = require("path");
const config=require('../config');
const local = path.join.bind(path,config.projectDir);
const sshPublicKeyPath = local("id_rsa.pub");
const sshPrivateKeyPath = local("id_rsa");
const exec = require('child_process').exec;

module.exports  = {
    mkdir(dir,cb){
        Fse.mkdirs(dir,cb)
    },
    /**
     * 替换成exec模式 nodegit  centos install failure
     *
     */
    clone(params,callback){
        Fse.removeSync(local(params.dir))
        exec('cd  '+ local() +'&&git clone '+params.gitPath,(error, stdout, stderr) => {
            if (error) {
                callback(error)
                return ;
            }
            callback()
        })
        // Clone(params.gitPath, local(params.dir), opts).then(function(repo) {
        //     console.log("clone ok!!");
        //     callback()
        // }).catch(function(error) {
        //     callback(error)
        // });
    },
    create(params){
        // Open(local(params.dir)).then((repo)=>{
        //     repo.getReference('master').then((ref)=>{
        //         var signature = Signature.default(repo);
        //         repo.createBranch(params.branch, ref.target(), true, signature, 'create branch:'+params.branch).then((reference)=> {
        //             console.log('create ok!!')
        //         }).catch((error)=>  {
        //             return console.log(error);
        //         });
        //     }).catch((error)=>  {
        //         return console.log(error);
        //     });
        // }).catch((error)=>  {
        //     return console.log(error);
        // });
    },

    /**
     * 替换成exec模式 nodegit  centos install failure
     *
     */
    switch(params,callback){
        var tempRepo ;

        exec('cd '+local(params.dir) +'&&git fetch && git checkout '+params.branch +' &&git pull',(error, stdout, stderr) => {
            if (error) {
                callback(error)
                return ;
            }
            callback()
        })
        // Open(local(params.dir)).then((repo)=> {
        //     tempRepo = repo;
        //     return repo.checkoutBranch(params.branch)
        //     .catch((err)=>{
        //         callback(error);
        //     })
        // }).done(()=>{
        //     console.log('switch ok!!');
        //     tempRepo.fetchAll({
        //         callbacks: {
        //             credentials: function(url, userName) {
        //                 return Git.Cred.sshKeyNew( userName, sshPublicKeyPath, sshPrivateKeyPath,"");
        //             },
        //             certificateCheck: function() {
        //                 return 1;
        //             }
        //         }
        //     }).then(()=>{
        //         return tempRepo.mergeBranches(params.branch, "origin/"+params.branch);
        //     }).then(()=>{
        //         callback();
        //     }).catch((err)=>{
        //         callback(err);
        //     })
        // },(err)=>{
        //      callback(err)
        // })
    },

    /**
     * 替换成exec模式 nodegit  centos install failure
     *
     */
    fetch(params,callback){
        var self = this,repo;
        // this.mkdir(local(params.dir),function(){
        if(!fs.lstatSync(local(params.dir))){
            callback(new Error("dir not exist"));
        }

        exec('cd  '+ local(params.dir) +'&&git fetch && git checkout '+params.branch+' &&git pull',(error, stdout, stderr) => {
            if (error) {
                callback(error)
                return ;
            }
            callback()
        })
            // Open(local(params.dir)).then(function(repository) {
            //     repo = repository;
            //     return repo.fetch("origin", {
            //         callbacks: {
            //             credentials: function(url, userName) {
            //                 return Git.Cred.sshKeyNew( userName, sshPublicKeyPath, sshPrivateKeyPath,"");
            //             }
            //         }
            //     }).catch((err)=>{
            //         callback(err);
            //     })
            // })
            // .done(()=>{
            //     console.log("Done!");
            //     var signature = Signature.default(repo);
            //     repo.getBranch('refs/remotes/origin/' + params.branch).then((ref) => {
            //         repo.createBranch(params.branch, ref.target(), true, signature, 'create branch:'+params.branch).then((reference)=> {
            //             console.log('checkout ok!!')
            //             repo.checkoutBranch(params.branch).then(() => {
            //                 console.log('switch ok!!')
            //                 callback();
            //             }).catch(err=>{
            //                 callback(err);
            //             })
            //         }).catch((error)=>  {
            //             callback(err);
            //         });
            //     }).catch((error)=>  {
            //         callback(err);
            //     });
            // },(err)=>{
            //     callback(err);
            // })

        // })
    },
    pull(params){
        // Open(local(params.dir)).then((repo)=> {
        //     tempRepo = repo;
        //     return         })
        // .then(()=> {
        //     return tempRepo.mergeBranches(params.branch, "origin/"+params.branch);
        // })
        // .done(()=> {
        //     console.log("Done!");
        // })
    }
}
