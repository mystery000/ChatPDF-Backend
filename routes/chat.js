const axios = require("axios");
const express = require("express");
const router = express.Router();
const config = require("../config");

const options = {
    headers: {
        "x-api-key": config.API_SECRET_KEY,
        "Content-Type": "application/json",
    },
};

router.post("/message", (req, res) => {
    const data = req.body;
    axios
        .post(`${config.API_URL}chats/message`, data, options)
        .then((response) => {
            res.status(200).json({ data: response.data.content });
        })
        .catch((err) => {
            res.status(400).json({ data: "Bad Request" });
        });
});

module.exports = router;
