const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");
const config = require("./config");

mongoose
    .connect(config.MongoURL)
    .then(() => console.log("MONGODB connected!"))
    .catch(console.log);

const api = require("./routes");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(express.static(`${__dirname}/public`));
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to server.",
    });
});

app.use("/api", api);

// Handle errors.
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({ error: err });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port : ${PORT}.`);
});
