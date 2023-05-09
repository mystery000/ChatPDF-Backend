const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "This is data API interface",
    });
});

module.exports = router;
