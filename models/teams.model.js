const mongoose = require("mongoose");
const { APP_URL } = require("../config");
const Schema = mongoose.Schema;

const teamsSchema = new Schema({
    team_name: { type: String, },
    projectCode: { type: String },
    project_id: { type: Schema.Types.ObjectId, ref: 'Project', },
    team_leader_id: { type: Schema.Types.ObjectId, ref: 'NewUser', },

}, { timestamps: true, toJSON: { getters: true } });

module.exports = mongoose.model('Teams', teamsSchema, 'teams')