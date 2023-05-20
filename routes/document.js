const fs = require('fs');

const multer = require('multer');
const express = require('express');
const FormData = require('form-data');
const User = require('../models/user');

const router = express.Router();
const emptyFolder = require('../utils/emptyFolder');
const { ingest } = require('../scripts/ingest-data');
const { initPinecone } = require('../utils/pinecone-client');
const { PINECONE_INDEX_NAME } = require('../config');

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

/*
    POST http://localhost:5000/apis/documents/upload HTTP/1.1

    content-type: multipart/form-data
    Authorization: Bearer

    {
        "sourceId": "5f9f5a24-b63b-4c72-8834-dda001630830",
        "documentName": "password",
        "files": []
    }

    return: sourceId(pinecone Index Namespace)
*/
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
                return res.json({ sourceId: indexId });
            }
            return res.json({ message: 'No files' });
        } catch (err) {
            console.log('Error: ', err);
            res.json({ error: err });
        }
    },
);

/*
    DELETE http://localhost:5000/apis/documents/:sourceId HTTP/1.1

    Authorization: Bearer

    sourceId: String

*/

router.delete('/:sourceId', async (req, res) => {
    const sourceId = req.params.sourceId;
    console.log(sourceId);
    try {
        const pinecone = await initPinecone();
        const index = pinecone.Index(PINECONE_INDEX_NAME);
        await index.delete1({ deleteAll: true, namespace: sourceId });
        await User.updateOne(
            { _id: req.user._id, 'sources.sourceId': sourceId },
            {
                $pull: {
                    sources: { sourceId },
                },
            },
        );

        return res.json({ message: 'Deleted Successfully' });
    } catch (err) {
        console.log(err);
        return res.json({ error: err });
    }
});

module.exports = router;
