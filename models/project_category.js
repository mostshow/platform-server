
/**
 * 项目栏目表
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId
const projectCategorySchema = new Schema({
    name: { type: String },
    updateAt: {type:Date,default:Date.now},
    createAt: { type: Date, default: Date.now },
    createBy: { type: ObjectId ,ref: 'User' },
    updateBy: { type: ObjectId ,ref: 'User' },
});

projectCategorySchema.index({name : 1 }, { unique: true });
projectCategorySchema.pre('save' , function(next){
    if (this.isNew) {
        this.createAt = Date.now();
    }else {
        this.updateAt = Date.now()
    }
    next();
})

projectCategorySchema.statics = {
    getById: function(id, cb) {
        return this.findOne({ '_id':id}).exec(cb);
    },
    fetch: function(query,cb) {
        var query = query || {};
        return this.find(query).sort('createAt').exec(cb);
    }
}

const projectCategoryModel= mongoose.model('projectCategory', projectCategorySchema);

module.exports = projectCategoryModel;


