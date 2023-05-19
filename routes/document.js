const fs = require('fs');

const multer = require('multer');
const express = require('express');
const FormData = require('form-data');
const User = require('../models/user');

const router = express.Router();
const emptyFolder = require('../utils/emptyFolder');
const { ingest } = require('../scripts/ingest-data');

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
const upload_max_count = 30;
const upload = require('../utils/uploader');

router.post(
    '/upload',
    upload.array('files', upload_max_count),
    async (req, res) => {
        try {
            const files = req.files;
            if (files.length) {
                const documentId = req.body.documentId;
                // Embedding PDF files into the Pinecone, returns id of pinecone index
                const indexId = await ingest('public/files', documentId);
                await emptyFolder('public/files');
                return res.json({ documentId: indexId });
            }
            return res.json({ message: 'No files' });
        } catch (err) {
            res.json({ error: err });
            console.log('Error: ', err);
            throw new Error(err.message);
        }
    },
);

module.exports = router;
