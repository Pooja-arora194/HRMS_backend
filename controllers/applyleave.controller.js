const applyleaveModel = require("../models/applyleave.model");
const leavesModel = require("../models/leaves.model");
const newuserModel = require("../models/newuser.model");
const notificationModel = require("../models/notification.model");
const postModel = require("../models/post.model");
const { sendEmail } = require('../helper/sendEmail')
const moment = require('moment')
const nodemailer = require('nodemailer');


exports.apply = async (req, res) => {
    const { reason, from_date, to_date, leave_type, leave } = req.body;
    if (!reason || !from_date || !leave || !leave_type) {
        return res.status(400).send("Parameters missing")
    }
    if (leave_type == 'Full Day' && !to_date) {
        return res.status(400).send("Parameters missing")
    }
    if (leave == 'Earned Leave') {
        let userData = await newuserModel.findById(req.user.id)
        console.info(userData.date_of_joining)
        var a = moment(new Date());
        var b = moment(userData.date_of_joining);
        // var b = moment('2023-01-15');
        let diff = a.diff(b, 'days') + 1
        if (diff < 90) {
            return res.status(400).json({
                success: false,
                msg: "You cannot Avail Earned Leave Within Three Months of Joining"
            })
        }


    }
    let data;
    try {
        data = await applyleaveModel.create({
            userId: req.user.id,
            leave,
            reason,
            from_date,
            to_date,
            leave_type
        });
        let notification = await notificationModel.create({
            userId: req.user.id,
            type: "pending",
            leave_id: data._id
        })
        let email = 'hr@smartinfocare.com'
        let html = `
        ${req.user?.email} applied for leave on ${from_date},Reason: ${reason}`
        let emailSubject = 'Leave Application'
        let sendMail = await sendEmail(email, html, emailSubject)


        res.status(201).json({
            success: true,
            data: data
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong")
    }

}






exports.getapply_leaves = async (req, res) => {
    console.log(req.user)
    try {
        // const records = await applyleaveModel.find().populate('userId', { name: 1, emp_id: 1 }).populate('leave', { name: 1 });
        if (req.user.profile == 'team_leader') {
            const records = await applyleaveModel.find({ userId: { $ne: req.user.id } }).populate('userId', { name: 1, emp_id: 1, role: 1, team_leader: 1, leave: 1 }).sort({ createdAt: -1 })
            let result = []
            for (let x of records) {
                if (x?.userId?.team_leader == req.user.id) {
                    result.push(x)
                }
            }
            res.status(201).json(result);
        }
        else if (req.user.role == 2) {

            const records = await applyleaveModel.find({ userId: { $ne: req.user.id } }).populate({ path: 'userId', match: { role: '0' } }).populate('userId', { name: 1, emp_id: 1, leave: 1, is_delete: 1 }).sort({ createdAt: -1 })
            const arr = [];

            var foundValue = records.filter(obj => obj.userId?.is_delete === false);
            console.log(foundValue, "foundValuefoundValue")
            arr.push(...foundValue)
            res.status(201).json(arr);

        }
        else if (req.user.role == 1) {
            const records = await applyleaveModel.find().populate('userId', { name: 1, emp_id: 1, role: 1 }).populate({ path: 'userId', match: { role: '0' } }).populate('userId', { name: 1, emp_id: 1, leave: 1, is_delete: 1 }).sort({ createdAt: -1 })
            const arr = [];

            var foundValue = records.filter(obj => obj.userId?.is_delete === false);
            console.log(foundValue, "foundValuefoundValue")
            arr.push(...foundValue)
            res.status(201).json(arr);
        }
        else {
            res.status(400).json({ msg: "Bad Request" });
            return

        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "SOmething went wrong" });
    }
}
exports.admin_get_apply_leave = async (req, res) => {


    try {
        // const records = await applyleaveModel.find({ createdAt: { $gte: start } }).match({userId:{role:'0'}}).populate('userId', { name: 1, emp_id: 1,role: 1}).populate('leave', { name: 1 });
        const records = await applyleaveModel.find().populate('userId', { name: 1, emp_id: 1 });
        res.status(201).json(records);
    }
    catch (error) {
        console.log(error);
    }
}

exports.update_leave = async (req, res) => {

    const id = req.params.id;
    let apply_leave_id = req.body.apply_leave_id;
    let approved = await applyleaveModel.findByIdAndUpdate(apply_leave_id, { status: 'approved' })

    let edit = await newuserModel.findById(req.params.id, { leave: 1 })
    // Don't Touch Any Condition  without permission
    if (approved?.leave == 'Casual Leave' || approved?.leave == 'Sick Leave') {
        //   ----------------Half Day leave---------------
        if (!approved?.to_date && approved?.leave_type == "Half Day") {
            if (approved?.leave == 'Casual Leave') {
                edit.leave['casual_leave'] -= 0.5
            }
            if (approved?.leave == 'Sick Leave') {
                edit.leave['sick_leave'] -= 0.5
            }
        }
        //   ----------------Half Day leave---------------


        // ------------- One Day Leave---------------
        else if (approved?.from_date === approved?.to_date) {
            edit.leave['sick_leave'] -= 0.5
            edit.leave['casual_leave'] -= 0.5
        }
        // ------------- One Day Leave---------------


        // -------------More then One Day--------------
        else if (approved?.from_date != approved?.to_date) {
            var a = moment(approved.to_date);
            var b = moment(approved.from_date);
            let diff = a.diff(b, 'days') + 1
            edit.leave['sick_leave'] -= diff / 2
            edit.leave['casual_leave'] -= diff / 2
        }
        // -------------More then One Day--------------



    }
    if (approved?.leave == 'Earned Leave') {
        var a = moment(approved.to_date);
        var b = moment(approved.from_date);
        let diff = a.diff(b, 'days') + 1
        edit.leave['earned_leave'] -= diff
    }
    // Don't Touch Any Condition  without permission

    let check = await newuserModel.findByIdAndUpdate(id, { $set: { leave: edit.leave } })
    let set_notification = await notificationModel.findOneAndUpdate({ leave_id: apply_leave_id }, { type: "approved", is_read_by_hr: true, is_read_by_user: false, is_read_by_team_leader: true })
    return res.send("success")

}

exports.cancel_leave = async (req, res) => {
    try {
        const id = req.params.id;
        let apply_leave_id = req.body.apply_leave_id;
        let cancelled = await applyleaveModel.findByIdAndUpdate(apply_leave_id, { status: 'rejected' })
        let set_notification = await notificationModel.findOneAndUpdate({ leave_id: apply_leave_id }, { type: "rejected", is_read_by_hr: true })
    }
    catch (error) {
        console.log(error);
    }
    res.status(201).send("success");

}


exports.single_user_apply_leave = async (req, res) => {
    try {
        const records = await applyleaveModel.find({ userId: req.user.id }).populate('userId', { name: 1, emp_id: 1, email: 1, role: 1 }).sort({ createdAt: -1 });

        console.log(records, "reccccccccccccccccc")

        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.in',
            port: 465,
            secure: true,
            auth: {
                user: "nidhi@smartinfocare.com",
                pass: "JAPktxMHJXYS",
            },
            authMethod: 'PLAIN',
        });

        for (const record of records) {
            const mailOptions = {
                from: 'nidhi@smartinfocare.com',
                to: 'nidhi@smartinfocare.com',
                subject: 'Leave Application',
                text: `Employee - ${req.user.name} (Employee ID: ${record.userId.emp_id}) has applied for ${record.leave}`,
                html: `<p>Your Employee ${req.user.name} (Employee ID: ${record.userId.emp_id}) has applied for ${record.leave}.</p>
                       <p>Please click <a href="https://hrms.sicsdev.com/">here</a> to login and review the leave application.</p>`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent');
                }
            });
        }

        res.status(201).json(records);
    } catch (error) {
        console.log(error);
    }
};



