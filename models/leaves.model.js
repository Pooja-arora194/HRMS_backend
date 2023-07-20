const mongoose = require("mongoose");
const { APP_URL } = require("../config");
const Schema = mongoose.Schema;

const leavesSchema = new Schema({


    name: { type: String },
    leave_type: { type: String },


}, { timestamps: true });

module.exports = mongoose.model('Leaves', leavesSchema, 'leaves')