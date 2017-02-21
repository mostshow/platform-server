
/**
 * 变量配置表
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const varConfigSchema = new Schema({
    key: { type: String },
    value:{type:String},
    remark: { type:String },
    updateAt: {type:Date,default:Date.now},
    createAt: { type: Date, default: Date.now }

});

varConfigSchema.index({key : 1 }, { unique: true });
varConfigSchema.pre('save' , function(next){
    if (this.isNew) {
        this.createAt = Date.now();
    }else {
        this.updateAt = Date.now()
    }
    next();
})

varConfigSchema.statics = {
    getById: function(id, cb) {
        return this.findOne({ '_id':id}).exec(cb);
    },
    fetch: function(query,cb) {
        return this.find({}).sort('createAt').exec(cb);
    },
}

const varConfigModel= mongoose.model('varConfig', varConfigSchema);

module.exports = varConfigModel;