// exports.single_user_apply_leave = async (req, res) => {
//     try {
//         const records = await applyleaveModel.find({ userId: req.user.id }).populate('userId', { name: 1, emp_id: 1, email: 1, role: 1 }).sort({ createdAt: -1 });

//         const record = records[0];

//         console.log(records, "reccccccccccccccccc")

//         const transporter = nodemailer.createTransport({
//             host: 'smtp.zoho.in',
//             port: 465,
//             secure: true,
//             auth: {
//                 user: "hr@smartinfocare.com",
//                 pass: "9FGwvKMrzb9p",
//             },
//             authMethod: 'PLAIN',
//         });
// for (const record of records) {
//         let toEmail;


//         if (record.userId.role === 0) {
//             toEmail = 'hr@smartinfocare.com';
//         } else if (record.userId.role === 2) {
//             toEmail = 'info@smartinfocare.com';
//         }
//         const mailOptions = {
//             from: 'hr@smartinfocare.com',
//             to: toEmail,
//             subject: 'Leave Application',
//             text: `Employee - ${req.user.name} (Employee ID: ${record.userId.emp_id})has applied for ${record.leave}`,
//             html: `<p>Your Employee ${req.user.name}(Employee ID: ${record.userId.emp_id}) has applied for ${record.leave}.</p>
//                    <p>Please click <a href="https://hrms.sicsdev.com/">here</a> to login and review the leave application.</p>`,
//         };

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.log(error);
//             } else {
//                 console.log('Email sent');
//             }
//         });
// }
//         res.status(201).json(record);
//     } catch (error) {
//         console.log(error);
//     }
// };



