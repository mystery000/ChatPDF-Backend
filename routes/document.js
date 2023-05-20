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

/*
    GET http://localhost:5000/apis/documents/:sourceId/messages HTTP/1.1

    Authorization: Bearer

    Get messages from specific source
    Return Type: Array
*/

router.get('/:sourceId/messages', async (req, res) => {
    try {
        const sourceId = req.params.sourceId;
        const data = await User.findOne(
            {
                _id: req.user._id,
                'sources.sourceId': sourceId,
            },
            'sources.messages.$',
        );
        const messages = data.sources[0].messages;
        return res.json(messages);
    } catch (error) {
        console.log(error);
        return res.json(error);
    }
});

/*
    POST http://localhost:5000/apis/documents/:sourceId/chat HTTP/1.1

    Content-Type: application/json
    Authorization: Bearer

*/

router.post('/:sourceId/chat', async (req, res) => {});

/*
    GET http://localhost:5000/apis/documents/:sourceId HTTP/1.1

    Authorization: Bearer

    Get all uploaded documents in specific source
    Return Type: Array
*/

router.get('/:sourceId', async (req, res) => {
    const sourceId = req.params.sourceId;
    try {
        const data = await User.findOne(
            {
                _id: req.user._id,
                'sources.sourceId': sourceId,
            },
            'sources.documents.$',
        );
        const documents = data.sources[0].documents;
        return res.json(documents);
    } catch (error) {
        console.log(error);
        return res.json({ error: 'failed to query mongodb' });
    }
});

/*
    PUT http://localhost:5000/apis/documents/:sourceId HTTP/1.1

    Authorization: Bearer

    Rename document with specific id

    {
        name: 'new document name'
    }
*/

router.put('/:sourceId', async (req, res) => {
    const name = req.body.name;
    const sourceId = req.params.sourceId;
    try {
        await User.updateOne(
            { _id: req.user._id, 'sources.sourceId': sourceId },
            {
                $set: {
                    'sources.$.name': name,
                },
            },
        );
        res.json({ success: 'Renamed successfully!' });
    } catch (error) {
        return res.json({ error: 'failed to rename document' });
    }
});

module.exports = router;
