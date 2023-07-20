const newuserModel = require("../models/newuser.model");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "MYSECRETKEY"
const moment = require("moment");
const dailyReportModel = require("../models/dailyReport.model");
const express = require("express")
const user = express();
const path = require('path');
const multer = require("multer");
const XLSX = require("xlsx");

const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});


const upload = multer({ storage }).single('file');


exports.adduser = async (req, res) => {
  try {
    const { name, email, first_login, dob, phonenumber, designation, emp_id, date_of_joining, profile, otherDesignation, team_leader } = req.body;

    const existingUser = await newuserModel.findOne({ email: email });
    let empId = await newuserModel.findOne({ emp_id: emp_id })
    if (empId) {
      return res.status(400).json({ msg: 'An account with this Employee Id already exists.' })
    }

    if (existingUser)
      return res
        .status(400).json({ msg: "An account with this email already exists." });
    let adduser;

    if (req.body.designation == 'HR') {
      adduser = new newuserModel({
        name,
        email,
        first_login,
        phonenumber,
        dob,
        emp_id,
        designation,
        role: 2,
        date_of_joining,
        team_leader,
        profile,
        otherDesignation

      });
    }
    else {
      adduser = new newuserModel({
        name,
        email,
        first_login,
        phonenumber,
        dob,
        emp_id,
        designation,
        date_of_joining,
        team_leader,
        profile,
        otherDesignation

      });
    }

    const savedUser = await adduser.save();

    const token = jwt.sign({ email: savedUser.email, id: savedUser._id, role: savedUser.role }, SECRET_KEY)
    res.status(201).json({ data: savedUser, authtoken: token })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message });
  }

},
  exports.getAllTeamLeaders = async (req, res) => {
    try {
      let filter = {
        profile: 'team_leader',
        is_delete: false
      }
      let data = await newuserModel.find(filter, { name: 1, id: 1 })
      res.status(200).json(data)

    } catch (e) {
      console.log(e)
      res.status(500).json(e)
    }
  }
exports.employee_list = async (req, res) => {
  let finalsheet;

  try {

    if (req.user.role == 1) {
      finalsheet = await newuserModel.find({ role: { $ne: 1 }, is_delete: false }).sort({ name: 1 })
    }
    if (req.user.role == 2) {
      finalsheet = await newuserModel.find({ role: 0, is_delete: false }).sort({ name: 1 })
    }
  }
  catch (error) {
    console.log(error);
  }
  res.status(201).json(finalsheet);
},

  exports.employee_remove = async (req, res) => {
    let remove;

    try {
      remove = await newuserModel.findByIdAndUpdate(req.params.id, { is_delete: true });
    }
    catch (error) {
      console.log(error);
    }
    res.status(201).json(remove);
  }

