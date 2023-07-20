const mongoose = require("mongoose");
const { APP_URL } = require("../config");
const Schema = mongoose.Schema;

const newuserSchema = new Schema({
    name: { type: String, },
    email: { type: String, required: true, },
    password: { type: String, default: '' },
    phonenumber: { type: String, },
    dob: { type: Date, },
    designation: { type: String, },
    date_of_joining: { type: Date, },
    emp_id: { type: String, },
    role: { type: Intl, default: 0 },
    first_login: { type: String, default: '' },
    otherDesignation: { type: String, default: null },
    profile: { type: String, default: null },
    team_leader: { type: String, default: null },
    leave: {
        casual_leave: { type: Intl, default: 0.5 },
        sick_leave: { type: Intl, default: 0.5 },
        earned_leave: { type: Intl, default: 0 },
    },
    image: {
        type: String, default: ''
    },
    invite_status: { type: String, default: false },
    is_delete: { type: Boolean, default: false },

}, { timestamps: true, toJSON: { getters: true } });

module.exports = mongoose.model('NewUser', newuserSchema, 'newuser')