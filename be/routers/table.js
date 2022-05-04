const express = require(`express`);

const router = express.Router();
const table = require(`../controllers/table`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, table._create);
router.route(`/update/:table_id`).patch(auth, table._update);
router.route(`/`).get(auth, table._get);
router.route(`/delete`).delete(auth, table._delete);

module.exports = router;
