var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var schema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    username: {type: String, required: true},
    emailAddress: {type: String, required: true},
    password: {type: String, required: true},
    crtDate: {type: Date, required: true},
    lastUpdateDate: {type: Date, required: true},
    lastLoginDate: {type: Date, required: true},
    isDeleted: {type: Boolean, required: true}
});

module.exports = mongoose.model('UserDetail', schema)