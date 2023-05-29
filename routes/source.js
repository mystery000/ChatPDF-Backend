const express = require('express');
const router = express.Router();
const upload = require('../utils/uploader');
const upload_max_count = 10;
const sourceController = require('../controllers/source');

router.get('/', (req, res) => {
    res.json({
        message: 'This is source API interface',
    });
});

router.post(
    '/upload',
    upload.array('files', upload_max_count),
    sourceController.uploadfiles,
);
router.get('/', sourceController.getSources);
router.get('/:sourceId', sourceController.getDocumentsFromSource);
router.get('/:sourceId/messages', sourceController.getMessagesFromSource);
router.put('/:sourceId', sourceController.renameSource);
router.post('/:sourceId/chat', sourceController.chat);
router.delete('/:sourceId/messages', sourceController.deleteAllMessage);
router.delete('/:sourceId', sourceController.deleteSource);

module.exports = router;
