const express = require(`express`);

const router = express.Router();
const statistic = require(`../controllers/statistic`);
const { auth } = require(`../middleware/jwt`);

router.route(`/overview/chart`).get(auth, statistic._getChartOverview);
router.route(`/overview/top-sell`).get(auth, statistic._getProductOverview);
router.route(`/overview/order`).get(auth, statistic._getOrderOverview);
// router.route(`/inventory`).get(auth, statistic.getInventoryC)
// router.route(`/finance`).get(auth, statistic.getFinanceC)

module.exports = router;
