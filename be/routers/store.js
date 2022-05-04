const express = require(`express`);

const router = express.Router();
const store = require(`../controllers/store`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, store._create);
router.route(`/update/:store_id`).patch(auth, store._update);
router.route(`/`).get(auth, store._get);
router.route(`/delete`).delete(auth, store._delete);

module.exports = router;
