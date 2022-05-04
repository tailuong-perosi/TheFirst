const express = require(`express`);

const router = express.Router();
const file = require(`../libs/upload`);
const { auth } = require(`../middleware/jwt`);

const multer = require('multer');
const _storage = multer.memoryStorage();
const upload = multer({ storage: _storage });

router.route(`/single`).post(upload.single('file'), file.singleC);
router.route(`/multiple`).post(upload.array('files', 20), file.multipleC);

module.exports = router;