exports.get_all_notification = async (req, res) => {
    console.log(req.user)
    let filter = {
        // is_read: false
    }
    if (req.user.profile == 'team_leader') {
        console.log('team_leader');
        filter.is_read_by_user = false;
        const all_notification = await notificationModel.find(filter).populate('userId', { name: 1, team_leader: 1 });
        let result = [];
        for (let x of all_notification) {
            if (x?.userId?.team_leader == req.user.id) {
                result.push(x);
            }
        }
        let ownFilter = {
            type: { $in: ['rejected', 'approved'] },
            userId: req.user.id,
            is_read_by_user: false
        };
        const ownNotification = await notificationModel.find(ownFilter).populate('userId', { name: 1 });
        result.push(...ownNotification);

        return res.status(200).json(result);
    }

    else if (req.user.role == 2) {

        filter.is_read_by_user = false;
        const all_notification = await notificationModel.find(filter).populate('userId', { name: 1, role: 1 });
        console.log(all_notification, "dasda")

        let result = [];
        for (let x of all_notification) {
            if (x?.type == "pending" && x?.userId?.role == '0') {
                result.push(x);
            }
        }

        let ownFilter = {
            type: { $in: ['rejected', 'approved'] },
            userId: req.user.id,
            is_read_by_user: false
        };

        const ownNotification = await notificationModel.find(ownFilter).populate('userId', { name: 1 });
        const likeNotification = await postModel.find().populate('like', { name: 1, is_read_by_hr_like: 1 });

        let likearry = [];
        for (let x of likeNotification) {
            if (x.is_read_by_hr_like == false) {
                likearry.push({ post_id: x._id, like: x.like, count: x.like.length, is_read_by_hr_like: x.is_read_by_hr_like });

            }
        }
        result.push(...ownNotification);
        return res.status(200).json({ leaverequest: result, likearry: likearry });
    }

    else if (req.user.role == 0) {
        filter.type = { $in: ['rejected', 'approved'] }
        filter.userId = req.user.id
        filter.is_read_by_user = false
    } else if (req.user.role == 1) {
        filter.is_read_by_hr = false
        filter.type = "pending";
    }

    try {
        const all_notification = await notificationModel.find(filter).populate('userId', { name: 1 });
        res.status(200).json(all_notification);
    }
    catch (error) {
        console.log(error)
    }
}




