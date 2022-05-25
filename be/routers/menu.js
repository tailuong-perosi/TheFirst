const express = require(`express`);

const router = express.Router();
const { auth } = require(`../middleware/jwt`);
const menu = require('../controllers/menu')

router.route(`/`).get(auth, menu._get);
router.route(`/create`).post(auth,menu._create);
router.route(`/update/:menu_id`).patch(auth, menu._update);
router.route(`/delete`).delete(auth, menu._delete);

module.exports = router;
