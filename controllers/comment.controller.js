

const postModel = require("../models/post.model");
const leavesModel = require("../models/leaves.model");

exports.comment = async (req, res) => {

    try {
        let checkid = await postModel.findById(req.params.id)
        let commentArray = checkid.comment
        let commentornot = commentArray.indexOf(req.user.id)
        checkid = await postModel.findByIdAndUpdate(req.params.id, { $push: { comment: { userId: req.user.id, content: req.body.content } } });

        res.json(checkid)
    }
    catch (error) {
        console.log(error);
    }

},

    exports.delete_comment = async (req, res) => {
        let deletecomment;
        try {


            deletecomment = await postModel.findByIdAndUpdate(
                { _id: req.body.post_id },
                { $pull: { "comment": { "_id": req.body._id } } }

            )
        }
        catch (error) {
            console.log(error);
        }

        res.status(201).json({ msg: "success" })
    },

    exports.edit_comment = async (req, res) => {
        let editcomment;
        try {
            editcomment = await postModel.findOneAndUpdate(
                { _id: req.body.post_id, 'comment._id': req.body._id },
                { '$set': { "comment.$.content": req.body.content } },
                { 'new': true }
            )



        }
        catch (error) {
            console.log(error);
        }


    }

