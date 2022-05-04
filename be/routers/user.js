const express = require(`express`);

const router = express.Router();
const user = require(`../controllers/user`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, user._create);
router.route(`/update/:user_id`).patch(auth, user._update);
router.route(`/`).get(auth, user._get);
router.route(`/delete`).delete(auth, user._delete);

module.exports = router;
