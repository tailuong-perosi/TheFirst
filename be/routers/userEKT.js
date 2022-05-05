const express = require(`express`);

const router = express.Router();
const user = require(`../controllers/userEKT`);
    

router.route(`/register`).post(user._register);
router.route('/login').post(user._login)
router.route(`/update/:user_id`).patch(user._update);
router.route(`/`).get(user._getUser);
router.route(`/:user_id`).get(user._getOne);
// router.route(`/delete`).delete(auth, user._delete);

router.route(`/refreshtoken`).post(user._refreshToken)
router.route(`/getotp`).post(user._getOTP)
router.route(`/verifyotp`).post(user._verifyOTP)
router.route(`/recoverypassword`).post(user._recoveryPassword)

module.exports = router;