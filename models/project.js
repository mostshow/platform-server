'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.Types.ObjectId;

const Promise = require('bluebird');
const ProjectSchema = new Schema({
    name: { type: String },
    gitPath: { type: String },
    branch: { type: String },
    description: { type: String },
    dir: { type: String },
    category: { type: ObjectId ,ref: 'projectCategory'},
    publish: [{ type: ObjectId ,ref: 'Publish' }],
    createBy: { type: ObjectId ,ref: 'User' },
    updateBy: { type: ObjectId ,ref: 'User' },
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now }
});


ProjectSchema.pre('save', function(next) {
  if (this.isNew) {
    this.createAt = this.updateAt = Date.now()
  }
  else {
    this.updateAt = Date.now()
  }

  next()
})

ProjectSchema.statics = {
  fetch: function(cb) {
    return this
      .find({})
      .sort('updateAt')
      .exec(cb)
  },
  getById: function(id, cb) {
    return this
      .findOne({_id: id})
      .exec(cb)
  }
}

const ProjectModel = mongoose.model('Project', ProjectSchema);
Promise.promisifyAll(ProjectModel);
Promise.promisifyAll(ProjectModel.prototype);
module.exports = ProjectModel;


