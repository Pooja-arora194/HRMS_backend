const express = require("express");
const mongoose = require("mongoose");
const { DATABASE_URI } = require('./config');
const router = require('./routes');
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8000;

const shell = require("shelljs")
const cron = require('node-cron');
const { earnedLeaveCron } = require("./cron/cron");
cron.schedule('0 0 1 * *', earnedLeaveCron);

const whitelist = ["http://localhost:3000", "https://hrmsapp.vercel.app", 'https://hrmsapp-git-3-sicsdev21.vercel.app/', 'https://smartinfocare.com/']
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}
// app.use(cors(corsOptions))

app.use(cors())

app.use(express.json());
app.use('/', router);
app.use('/uploads', express.static('uploads'));
app.use('/airtable_files', express.static('airtable_files'));
app.use(express.urlencoded({ extended: true }))

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true,
}).then(() => app.listen(PORT, () => console.log(`Server started on port ${PORT}`))).catch((error) => console.log("error occured", error));
