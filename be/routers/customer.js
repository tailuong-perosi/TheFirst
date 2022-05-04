const express = require(`express`);

const router = express.Router();
const customer = require(`../controllers/customer`);
const { auth } = require(`../middleware/jwt`);

const multer = require('multer');
const _storage = multer.memoryStorage();
const upload = multer({ storage: _storage });

router.route(`/create`).post(auth, customer._create);
router.route(`/create/file`).post(auth, upload.single('file'), customer._importFile);
router.route(`/update/:customer_id`).patch(auth, customer._update);
router.route(`/`).get(auth, customer._get);
router.route(`/delete`).delete(auth, customer._delete);
router.route(`/pointhistory`).get(auth, customer._getPointHistory);

router.route(`/type/create`).post(auth, customer._createType);
router.route(`/type/update/:customer_id`).patch(auth, customer._updateType);
router.route(`/type/`).get(auth, customer._getType);
router.route(`/type/delete`).delete(auth, customer._deleteType);

module.exports = router;
