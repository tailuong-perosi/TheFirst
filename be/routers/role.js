const express = require(`express`);

const router = express.Router();
const role = require(`../controllers/role`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, role._create);
router.route(`/update/:role_id`).patch(auth, role._update);
router.route(`/`).get(auth, role._get);
router.route(`/delete`).delete(auth, role._delete);

module.exports = router;
