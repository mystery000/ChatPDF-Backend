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
        .then((response) => {
            res.status(200).json({
                data: response.data.sourceId,
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
    res.status(200).json({ data: user.sources });
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
