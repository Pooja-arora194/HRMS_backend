const newuserModel = require("../models/newuser.model");

const SECRET_KEY = "MYSECRETKEY"
const nodemailer = require('nodemailer')



exports.invite = async (req, res) => {
    const { _id } = req.body;

    try {
        const user = await newuserModel.findOne({ _id: _id });
        if (!user) {
            res.status(500).json({ msg: "invalid" });
        }
        let newToken = Math.floor(Math.random() * 1000000 + 1);
        user.token = newToken;
        let check = await newuserModel.findByIdAndUpdate({ _id: _id }, { invite_status: 'true' });

        user.save().then((result) => {
            const transporter = nodemailer.createTransport({
                host: "smtp.zoho.in",
                port: 465,
                requireTLS: true,
                auth: {
                    user: "hr@smartinfocare.com",
                    pass: "9FGwvKMrzb9p",
                },
            });
            transporter.sendMail({
                from: "hr@smartinfocare.com",
                to: user.email,
                subject: "For Invitation Link",
                context: {
                    username: user,
                    email: user
                },
                html: ` Please check the following details and Save login details
                <ul>
                <li>Name: ${user.name}</li>
                <li>Email: ${user.email}</li>
                <li>Password: ${user.first_login}</li>
                </ul>,
                <a href="https://hrms.sicsdev.com/">Click here to login<a> 
                `,

            }, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    res.status(201).json({
                        success: true
                    })
                    // res.send("Invite sent sucessfully.");
                }

            })

        })
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}


