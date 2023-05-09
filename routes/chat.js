const express = require("express");
const router = express.Router();
const config = require("../config");

router.post("/message", (req, res) => {
    const data = req.body;
});

module.exports = router;
