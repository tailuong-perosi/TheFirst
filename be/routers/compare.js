const express = require(`express`);

const router = express.Router();
const compare = require(`../controllers/compare`);
const { auth } = require(`../middleware/jwt`);

router.route(`/getsession`).get(auth, compare.getSessionC);
router.route(`/getcompare`).get(auth, compare.getCompareC);
router.route(`/addcompare`).post(auth, compare.addCompareC);
router.route(`/updatecompare/:compare_id`).patch(auth, compare.updateCompareC);

module.exports = router;
