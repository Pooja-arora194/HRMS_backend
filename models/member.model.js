const mongoose = require("mongoose");
const { APP_URL } = require("../config");
const Schema = mongoose.Schema;

const memberSchema = new Schema({
    project_id: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    projectCode: { type: String },
    team_id: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'NewUser', required: true },


}, { timestamps: true, toJSON: { getters: true } });

module.exports = mongoose.model('Member', memberSchema, 'member')