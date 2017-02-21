
/**
 * 项目状态表
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const projectStatusSchema = new Schema({
    name: { type: String },
    className: { type: String },
    updateAt: {type:Date,default:Date.now},
    createAt: { type: Date, default: Date.now }

});

projectStatusSchema.index({name : 1 }, { unique: true });
projectStatusSchema.pre('save' , function(next){
    if (this.isNew) {
        this.createAt = Date.now();
    }else {
        this.updateAt = Date.now()
    }
    next();
})

projectStatusSchema.statics = {
    getById: function(id, cb) {
        return this.findOne({ '_id':id}).exec(cb);
    },
    fetch: function(query,cb) {
        var query = query || {};
        return this.find(query).sort('createAt').exec(cb);
    }
}

const projectStatusModel= mongoose.model('projectStatus', projectStatusSchema);

module.exports = projectStatusModel;


