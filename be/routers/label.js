const express = require(`express`);

const router = express.Router();
const label = require(`../controllers/label`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, label._create);
router.route(`/update/:label_id`).patch(auth, label._update);
router.route(`/`).get(auth, label._get);
router.route(`/delete`).delete(auth, label._delete);

module.exports = router;
