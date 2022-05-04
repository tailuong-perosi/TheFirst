const express = require(`express`);

const router = express.Router();
const business = require(`../controllers/business`);
const { auth } = require(`../middleware/jwt`);

// router.route(`/create`).post(auth, business._create);
router.route(`/update/:business_id`).patch(auth, business._update);
router.route(`/`).get(auth, business._get);
router.route(`/delete`).delete(auth, business._delete);

module.exports = router;
