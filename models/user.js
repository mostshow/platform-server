/**
 * 用户表
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const Promise=require('bluebird');
const bcrypt = require('bcryptjs');
const config = require('../config');
const UserSchema = new Schema({
    username: { type: String },
    password: { type: String },
    email: { type: String },
    roleId: { type: ObjectId, ref: 'Role' },
    updateAt: {type:Date,default:Date.now},
    createAt: { type: Date, default: Date.now }

});

UserSchema.index({ username: 1 }, { unique: true });

UserSchema.pre('save', function(next) {
    const user = this
    if (this.isNew) {
        this.createAt = Date.now();
    }else {
        this.updateAt = Date.now()
    }
    bcrypt.genSalt(config.SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err)
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err)
                    user.password = hash
                next()
            })
    })
});
UserSchema.methods = {
  comparePassword: function(_password, cb) {
    bcrypt.compare(_password, this.password, function(err, isMatch) {
      if (err) return cb(err)

      cb(null, isMatch)
    })
  }
}
UserSchema.statics = {
    fetch: function(query,cb) {
        return this.find({}).sort('createAt').exec(cb);
        // const param = query.param || {}
        // const field = query.field || ''
        // const options = query.options || {}
        // return this.find(param,field,options).sort('createAt').exec(cb)
    },
    getUserByUserName: function(username, cb) {
        return this.findOne({ 'username': username }).populate('roleId','rolename').exec(cb);
    },
    getUserById: function(id, cb){
        return this.findOne({ _id: id }).exec(cb);
    },
    getCountByQuery: function(query, cb) {
        return this.count(query).exec(cb);
    },
    getUsersByQuery: function(query, opt, cb){
        return this.find(query, '', opt).sort('updateAt').exec(cb);
    }
};

const UserModel = mongoose.model('User', UserSchema);

Promise.promisifyAll(UserModel);
Promise.promisifyAll(UserModel.prototype);

module.exports=UserModel;

