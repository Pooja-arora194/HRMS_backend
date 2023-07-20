const nodemailer = require('nodemailer')

const sendEmail = async (email,html,subject) => {
    return new Promise((resolve, reject) => {

        const transporter = nodemailer.createTransport({
            host: "smtp.zoho.in",
            port: 465,
            requireTLS: true,
            auth: {
                user: "nidhi@smartinfocare.com",
                pass: "JAPktxMHJXYS",
            },
        });
        transporter.sendMail({
            from: "nidhi@smartinfocare.com",
            to: email,
            subject: subject,
            
            html: html,

        }, (error, info) => {
            if (error) {
                console.log(error);
                reject(error)
            } else {
               resolve(info)
                // res.send("Invite sent sucessfully.");
            }

        })

    })
}
module.exports = {
    sendEmail
}