exports.is_mark_read = async (req, res) => {
    let is_mark;
    console.log(req.user)
    let role = req.user.role;
    // console.log(req.user)
    let filter = {
        // is_read: false
    }
    if (role == 2) {
        filter.is_read_by_hr = true
        filter.is_read_by_user = true

    }
    if (role == 0 && req.user.profile == 'team_leader') {
        filter.is_read_by_team_leader = true
    }
    if (role == 0) {
        filter.is_read_by_user = true
    }
    if (role == 1) {
        filter.is_read_by_hr = true
    }

    try {
        is_mark = await notificationModel.findByIdAndUpdate({ _id: req.params.id }, filter)
    }
    catch (error) {
        console.log(error);
    }
    res.status(201).json({
        success: true,
        data: is_mark,
        redirect: filter.is_read_by_hr ? true : req.user.profile == 'team_leader' ? true : req.user.role == 1 ? true : false
    });
}


exports.edit_leave_approved = async (req, res) => {
    const { status } = req.body;
    let approved_leave
    try {
        approved_leave = await applyleaveModel.findByIdAndUpdate(req.params.id, { status: 'approved' })
    }
    catch (error) {
        console.log(error)
    }
    res.status(201).json({
        success: true,
        record: approved_leave
    });
}

exports.edit_leave_deny = async (req, res) => {
    const { userId } = req.body;
    const apply_leave_id = req.params.id;
    // let apply_leave_id = req.body.apply_leave_id;
    let approved = await applyleaveModel.findByIdAndUpdate(apply_leave_id, { status: 'rejected' })
    let edit = await newuserModel.findById(approved?.userId, { leave: 1 })
    console.log(edit)
    // Don't Touch Any Condition  without permission
    if (approved?.leave == 'Casual Leave' || approved?.leave == 'Sick Leave') {
        //   ----------------Half Day leave---------------
        if (!approved?.to_date && approved?.leave_type == "Half Day") {
            if (approved?.leave == 'Casual Leave') {
                edit.leave['casual_leave'] += 0.5
            }
            if (approved?.leave == 'Sick Leave') {
                edit.leave['sick_leave'] += 0.5
            }
        }
        //   ----------------Half Day leave---------------


        // ------------- One Day Leave---------------
        else if (approved?.from_date === approved?.to_date) {
            edit.leave['sick_leave'] += 0.5
            edit.leave['casual_leave'] += 0.5
        }
        // ------------- One Day Leave---------------


        // -------------More then One Day--------------
        else if (approved?.from_date != approved?.to_date) {
            var a = moment(approved.to_date);
            var b = moment(approved.from_date);
            let diff = a.diff(b, 'days') + 1
            edit.leave['sick_leave'] += diff / 2
            edit.leave['casual_leave'] += diff / 2
        }
        // -------------More then One Day--------------



    }
    if (approved?.leave == 'Earned Leave') {
        var a = moment(approved.to_date);
        var b = moment(approved.from_date);
        let diff = a.diff(b, 'days') + 1
        edit.leave['earned_leave'] += diff
    }
    // Don't Touch Any Condition  without permission
    console.log(edit.leave)
    let check = await newuserModel.findByIdAndUpdate(approved.userId, { $set: { leave: edit.leave } })
    let set_notification = await notificationModel.findOneAndUpdate({ leave_id: apply_leave_id }, { type: "rejected", is_read_by_user: false, is_read_by_team_leader: true })
    return res.send("success")
}

// module.exports = {
//     apply, getapply_leaves, update_leave, single_user_apply_leave, cancel_leave, admin_get_apply_leave
// }

