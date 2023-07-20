const mongoose = require("mongoose");
const { APP_URL } = require("../config");
const Schema = mongoose.Schema;

const eventSchema = new Schema({

    event_title: { type: String, required: true },
    event_date: { type: Date, required: true },
    event_description: { type: String, required: true },
    start_time: { type: String },
    end_time: { type: String }


}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema, 'event')