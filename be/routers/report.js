const express = require(`express`);

const router = express.Router();
const report = require(`../controllers/report`);
const { auth } = require(`../middleware/jwt`);

router.route(`/order`).get(auth, report._getOrderReport);
router.route(`/inventory`).get(auth, report._getInventoryReport);
router.route(`/input-output-inventory`).get(auth, report._getIOIReport);
router.route(`/finance`).get(auth, report._getFinanceReport);
router.route(`/finance/create`).post(auth, report._createFinanceReport);
router.route(`/finance/update/:receipt_id`).get(auth, report._updateFinanceReport);

module.exports = router;
