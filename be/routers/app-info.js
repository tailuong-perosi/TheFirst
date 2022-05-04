const express = require(`express`);

const router = express.Router();
const appInfo = require(`../controllers/app-info`);
const { auth } = require(`../middleware/jwt`);

router.route(`/`).get(auth, appInfo._getAppInfo);
router.route(`/update`).patch(auth, appInfo._updateAppInfo);
router.route(`/setup/menu`).post(auth, appInfo.setupMenuC);
router.route(`/checkdomain`).post(appInfo._checkDomain);
router.route(`/add-ghn-token`).post(auth, appInfo._addGHNToken);

module.exports = router;
