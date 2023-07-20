const postModel = require("../models/post.model");
const leavesModel = require("../models/leaves.model");
const nodemailer = require('nodemailer');
const multer = require("multer");
const newuserModel = require('../models/newuser.model')
const notificationModel = require("../models/notification.model");
const fs = require('fs');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads');
//     },
//     filename: function (req, file, cb) {
//         const fileExtension = path.extname(file.originalname);
//         cb(null, Date.now() + "-" + file.originalname);
//     },
// });


var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}--${file.originalname}`);
    }
});

const handleMultipartData = multer({ storage, limits: { fileSize: 1000000 * 5 } }).single('image');


exports.add_post = async (req, res) => {
    handleMultipartData(req, res, async (err) => {
        const current_date = new Date();
        const { description, title, mark_as_important } = req.body;
        const filePath = req.file;

        let addValue = {
            posted_by: req.user.id
        };
        console.log('req.user.id:', req.user.id);
        if (description) {
            addValue.description = description;
        }
        if (filePath) {
            addValue.image = req.file.path;
        }
        if (current_date) {
            addValue.post_date = current_date;
        }
        if (mark_as_important !== undefined) {
            addValue.mark_as_important = mark_as_important === 'true';
        }


        let post_data;

        try {
            post_data = await postModel.create(addValue);
            console.log(post_data);

            if (addValue.mark_as_important) {
                const { description, image } = addValue;
                sendNotificationEmail(description, image);
            }
        } catch (err) {
            return (err);
        }

        res.status(201).json({
            success: true,
            data: post_data
        });
    });
};
function createPreformattedText(text) {
    return `<pre>${text}</pre>`;
}

async function sendNotificationEmail(description, image) {
    try {
        const usersCursor = newuserModel.find({});
        const users = await usersCursor.exec();
        console.log(users, "usrrrrrrr");

        const recipientEmails = users.map(user => user.email);
        console.log(recipientEmails, "recipientEmailsrecipientEmails");


        const transporter = nodemailer.createTransport({
            host: "smtp.zoho.in",
            port: 465,
            secure: true,
            auth: {
                user: "hr@smartinfocare.com",
                pass: "9FGwvKMrzb9p",
            },
        });

        const imageUrl = `cid:image`;
        let htmlBody = '<strong>A new post has been marked as important. Check it out!</strong>';
        if (description) {
            htmlBody += createPreformattedText(description);
        }
        if (image) {
            htmlBody += `<img src="${imageUrl}" alt="Post Image">`;
        }

        const mailOptions = {
            from: 'hr@smartinfocare.com',
            to: recipientEmails.join(','),
            subject: 'New Important Post',
            html: htmlBody,
            attachments: [
                {
                    filename: 'image.jpg',
                    path: image,
                    cid: 'image',
                },
            ],

        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    } catch (error) {
        console.error('Error retrieving users:', error);
    }
}



exports.is_mark_read_like = async (req, res) => {
    const postId = req.params.id;

    try {

        const post = await postModel.findByIdAndUpdate(postId);

        post.is_read_by_hr_like = true;


        await post.save();

        res.status(201).json({
            success: true,
            data: post,
            redirect: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        });
    }
};



exports.allpost = async (req, res) => {

    let all = await postModel.find().populate('comment.userId', { name: 1, image: 1 }).populate('like', { name: 1, image: 1, role: 1 }).sort({ $natural: -1 }).populate('posted_by', { name: 1, image: 1, role: 1 }).sort({ $natural: -1 })

    const arr = [];
    for (let x of all) {
        const final = x.like;
        let setLike = final.findIndex(x => x.id === req.user.id);
        let like
        if (setLike < 0) {
            console.log("false")
            like = false
        } else {
            console.log("true")
            like = true
        }
        arr.push({ x, isLike: like })

    }
    return res.send(arr);

}



exports.editpost = async (req, res) => {

    handleMultipartData(req, res, async (err) => {

        const image = req.file;
        const { title, description } = req.body;


        console.log(image, "fs")

        let updateFilter = {

        }
        if (title) {
            updateFilter.title = title
        }
        if (description) {
            updateFilter.description = description
        }
        if (image) {
            updateFilter.image = req.file.path
        }
        console.log(title, description, req.params.id, "sd")
        let document
        try {
            console.log("try")
            document = await postModel.findByIdAndUpdate(req.params.id,
                updateFilter,
            );

        }
        catch (err) {
            console.log("catch")
            console.log(err)
        }

        res.status(201).json({
            success: true,
            data: document
        });

        console.log(document)


    });

}



exports.deletepost = async (req, res) => {
    let all;
    try {
        all = await postModel.findOneAndDelete({ _id: req.params.id });

    }
    catch (error) {
        console.log(error);
    }


    res.status(201).json(all);
}




exports.add_leaves = async (req, res) => {

    const { name, leave_type } = req.body;
    let data;
    try {
        data = await leavesModel.create(
            {
                name,
                leave_type

            });
    }
    catch (err) {
        return next(err);
    }
    res.status(201).json({
        success: true,
        data: data
    });

}

exports.allleave = async (req, res) => {
    const leave = await leavesModel.find();
    res.status(201).json(leave);
}

exports.like = async (req, res) => {
    try {
        let check = await postModel.findById(req.params.id)
        let likeArray = check.like
        let likedOrNot = likeArray.indexOf(req.user.id)
        if (likedOrNot < 0) {
            check = await postModel.findByIdAndUpdate(req.params.id, { $push: { like: req.user.id } })
            let likePost = await postModel.findByIdAndUpdate(req.params.id, { is_read_by_hr_like: false },
                { new: true },)
        } else {
            likeArray.splice(likedOrNot, 1)
            check = await postModel.findByIdAndUpdate(req.params.id, { $set: { like: [...likeArray] } })
        }
        res.status(201).json(check);

    }
    catch (error) {
        console.log(error)
    }


}










// module.exports = {
//     add_post, allcomment, like, allleave, add_leaves, deletepost, allpost
// }
