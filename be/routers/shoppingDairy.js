const express = require(`express`);

const router = express.Router();
const shopping_dairy = require(`../controllers/shopping_diary`);
const { auth } = require(`../middleware/jwt`);


router.route(`/`).get(auth, shopping_dairy._get);
router.route(`/orderDetail/:name/:order_id`).get(auth, shopping_dairy._getOne);
// router.route('/delete').delete(auth, shopping_dairy._delete);

module.exports = router;
