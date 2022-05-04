const express = require(`express`);

const router = express.Router();
const topping = require(`../controllers/topping`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, topping._create);
router.route(`/update/:topping_id`).patch(auth, topping._update);
router.route(`/`).get(auth, topping._get);
router.route(`/delete`).delete(auth, topping._delete);

module.exports = router;
