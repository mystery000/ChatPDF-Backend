const multer = require('multer');

const uploader = {
    storage: function () {
        const storage = multer.diskStorage({
            destination: function (req, file, callback) {
                callback(null, 'public/files');
            },
            filename: function (req, file, callback) {
                callback(null, file.originalname);
            },
        });
        return storage;
    },
    fileFilter: function (req, file, callback) {
        if (!file.originalname.match(/\.(pdf|txt)$/)) {
            return callback(
                new Error('Only PDF or Text file type are allowed!', false),
            );
        }
        callback(null, true);
    },
};

const upload = multer({
    storage: uploader.storage(),
    fileFilter: uploader.fileFilter,
});
module.exports = upload;
