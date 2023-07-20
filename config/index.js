
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    DATABASE_URI,
    APP_URL,
    PORT
} = process.env;