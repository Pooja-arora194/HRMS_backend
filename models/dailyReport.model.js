const mongoose = require("mongoose");
const { APP_URL } = require("../config");
const Schema = mongoose.Schema;

const Schemaa = new Schema({
    checkIn: { type: Date },
    checkInFlag: { type: Boolean, default: false },
    checkOut: { type: Date },
    checkOutFlag: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "NewUser" },
}, { timestamps: true, toJSON: { getters: true } });

module.exports = mongoose.model('dailyReport', Schemaa, 'dailyReport')
