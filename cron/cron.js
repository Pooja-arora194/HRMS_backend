const cron = require('node-cron');
const shell = require("shelljs")
const newuserModel = require("../models/newuser.model")




// cron.schedule('0 0 1 * *', () => {
//     earnedLeaveCron()

// });


exports.earnedLeaveCron = async (req, res) => {
    let allUser = await newuserModel.find({ is_delete: false }, { createdAt: 1, leave: 1 })
    if (allUser?.length < 1) {
        return res.status(400).send("no user found")
    }
    const date = new Date('2023/12/31');

    const year = date.getFullYear() + 15;
    const month = date.getMonth() + 1;
    const day = date.getDate();


    if (new Date().getMonth() + 1 == month) {

        if (new Date().getDate(), day) {
            for (let x of allUser) {
                let update = { ...x.leave }
                let c = allUser[0].email
                update['sick_leave'] = 0
                update['casual_leave'] = 0
                let check = await newuserModel.findByIdAndUpdate(x._id, { $set: { leave: update } })
            }
        }
    }
    else {
        for (let x of allUser) {
            let update = { ...x.leave }
            let c = allUser[0].email
            update['sick_leave'] += 0.5
            update['casual_leave'] += 0.5
            update['earned_leave'] += 1
            let check = await newuserModel.findByIdAndUpdate(x._id, { $set: { leave: update } })
        }
    }
    res.send("successfully")
}