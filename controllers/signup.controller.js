// const registerModel = require("../models/register.model");
// const jwt = require("jsonwebtoken");
// const SECRET_KEY = "MYSECRETKEY"

// // const signUpController = {

// exports.signup = async (req, res) => {
//   try {
//     const { username, email, password, dob, phonenumber, reporting_manager, designation, leave_quota } = req.body;
//     const existingUser = await registerModel.findOne({ email: email });
//     if (existingUser)
//       return res
//         .status(400).json({ msg: "An account with this email already exists." });
//     // const salt = await bcrypt.genSalt();
//     // const passwordHash = await bcrypt.hash(password, salt);
//     //   console.log(passwordHash);
//     const adduser = new registerModel({
//       username,
//       email,
//       password,
//       phonenumber,
//       dob,
//       reporting_manager,
//       designation,
//       leave_quota

//     });
//     const savedUser = await adduser.save();

//     const token = jwt.sign({ email: savedUser.email, id: savedUser._id, role: savedUser.role }, SECRET_KEY)
//     res.status(201).json({ data: savedUser, authtoken: token })

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }
// // }



// // export default signUpController;
// // module.exports = { signup }