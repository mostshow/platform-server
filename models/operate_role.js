
/**
 * 操作权限表
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const OperateRoleSchema = new Schema({
    operateName: { type: String },
    route:{type:String},
    roleId: [{ type: ObjectId, ref: 'Role' }],
    updateAt: {type:Date,default:Date.now},
    createAt: { type: Date, default: Date.now }

});

OperateRoleSchema.index({route : 1 }, { unique: true });
OperateRoleSchema.index({roleId : 1 }, { unique: true });
OperateRoleSchema.pre('save' , function(next){
    if (this.isNew) {
        this.createAt = Date.now();
    }else {
        this.updateAt = Date.now()
    }
    next();
})

OperateRoleSchema.statics = {
    getOperateNameById: function(id, cb) {
        return this.findOne({ '_id':id}).exec(cb);
    },
    getRoleIdByRoute:function(route,cb){
         return this.findOne({'route':route}).exec(cb);
    },
    fetch: function(query,cb) {
        var query = query || {};
        return this.find(query).sort('createAt').exec(cb);
    }
}

const OperateRoleModel = mongoose.model('OperateRole', OperateRoleSchema);

module.exports = OperateRoleModel;
