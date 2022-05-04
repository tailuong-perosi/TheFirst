const express = require(`express`);

const multer = require('multer');
const _storage = multer.memoryStorage();
const upload = multer({ storage: _storage });
const router = express.Router();
const shippingCompany = require(`../controllers/shipping-company`);
const { auth } = require(`../middleware/jwt`);


router.route(`/create`).post(auth, shippingCompany._create);
router.route(`/update/:shipping_company_id`).patch(auth, shippingCompany._update);
router.route(`/`).get(auth, shippingCompany._get);
router.route(`/compare/import`).post(auth,upload.single('file') ,shippingCompany._importCompareCard);
router.route(`/compare/card`).get(auth,shippingCompany._getCompareCard);
router.route(`/compare/create`).post(auth,shippingCompany._createCompareCard);
router.route(`/compare/update`).patch(auth,shippingCompany._updateCompareCard);
router.route(`/delete`).delete(auth, shippingCompany._delete);

module.exports = router;
