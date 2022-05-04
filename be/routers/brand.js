const express = require(`express`);

const router = express.Router();
const brand = require(`../controllers/brand`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, brand._create);
router.route(`/update/:brand_id`).patch(auth, brand._update);
router.route(`/`).get(auth, brand._get);
router.route(`/delete`).delete(auth, brand._delete);

module.exports = router;
