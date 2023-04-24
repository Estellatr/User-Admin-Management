const multer = require('multer');
const path = require('path');
const FILE_SIZE = 1024 * 1024 *2;
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../../public/users/images'))
    },
    filename: function(req, file, cb) {
        cb(null, '../../public/users/images');
    }
});

const upload = multer({ storage: storage, limits: {
    fileSize: FILE_SIZE
}});

module.exports = upload;