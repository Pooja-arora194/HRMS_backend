const jwt = require("jsonwebtoken");
const newuserModel = require('../models/newuser.model')

const SECRET_KEY = "MYSECRETKEY"

const auth = async (req, res, next) => {
  const token = req.headers["authorization"].split(' ')[1];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = await jwt.verify(token, SECRET_KEY);
    let data = await newuserModel.findById(decoded.id)
    if (Object.keys(data).length < 1) {
      return res.status(400).send("Invalid User");
    }
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};


module.exports = auth;