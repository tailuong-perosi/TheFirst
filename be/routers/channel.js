const express = require(`express`);

const router = express.Router();
const channel = require(`../controllers/channel`);
const { auth } = require(`../middleware/jwt`);

router.route(`/create`).post(auth, channel._create);
router.route(`/update/:channel_id`).patch(auth, channel._update);
router.route(`/`).get(auth, channel._get);
router.route(`/delete`).delete(auth, channel._delete);
router.route(`/platform`).get(auth, channel._getPlatform);

module.exports = router;
