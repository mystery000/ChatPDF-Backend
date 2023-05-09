const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json({
        data: "this is user API interface.",
    });
});

router.get("/get", (req, res) => {});

module.exports = router;
