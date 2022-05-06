const express = require(`express`);

const router = express.Router();
const shopping_dairy = require(`../controllers/shopping_diary`);
const { auth } = require(`../middleware/jwt`);

router.route(`/update/:order_id`).patch(auth, shopping_dairy._update);
router.route(`/:user_phone`).get(auth, shopping_dairy._get);
router.route('/delete').delete(auth, shopping_dairy._delete);

module.exports = router;
