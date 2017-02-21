

/**
 * 角色表
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Promise=require('bluebird');
const RoleSchema = new Schema({
    rolename: { type: String },
    roleId: { type: Number },
    updateAt: {type:Date,default:Date.now},
    createAt: { type: Date, default: Date.now }

});

RoleSchema.index({rolename : 1 }, { unique: true });

RoleSchema.pre('save' , function(next){
    if (this.isNew) {
        this.createAt = Date.now();
    }else {
        this.updateAt = Date.now()
    }
    next();
})

RoleSchema.statics = {
    getRoleNameByRoleId: function(id, cb) {
        return this.findOne({ '_id': id}).exec(cb);
    },
    fetch: function(query,cb) {
        var query = query || {};
        return this.find(query).sort('createAt').exec(cb);
    }
}


const RoleModel = mongoose.model('Role', RoleSchema);

Promise.promisifyAll(RoleModel);
Promise.promisifyAll(RoleModel.prototype);

module.exports = RoleModel;
