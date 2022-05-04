const express = require(`express`);

const router = express.Router();
const category = require(`../controllers/category`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, category._create);
router.route(`/update/:category_id`).patch(auth, category._update);
router.route(`/`).get(auth, category._get);
router.route(`/delete`).delete(auth, category._delete);

module.exports = router;
