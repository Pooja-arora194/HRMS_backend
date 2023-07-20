const registerModel = require("../models/register.model");
const multer = require("multer");
const newuserModel = require("../models/newuser.model");
const bcrypt = require("bcrypt");
const { Validator } = require("node-input-validator");
const dailyReportModel = require("../models/dailyReport.model");
const applyleaveModel = require('../models/applyleave.model')
const moment = require('moment')
const fs = require('fs');
const path = require('path');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});


const handleMultipartData = multer({ storage }).single('image');

exports.imageupload = async (req, res) => {
  handleMultipartData(req, res, async (err) => {
    const filePath = req.file?.path;
    try {
      const imageupload = await newuserModel.findOneAndUpdate({ _id: req.user.id }, {
        image: filePath
      });
      res.status(201).json(imageupload);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error occurred during image upload' });
    }
  });
};

exports.profile = async (req, res) => {
  let records;
  try {
    records = await newuserModel.findById(req.user.id);
    return res.json(records);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.removeImage = async (req, res) => {
  try {
    const user = await newuserModel.findById(req.user.id);
    if (user.image) {
      // const imagePath = path.join(__dirname, 'uploads', user.image);
      // const imagePath = path.join(user.image);
      const rootPath = path.resolve(__dirname, '..');
      const relativePath = user.image
      const imagePath = path.join(rootPath, relativePath);

      fs.unlink(imagePath, async (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: 'Failed to remove image', details: err.message });
        }
        user.image = undefined;
        await user.save();
        return res.json({ message: 'Image removed successfully' });
      });

    } else {
      return res.status(400).json({ error: 'User does not have an image' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};




exports.getUserData = async (req, res) => {
  try {
    let records = await newuserModel.findById(req.user.id, {
      password: 0, invite_status: 0, first_login: 0
    }).lean();
    let now = new Date()
    // const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // let tmpStart = moment(today)
    //   .utc()
    //   .startOf("day")
    //   .format("YYYY-MM-DD HH:mm:ssZ")
    // console.log(tmpStart)
    // let todayCheckIn = await dailyReportModel.find({ createdAt: { $lte: tmpStart }, userId: req.user.id }).sort({ createdAt: -1 })
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let data = await dailyReportModel.findOne({ createdAt: { $gte: today }, userId: req.user.id }).sort({ createdAt: -1 }).lean()
    // let todayCheckIn = await dailyReportModel.find()
    let final = { ...records, timeLog: { ...data } }
    return res.json(final)
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}


exports.getAllUserData = async (req, res) => {
  try {
    let records = await newuserModel.find({ role: { $ne: 1 } }).sort({ name: 1 });
    return res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.update_all_Leaves = async (req, res) => {

  const { casual_leave, sick_leave, earned_leave } = req.body;

  try {
    const updatedUser = await newuserModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'leave.casual_leave': casual_leave,
          'leave.sick_leave': sick_leave,
          'leave.earned_leave': earned_leave
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// exports.employee_list = async (req, res) => {
//   let finalsheet;

//   try {

//     if (req.user.role == 1) {
//       finalsheet = await newuserModel.find({ role: { $ne: 1 }, is_delete: false })
//     }
//     if (req.user.role == 2) {
//       finalsheet = await newuserModel.find({ role: 0, is_delete: false })
//     }
//   }
//   catch (error) {
//     console.log(error);
//   }

exports.editusername = async (req, res) => {

  const { name } = req.body;

  let editname;
  try {
    editname = await newuserModel.updateOne({ _id: req.user.id }, { $set: { name: name } })
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }

  return res.json(editname);
}

exports.editemail = async (req, res) => {

  const { email } = req.body

  let editemail;
  try {
    editemail = await newuserModel.updateOne({ _id: req.user.id }, { $set: { email: email } })
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }

  return res.json(editemail);
}

exports.editphone = async (req, res) => {

  const { phonenumber } = req.body

  let editphone;
  try {
    editphone = await newuserModel.updateOne({ _id: req.user.id }, { $set: { phonenumber: phonenumber } })
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }

  return res.json(editphone);
}

exports.editpassword = async (req, res) => {

  const { password } = req.body
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);
  let editpassword;
  try {
    editpassword = await newuserModel.updateOne({ _id: req.user.id }, { $set: { password: passwordHash, first_login: '' } })
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }

  return res.json(editpassword);
}

exports.editdob = async (req, res) => {

  const { dob } = req.body

  let editdob;
  try {
    editdob = await newuserModel.updateOne({ _id: req.user.id }, { $set: { dob: dob } })
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }

  return res.json(editdob);
}



exports.edit_profile = async (req, res) => {

  const { name, email, password, phonenumber, dob } = req.body;
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);
  let updateFilter = {

  }
  if (name) {
    updateFilter.name = name
  }
  if (email) {
    updateFilter.email = email
  }
  if (password) {
    updateFilter.password = passwordHash,
      updateFilter.first_login = ''

  } if (phonenumber) {
    updateFilter.phonenumber = phonenumber
  } if (dob) {
    updateFilter.dob = dob
  }


  let edit_records;
  try {
    edit_records = await newuserModel.findOneAndUpdate({ _id: req.user.id }, updateFilter);
  }
  catch (err) {
    return next(err);
  }

  res.status(201).json(edit_records);
}

exports.change_password = async (req, res) => {

  try {
    const val = new Validator(req.body, {
      old_password: 'required',
      new_password: 'required',
      confirm_password: 'required|same:new_password'
    });
    console.log(req.body)

    const matched = await val.check();

    if (!matched) {
      return res.status(401).send({ message: "New Password and Confirm Password Should be Same" })
    }


    const find_current_password = await newuserModel.findById(req.user.id)
    if (find_current_password.first_login == '') {
      let current_password = find_current_password.password

      if (bcrypt.compareSync(req.body.old_password, current_password)) {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(req.body.new_password, salt);
        await newuserModel.updateOne({
          _id: req.user.id
        }, {
          password: passwordHash,

        })

        return res.status(201).send({ message: "Password Change Successfully" });
      }
      else {
        return res.status(401).send({ message: "Password does not matched with Old Password" });

      }
    }
    else {
      const find_current_password = await newuserModel.findById(req.user.id)
      let current_password = find_current_password.first_login
      console.log(current_password, "current_password")

      if (req.body.old_password == current_password) {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(req.body.new_password, salt);
        await newuserModel.updateOne({
          _id: req.user.id
        }, {
          password: passwordHash,
          first_login: ''
        })

        return res.status(201).send({ message: "Password Change Successfully" });
      }
      else {
        return res.status(401).send({ message: "Password does not matched with Old Password" });

      }
    }

  }
  catch (error) {
    console.log(error)
  }


}
exports.update_all_profile = async (req, res) => {

  const { name, email, phonenumber, dob, emp_id, designation, date_of_joining, profile } = req.body;

  let updateRecord = {

  }
  if (name) {
    updateRecord.name = name
  }
  if (email) {
    updateRecord.email = email
  }

  if (phonenumber) {
    updateRecord.phonenumber = phonenumber
  }
  if (dob) {
    updateRecord.dob = dob
  }

  if (emp_id) {
    updateRecord.emp_id = emp_id
  }
  if (designation) {
    updateRecord.designation = designation
  }
  if (date_of_joining) {
    updateRecord.date_of_joining = date_of_joining
  }
  if (profile) {
    updateRecord.profile = profile
  }
  let edit_records;
  try {
    edit_records = await newuserModel.findByIdAndUpdate(req.params.id, updateRecord);
  }
  catch (err) {
    console.log(err);
  }

  res.status(201).json(edit_records);

}



