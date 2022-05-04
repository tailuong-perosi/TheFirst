const express = require(`express`);

const router = express.Router();
const product = require(`../controllers/product`);
const { auth } = require(`../middleware/jwt`);

const multer = require('multer');
const _storage = multer.memoryStorage();
const upload = multer({ storage: _storage });

router.route(`/create`).post(auth, product._create);
router.route(`/update/:product_id`).patch(auth, product._update);
router.route(`/`).get(auth, product._get);
router.route(`/delete`).delete(auth, product.deleteProductC);
router.route(`/attribute`).get(auth, product.getAllAtttributeC);
router.route(`/unit`).get(auth, product.getAllUnitProductC);
router.route(`/unit/create`).post(auth, product.AddUnitProductC);
router.route(`/feedback/create`).post(auth, product.addFeedbackC);
router.route(`/feedback/delete`).delete(auth, product.deleteFeedbackC);
router.route(`/file/import`).post(auth, upload.single('file'), product.importFileC);

module.exports = router;
