const axios = require("axios");
const express = require("express");
const router = express.Router();
const config = require("../config");
const User = require("../models/user");

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
            const clientMsg = {
                sentAt: new Date(),
                sentBy: req.user.username,
                isChatOwner: true,
                text: data.messages[0].content,
            };

            const chatPDFMsg = {
                sentAt: new Date(),
                sentBy: "PropManager.ai",
                isChatOwner: false,
                text: response.data.content,
            };
            // save to db also

            res.status(200).json({ data: { clientMsg, chatPDFMsg } });
        })
        .catch((err) => {
            res.status(400).json({ data: "Bad Request" });
        });
});

module.exports = router;
