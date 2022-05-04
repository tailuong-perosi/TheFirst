const express = require(`express`);

const router = express.Router();
const deal = require(`../controllers/deal`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, deal._create);
router.route(`/update/:deal_id`).patch(auth, deal._update);
router.route(`/`).get(auth, deal._get);
router.route(`/delete`).delete(auth, deal._delete);
router.route(`/updatesaleofvalue`).patch(auth, deal._updateSaleOff);

module.exports = router;
