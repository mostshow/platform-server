
'use strict';
const Client = require("ssh2").Client;

const tools = require('./tools');
const sshClient = {
    Connect(connConfig, then){
        var conn = new Client();
        conn.on("ready", function(){
            then(conn);
        }).on('error', function(err){
            console.log("connect error!");
        }).on('end', function() {
            console.log("connect end!");
        }).on('close', function(had_error){
            console.log("connect close");
        }).connect(connConfig);
    },
    Shell(params,  then){
        this.Connect(params.connConfig, function(conn){
            conn.shell(function(err, stream){
                if(err){
                    then(err);
                }else{
                    var buf = "";
                    stream.on('close', function(){
                        conn.end();
                        then(err, buf);
                    }).on('data', function(data){
                        // buf=buf+data;
                        console.log(data.toString())
                    }).stderr.on('data', function(data) {
                        console.log('stderr: ' + data);
                    });
                    stream.end(params.cmd);
                    // stream.end('echo $PATH\nexit\n');
                }
            });
        });
    },
    UploadFile(params , then){
        const ctx = this;
        ctx.Connect(params.connConfig, function(conn){
            conn.sftp(function(err, sftp){
                if(err){
                    then(err);
                }else{
                    sftp.fastPut(params.localPath, params.remotePath, function(err, result){
                        conn.end();
                        then(err, result);
                    });
                }
            });
        });
    }
}

module.exports = sshClient;
