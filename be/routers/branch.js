const express = require(`express`);

const router = express.Router();
const branch = require(`../controllers/branch`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, branch._create);
router.route(`/update/:branch_id`).patch(auth, branch._update);
router.route(`/`).get(auth, branch._get);
router.route(`/delete`).delete(auth, branch._delete);

module.exports = router;
