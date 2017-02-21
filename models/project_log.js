
/**
 * 项目日志表
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId
const projectLogSchema = new Schema({
    behavior: { type: String },
    operator: { type: ObjectId, ref: 'User'},
    project : { type: ObjectId, ref: 'Project' },
    picture : { type: ObjectId, ref: 'Picture' },
    updateAt: {type:Date,default:Date.now},
    createAt: { type: Date, default: Date.now }

});

projectLogSchema.pre('save' , function(next){
    if (this.isNew) {
        this.createAt = Date.now();
    }else {
        this.updateAt = Date.now()
    }
    next();
})

projectLogSchema.statics = {
    getById: function(id, cb) {
        return this.findOne({ '_id':id}).exec(cb);
    },
    fetch: function(query,cb) {
        var query = query || {};
        return this.find(query).sort('createAt').exec(cb);
    },
    createLogger: function(options){

    }
}

const projectLogModel= mongoose.model('projectLog', projectLogSchema);

module.exports = projectLogModel;