exports.all = async (req, res) => {

  let findrecords;

  try {
    findrecords = await newuserModel.findById(req.user.id);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
  return res.json(findrecords);
},

  exports.all_add_employee = async (req, res) => {

    let added_employee;
    added_employee = await newuserModel.find();
    let arrays = []
    for (let x of added_employee) {

      let finaldate = moment(x.createdAt).format('DD/MM/YYYY')

      let currentdate = moment(new Date()).format('DD/MM/YYYY')
      if (finaldate == currentdate) {
        arrays.push({ name: x.name, emp_id: x.emp_id, email: x.email, password: x.password, _id: x.id, invite_status: x.invite_status })
      }
      else {
        console.log("no")
      }

    }
    return res.json(arrays);
  },

  exports.all_employee = async (req, res) => {

    let allemployee = await newuserModel.find();
    let birthday = [];
    for (let x of allemployee) {
      const todayMonth = new Date().getMonth() + 1;

      var DateObj = new Date(x.dob);
      const final = DateObj.getMonth() + 1
      if (final === todayMonth) {
        console.log("yes")
        birthday.push({ name: x.name, dob: x.dob, image: x.image })
      }
      else {
        console.log("no")
      }


    }
    res.status(201).json(birthday);

  }
exports.employee_birthday = async (req, res) => {

  let allemployee = await newuserModel.find({ is_delete: false }).sort({ createdAt: -1 });
  let birthday = [];
  for (let x of allemployee) {
    const todayMonth = new Date().getMonth() + 1;
    let todaydate = new Date().getDate()

    var DateObj = new Date(x.dob);
    const final = DateObj.getMonth() + 1
    let upcomingDates = DateObj.getDate()
    console.log(x.name, todayMonth, todaydate, final, upcomingDates, "sddddddddddddd");
    if (final === todayMonth && todaydate <= upcomingDates) {
      birthday.push({ name: x.name, dob: x.dob, image: x.image })
    }
  }
  console.log(birthday)
  res.status(201).json(birthday);

}

exports.employee_anniversary = async (req, res) => {

  let allemployee = await newuserModel.find().sort({ date_of_joining: -1 });
  let anniversary = [];
  for (let x of allemployee) {
    const todayMonth = new Date().getMonth() + 1;
    let todaydate = new Date().getDate()

    var DateObj = new Date(x.date_of_joining);
    let upcomingDates = DateObj.getDate()

    const final = DateObj.getMonth() + 1
    if (final === todayMonth && todaydate <= upcomingDates) {
      const difference = new Date().getFullYear() - DateObj.getFullYear();
      if (difference > 0)
        anniversary.push({ name: x.name, date_of_joining: x.date_of_joining, image: x.image, difference: difference })
    }
  }
  console.log(anniversary)
  res.status(201).json(anniversary);


}

// exports.checkInAndOut = async (userId) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       // console.log(req.user, req.body)
//       const now = new Date();
//       const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//       let data = await dailyReportModel.findOne({ createdAt: { $gte: today }, userId: userId }).sort({ createdAt: -1 })
//       // if(data.length>0 && data[0]?.checkInFlag==true){
//       console.log(data)
//       if (!data) {
//         let createNewReport = new dailyReportModel({
//           checkIn: new Date(),
//           checkInFlag: true,
//           userId: userId
//         })
//         let data = await createNewReport.save()
//         // res.status(200).send("successfully checked in")
//         resolve("successfully checked in")

//       }
//       else {
//         let update = await dailyReportModel.findByIdAndUpdate(data.id, { checkOut: new Date(), checkOutFlag: true })
//         // res.status(200).send('successfully checked out')
//         resolve("successfully checked Out")
//       }
//     } catch (e) {
//       reject(e)
//     }
//   })

// }

exports.checkIN = async (req, res) => {
  console.log(req.user, req.body)
  const now = new Date();
  // const now = new Date('2023-03-23T13:30:38.982Z');
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  console.log(today, "today")
  let data = await dailyReportModel.findOne({ createdAt: { $gte: today }, userId: req.user.id }).sort({ createdAt: -1 })
  // if(data.length>0 && data[0]?.checkInFlag==true){
  console.log(data, "checkIN")
  if (!data) {
    let createNewReport = new dailyReportModel({
      checkIn: now,
      checkInFlag: true,
      userId: req.user.id
    })
    let data = await createNewReport.save()
  }
  res.status(200).send("successfully checked in")

}
exports.checkOut = async (req, res) => {
  // const now = new Date('2023-03-24T01:30 :38.982Z');
  const now = new Date();
  // let now='2023-03-23T23:29:38.982Z'
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  console.log(now, today, "now")
  let data = await dailyReportModel.findOne({ createdAt: { $gte: today }, userId: req.user.id }).sort({ createdAt: -1 })
  // if(data.length>0 && data[0]?.checkInFlag==true){
  // console.log(data,"CheckOut")  
  if (data) {
    let update = await dailyReportModel.findByIdAndUpdate(data.id, { checkOut: new Date(), checkOutFlag: true })
  }
  res.status(200).send('successfully checked out')

}


exports.getStatus = async (req, res) => {
  if (req.user.role == 2) {

    const startDate = new Date().toDateString();
    const today = await dailyReportModel.find({
      createdAt: { $gte: startDate }

    }).populate('userId', { name: 1, emp_id: 1 });
    res.json(today)
  }


  else if (req.user.role == 1) {
    const startDate = new Date().toDateString();
    const today = await dailyReportModel.find({
      createdAt: { $gte: startDate }

    }).populate('userId', { name: 1, emp_id: 1 });
    res.json(today)
  }
  else if (req.user.role == 0) {
    const startDate = new Date().toDateString();
    const today = await dailyReportModel.find({
      createdAt: { $gte: startDate }, userId: req.user.id

    }).populate('userId', { name: 1, emp_id: 1 }).populate({ path: 'userId' });
    res.json(today)

  }
  else {
    res.status(400).json({ msg: "Bad Request" });
    return

  }

}

exports.getAllStatus = async (req, res) => {

  var startDate = new moment().startOf('month').format("YYYY-MM-DD");
  var endDate = new moment().endOf("month").format("YYYY-MM-DD");

  let monthlyData = await dailyReportModel.find({
    checkIn: { $gte: startDate, $lte: endDate }
  }).populate('userId', { name: 1, emp_id: 1, role: 1 }).sort({ createdAt: -1 })

  monthlyData = monthlyData.filter(record => record.userId !== null);
  res.status(201).json(monthlyData)
}


exports.excel_uploader = async (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        throw new Error("File upload error");
      }

      const filePath = req.file.path;

      const extension = path.extname(filePath);
      if (extension !== ".xlsx") {
        fs.unlinkSync(filePath);
        throw new Error("Only XLSX files are allowed");
      }

      const workbook = XLSX.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      for (let i = 1; i < jsonData.length; i++) {
        const [, name, casual_leave_sick_leave, earned_leave] = jsonData[i];
        console.log("Data:", jsonData[i]);

        const user = await newuserModel.findOne({ name });

        if (user) {
          let casual_leave = user.leave.casual_leave;
          let sick_leave = user.leave.sick_leave;

          if (typeof casual_leave_sick_leave === "number") {
            casual_leave = casual_leave_sick_leave / 2;
            sick_leave = casual_leave_sick_leave / 2;
          }

          user.leave.casual_leave = casual_leave;
          user.leave.sick_leave = sick_leave;
          user.leave.earned_leave = parseFloat(earned_leave) || user.leave.earned_leave;
          console.log("Updated Leave Data:", user.leave);
          await user.save();
        }
      }

      fs.unlinkSync(filePath);

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false });
      console.log(error);
    }
  });
};











