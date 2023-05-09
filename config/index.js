const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    MongoURL: "mongodb://127.0.0.1:27017/trading",
    SecretKey: "secret",
    port: process.env.PORT,
    API_URL: process.env.API_URL,
    API_SECRET_KEY: process.env.API_SECRET_KEY,
};
