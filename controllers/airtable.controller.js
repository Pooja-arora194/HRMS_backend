const multer = require("multer");
var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, './airtable_files');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}--${file.originalname}`);
    }
});

var upload = multer({ storage: storage }).single("file");

exports.imageupload1 = async (req, res) => {

    console.log(req.body)
    var hostname = req.headers.host; // hostname = 'localhost:8080'

    upload(req, res, async (err) => {
        if (err) {
            res.status(400).send("Something went wrong!");
        } else {
            res.status(200).json({
                status: 200,
                file_path: 'https://' + hostname + "/airtable_files/" + req.file.filename
            })
        }

    });

}
