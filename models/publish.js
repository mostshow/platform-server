
/**
 * 项目环境
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId
const publishSchema = new Schema({
    publishName: { type: String },
    ip: { type: String },
    dir: { type: String },
    domain: { type: String },
    generate: { type: Number },
    createBy: { type: ObjectId ,ref: 'User' },
    updateBy: { type: ObjectId ,ref: 'User' },
    updateAt: {type:Date,default:Date.now},
    createAt: { type: Date, default: Date.now }

});

publishSchema.index({publishName : 1 }, { unique: true });
publishSchema.pre('save' , function(next){
    if (this.isNew) {
        this.createAt = Date.now();
    }else {
        this.updateAt = Date.now()
    }
    next();
})

publishSchema.statics = {
    getById: function(id, cb) {
        return this.findOne({ '_id':id}).exec(cb);
    },
    fetch: function(query,cb) {
        var query = query || {};
        return this.find(query).sort('createAt').exec(cb);
    }
}

const publishModel= mongoose.model('Publish', publishSchema);

module.exports = publishModel;


