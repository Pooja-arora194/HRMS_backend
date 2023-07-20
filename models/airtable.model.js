const mongoose = require("mongoose");
const { APP_URL } = require("../config");
const Schema = mongoose.Schema;

const airtableSchema = new Schema({
    file_path: { type: String, default: '' }
}, { timestamps: true, toJSON: { getters: true } });

module.exports = mongoose.model('Airtable', airtableSchema, 'airtable_use')