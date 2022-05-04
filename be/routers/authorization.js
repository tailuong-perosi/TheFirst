const express = require(`express`)
const router = express.Router()

const auth = require(`../controllers/authorization`)

router.route(`/register`).post(auth._register)
router.route(`/login`).post(auth._login)
router.route(`/refreshtoken`).post(auth._refreshToken)
router.route(`/checkverifylink`).post(auth._checkVerifyLink)
router.route(`/getotp`).post(auth._getOTP)
router.route(`/verifyotp`).post(auth._verifyOTP)
router.route(`/recoverypassword`).post(auth._recoveryPassword)
router.route(`/check-business`).post(auth._checkBusiness)

module.exports = router
