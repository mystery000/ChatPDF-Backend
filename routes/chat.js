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

router.post("/message", async (req, res) => {
    const data = req.body;
    try {
        const response = await axios.post(
            `${config.API_URL}chats/message`,
            data,
            options
        );

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

        await User.findOneAndUpdate(
            { _id: req.user._id, "sources.sourceId": data.sourceId },
            {
                $push: {
                    "sources.$.messages": [clientMsg, chatPDFMsg],
                },
            }
        );

        return res.status(200).json({ data: { chatPDFMsg } });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ data: "Bad Request" });
    }
});

module.exports = router;
