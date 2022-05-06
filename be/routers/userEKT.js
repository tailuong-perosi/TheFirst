const express = require(`express`);

const router = express.Router();
const user = require(`../controllers/userEKT`);
const { auth } = require(`../middleware/jwt`);

router.route(`/register`).post(user._register);
router.route('/login').post(user._login)
router.route(`/update/:user_phone`).patch(auth, user._update);
router.route(`/`).get(user._getUser);
router.route(`/:user_phone`).get(auth, user._getOne);
// router.route(`/delete`).delete(auth, user._delete);
router.route(`/checkverifylink`).post(user._checkVerifyLink)
router.route(`/refreshtoken`).post(user._refreshToken)
router.route(`/getotp`).post(user._getOTP)
router.route(`/verifyotp`).post(user._verifyOTP)
router.route(`/recoverypassword`).post(user._recoveryPassword)

module.exports = router;