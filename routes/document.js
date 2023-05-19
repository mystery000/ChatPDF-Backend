const fs = require('fs');

const multer = require('multer');
const express = require('express');
const FormData = require('form-data');
const User = require('../models/user');

const router = express.Router();
const emptyFolder = require('../utils/emptyFolder');
const { ingest } = require('../scripts/ingest-data');

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
            const sourceId = req.body.sourceId;
            const documentName = req.body.documentName || 'Untitled';
            if (files.length) {
                // Embedding PDF files into the Pinecone, returns id of pinecone index
                const indexId = await ingest('public/files', sourceId);
                const documents = files.map((file) => file.filename);
                await emptyFolder('public/files');
                if (sourceId) {
                    await User.findOneAndUpdate(
                        { _id: req.user._id, 'sources.sourceId': sourceId },
                        {
                            $push: {
                                'sources.$.documents': [...documents],
                            },
                        },
                    );
                } else {
                    await User.findOneAndUpdate(
                        { _id: req.user._id },
                        {
                            $push: {
                                sources: {
                                    name: documentName,
                                    sourceId: indexId,
                                    documents: [...documents],
                                    messages: [
                                        {
                                            text: 'Welcome, What can I help you?',
                                            isChatOwner: false,
                                            sentBy: 'PropManager.ai',
                                        },
                                    ],
                                },
                            },
                        },
                    );
                }
                return res.json({ documentId: indexId });
            }
            return res.json({ message: 'No files' });
        } catch (err) {
            console.log('Error: ', err);
            res.json({ error: err });
        }
    },
);

module.exports = router;
