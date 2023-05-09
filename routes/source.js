const express = require("express");
const router = express.Router();
const multer = require("multer");
const config = require("../config");
const axios = require("axios");
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

router.get("/get", (req, res) => {
    const user = req.user;
    res.status(200).json({ data: user.sources });
});

module.exports = router;
