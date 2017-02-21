
/**
 * 图片栏目表
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId
const picCategorySchema = new Schema({
    name: { type: String },
    pid: { type: String},
    updateAt: {type:Date,default:Date.now},
    createAt: { type: Date, default: Date.now }

});

picCategorySchema.index({name : 1 }, { unique: true });
picCategorySchema.pre('save' , function(next){
    if (this.isNew) {
        this.createAt = Date.now();
    }else {
        this.updateAt = Date.now()
    }
    next();
})

picCategorySchema.statics = {
    getById: function(id, cb) {
        return this.findOne({ '_id':id}).exec(cb);
    },
    fetch: function(query,cb) {
        var query = query || {};
        return this.find(query).sort('createAt').exec(cb);
    }
}

const picCategoryModel= mongoose.model('picCategory', picCategorySchema);

module.exports = picCategoryModel;


