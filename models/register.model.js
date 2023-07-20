const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { APP_URL } = require("../config");
const registerSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phonenumber: { type: String, required: true },
    dob: { type: String, required: true },
    reporting_manager: { type: String, default: '' },
    designation: { type: String, default: '' },
    leave_quota: { type: String, default: '' },
    image: {
        type: String, default: ''

    },
}, { timestamps: true });


module.exports = mongoose.model('Register', registerSchema, 'userdata')

