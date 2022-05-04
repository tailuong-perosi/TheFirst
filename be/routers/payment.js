const express = require(`express`);

const router = express.Router();
const payment = require(`../controllers/payment`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, payment._create);
router.route(`/update/:payment_method_id`).patch(auth, payment._update);
router.route(`/`).get(auth, payment._get);
router.route(`/delete`).delete(auth, payment._delete);

module.exports = router;
