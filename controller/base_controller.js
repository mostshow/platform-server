

'use strict';
const tools = require('../common/tools');
module.exports = {
    del : function(req, res, next) {
        let id = tools.getParam(req,'id');
        if (id) {
            this.remove({_id: id}).then((redata) => {
                tools.sendResult(res,0);
            }).catch(err =>{
                return tools.sendResult(res,-5);
            })
        }else{
            return tools.sendResult(res,600);
        }
    }
}
