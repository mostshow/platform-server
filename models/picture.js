
/**
 * 图片表
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId
const pictureSchema = new Schema({
    url:{ type: String },
    category: {type: ObjectId,ref: 'picCategory'},
    updateAt: {type:Date,default:Date.now},
    createAt: { type: Date, default: Date.now }

});
// pictureSchema.index({url : 1 }, { unique: true });
pictureSchema.pre('save' , function(next){
    if (this.isNew) {
        this.createAt = Date.now();
    }else {
        this.updateAt = Date.now()
    }
    next();
})

pictureSchema.statics = {
    getById: function(id, cb) {
        return this.findOne({ '_id':id}).exec(cb);
    },
    fetch: function(query,cb) {
        var query = query || {};
        return this.find(query).sort('createAt').exec(cb);
    }
}

const pictureModel= mongoose.model('Picture', pictureSchema);

module.exports = pictureModel;



