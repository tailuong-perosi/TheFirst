const express = require(`express`);

const router = express.Router();
const action = require(`../controllers/action`);
const { auth } = require(`../middleware/jwt`);

router.route(`/`).get(auth, action._get);
router.route(`/file-history`).get(auth, action._getFileHistory);
router.route('/menu-system').get(action.getAllMenuSystem);
router.route(`/file-history/create`).post(auth, action._createFileHistory);

module.exports = router;
