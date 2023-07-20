const mongoose = require("mongoose");
const { APP_URL } = require("../config");
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    project_name: { type: String, required: true },
    duration: { type: Date, required: true },
    department: { type: String, required: true },
    client_name: { type: String, required: true },
    launch_date: { type: Date, required: true },
    status: { type: String, required: true },
    code: { type: String, required: true },

}, { timestamps: true, toJSON: { getters: true } });

module.exports = mongoose.model('Project', projectSchema, 'project')