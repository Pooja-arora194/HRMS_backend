const newuserModel = require("../models/newuser.model");
const registerModel = require("../models/register.model");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "MYSECRETKEY"
const bcrypt = require("bcrypt");
//  const {checkInAndOut}=require('./newuser.controller')
// const loginController = {


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await newuserModel.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "No account with this email has been registered." });
    }
    if (user.first_login == '') {

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Invalid credentials." });

    }
    else {
      if (req.body.password != user.first_login) {

        console.log(req.body.password, "req.body.first_login")
        return res.status(400).json({ msg: "passwords do not match" });
      }

    }
    if(user.is_delete){
      return res.status(400).json({ msg: "Contact Admin for login" });
    }

    const token = jwt.sign({ email: user.email, id: user._id, role: user.role, name: user.name,profile:user.profile }, SECRET_KEY)
    // let check=await checkInAndOut(user._id)
    res.status(201).json({ success: true, authtoken: token, user: user })

  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }

}
// }



// export default loginController;\
// module.exports = { login }