const express = require(`express`);

const router = express.Router();
const blog = require(`../controllers/blog`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, blog._create);
router.route(`/update/:blog_id`).patch(auth, blog._update);
router.route(`/`).get(auth, blog._get);
router.route(`/delete`).delete(auth, blog._delete);

module.exports = router;
