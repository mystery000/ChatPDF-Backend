const fs = require('fs');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const User = require('../models/user');
const express = require('express');
const router = express.Router();
const { ingest } = require('../scripts/ingest-data');

const upload = multer({
    dest: 'public/upload',
    limits: { fileSize: 1000 * 1000 * 500 }, // File Size Limit to 500MB
});

// router.post("/add-file", upload.single("file"), (req, res) => {
//     const file = req.file;
//     const fileName = req.body.name;
//     const formData = new FormData();
//     formData.append("file", fs.createReadStream(file.path));

//     const options = {
//         headers: {
//             "x-api-key": config.API_SECRET_KEY,
//             ...formData.getHeaders(),
//         },
//     };

//     axios
//         .post(`${config.API_URL}sources/add-file`, formData, options)
//         .then(async (response) => {
//             const sourceId = response.data.sourceId;
//             await User.findOneAndUpdate(
//                 { _id: req.user._id },
//                 {
//                     $push: {
//                         sources: {
//                             sourceId: sourceId,
//                             name: fileName,
//                             messages: [
//                                 {
//                                     text: "Welcome, What can I help you?",
//                                     isChatOwner: false,
//                                     sentBy: "PropManager.ai",
//                                 },
//                             ],
//                         },
//                     },
//                 }
//             );
//             res.status(200).json({
//                 data: sourceId,
//             });
//         })
//         .catch((err) => {
//             console.log(err);
//             res.status(400).json({ data: "Bad Request" });
//         });
// });

// router.delete("/:sourceId", (req, res) => {
//     const sourceId = req.params.sourceId;
//     const data = {
//         sources: [sourceId],
//     };

//     const options = {
//         headers: {
//             "x-api-key": config.API_SECRET_KEY,
//             "Content-Type": "application/json",
//         },
//     };

//     axios
//         .post(`${config.API_URL}sources/delete`, data, options)
//         .then(async (response) => {
//             await User.updateOne(
//                 { _id: req.user._id, "sources.sourceId": sourceId },
//                 {
//                     $pull: {
//                         sources: { sourceId },
//                     },
//                 }
//             );
//             res.status(200).json({ data: response.data });
//         })
//         .catch((err) => {
//             console.log(err);
//             res.status(400).json({ data: "Bad Request" });
//         });
// });

// // Get list of uploaded documents of current user
// router.get("/get", (req, res) => {
//     const user = req.user;
//     const documents = user.sources.map((source) => {
//         return {
//             sourceId: source.sourceId,
//             name: source.name,
//         };
//     });
//     return res.status(200).json({ data: documents });
// });

// router.get("/get/:sourceId/messages", async (req, res) => {
//     try {
//         const source_id = req.params.sourceId;
//         const user = req.user;
//         const userSource = user.sources.find(
//             (source) => source.sourceId === source_id
//         );
//         if (userSource != undefined) {
//             const messages = userSource.messages;
//             res.status(200).json({ data: messages });
//         } else {
//             res.status(400).json({
//                 data: `There is no document with ${source_id}`,
//             });
//         }
//     } catch (error) {
//         res.status(400).json({ data: "Bad Request" });
//     }
// });

// router.put("/update", async (req, res) => {
//     const user = req.user;
//     const payload = req.body;

//     try {
//         await User.updateOne(
//             { _id: user._id, "sources.sourceId": payload.sourceId },
//             {
//                 $set: {
//                     "sources.$.name": payload.name,
//                 },
//             }
//         );
//         res.status(200).json({ data: "udpated" });
//     } catch (error) {
//         res.status(400).json({ data: "failed to retrieve" });
//     }
// });

const dirPath = 'public/files/Thomas';

router.post('/upload', async (req, res) => {
    try {
        const document_id = await ingest(dirPath);
        res.json({ document_id: document_id });
    } catch (err) {
        res.json({ error: err });
        console.log('Error: ', err);
        throw new Error(err.message);
    }
});

module.exports = router;
