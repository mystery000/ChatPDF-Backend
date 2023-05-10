const express = require("express");
const router = express.Router();
const multer = require("multer");
const config = require("../config");
const axios = require("axios");
const User = require("../models/user");
const fs = require("fs");
const FormData = require("form-data");
const upload = multer({ dest: "public/files" });

router.post("/add-file", upload.single("file"), (req, res) => {
    const file = req.file;
    const fileName = req.body.name;
    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.path));

    const options = {
        headers: {
            "x-api-key": config.API_SECRET_KEY,
            ...formData.getHeaders(),
        },
    };

    axios
        .post(`${config.API_URL}sources/add-file`, formData, options)
        .then(async (response) => {
            const sourceId = response.data.sourceId;
            await User.findOneAndUpdate(
                { _id: req.user._id },
                {
                    $push: {
                        sources: {
                            sourceId: sourceId,
                            name: fileName,
                            messages: [
                                {
                                    text: "Welcome, What can I help you?",
                                    isChatOwner: false,
                                    sentBy: "PropManager.ai",
                                },
                            ],
                        },
                    },
                }
            );
            res.status(200).json({
                data: sourceId,
            });
        })
        .catch((err) => {
            res.status(400).json({ data: "Bad Request" });
        });
});

router.post("/delete", (req, res) => {
    const data = req.body;
    const options = {
        headers: {
            "x-api-key": config.API_SECRET_KEY,
            "Content-Type": "application/json",
        },
    };

    axios
        .post(`${config.API_URL}sources/delete`, data, options)
        .then((response) => {
            res.status(200).json({ data: response.data });
        })
        .catch((err) => {
            res.status(400).json({ data: "Bad Request" });
        });
});

// Get list of uploaded documents of current user
router.get("/get", (req, res) => {
    const user = req.user;
    const documents = user.sources.map((source) => {
        return {
            sourceId: source.sourceId,
            name: source.name,
        };
    });
    return res.status(200).json({ data: documents });
});

router.get("/get/:sourceId/messages", async (req, res) => {
    try {
        const source_id = req.params.sourceId;
        const user = req.user;
        const userSource = user.sources.find(
            (source) => source.sourceId === source_id
        );
        if (userSource != undefined) {
            const messages = userSource.messages;
            res.status(200).json({ data: messages });
        } else {
            res.status(400).json({
                data: `There is no document with ${source_id}`,
            });
        }
    } catch (error) {
        res.status(400).json({ data: "Bad Request" });
    }
});

router.put("/update", async (req, res) => {
    const user = req.user;
    const payload = req.body;

    try {
        await User.updateOne(
            { _id: user._id, "sources.sourceId": payload.sourceId },
            {
                $set: {
                    "sources.$.name": payload.name,
                },
            }
        );
        res.status(200).json({ data: "udpated" });
    } catch (error) {
        res.status(400).json({ data: "failed to retrieve" });
    }
});

module.exports = router;
