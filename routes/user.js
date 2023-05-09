const User = require("../models/user");

const express = require("express");
const router = express.Router();

const Role = {
    Administrator: "admin",
    User: "user",
};

router.get("/get", async (req, res) => {
    const userRole = req.user.role;

    if (userRole == Role.Administrator) {
        const users = await User.find().all();
        res.status(200).json({
            data: users,
        });
    } else {
        res.status(200).json({
            data: "You do not have permission to use this API.",
        });
    }
});

module.exports = router;
