const express = require(`express`);

const router = express.Router();
const promotion = require(`../controllers/promotion`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, promotion._create);
router.route(`/update/:promotion_id`).patch(auth, promotion._update);
router.route(`/`).get(auth, promotion._get);
router.route(`/delete`).delete(auth, promotion._delete);
router.route(`/voucher/check`).post(auth, promotion._checkVoucher);

module.exports = router;
