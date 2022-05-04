const express = require(`express`);

const router = express.Router();
const warranty = require(`../controllers/warranty`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, warranty._create);
router.route(`/update/:warranty_id`).patch(auth, warranty._update);
router.route(`/`).get(auth, warranty._get);
router.route(`/delete`).delete(auth, warranty._delete);

module.exports = router;
