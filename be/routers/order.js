const express = require(`express`);

const router = express.Router();
const order = require(`../controllers/order`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, order._create);
router.route(`/update/:order_id`).patch(auth, order._update);
router.route(`/`).get(auth, order._get);
router.route('/status').get(auth, order.enumStatusOrder);
router.route('/status/shipping').get(auth, order.enumStatusShipping);
router.route('/delete').delete(auth, order._delete);

module.exports = router;
