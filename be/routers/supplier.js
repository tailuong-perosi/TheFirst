const express = require(`express`);

const router = express.Router();
const supplier = require(`../controllers/supplier`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, supplier._create);
router.route(`/update/:supplier_id`).patch(auth, supplier._update);
router.route(`/`).get(auth, supplier._get);
router.route(`/delete`).delete(auth, supplier._delete);

module.exports = router;
