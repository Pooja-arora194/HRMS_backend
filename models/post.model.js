const mongoose = require("mongoose");
const { APP_URL } = require("../config");
const Schema = mongoose.Schema;

const postSchema = new Schema({

    title: { type: String, default: '' },
    description: { type: String, default: '' },
    post_date: { type: Date },
    posted_by: { type: Schema.Types.ObjectId, ref: 'NewUser' },
    image: { type: String, default: '' },

    mark_as_important: { type: Boolean, default: false },
    like: [
        { type: Schema.Types.ObjectId, ref: 'NewUser' }
    ],
    comment: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'NewUser' },
            content: { type: String },
        }
    ],
    is_read_by_hr_like: { type: Boolean, default: false },

}, { timestamps: true, toJSON: { getters: true } });

module.exports = mongoose.model('Post', postSchema, 'post');
