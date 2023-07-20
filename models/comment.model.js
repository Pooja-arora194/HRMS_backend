const mongoose = require("mongoose");
const { APP_URL } = require("../config");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "NewUser" },
    posts: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    comment: {
        type: String,

    }

}, { timestamps: true, toJSON: { getters: true } });

module.exports = mongoose.model('Comment', commentSchema, 'comment')
