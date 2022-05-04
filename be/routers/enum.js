const express = require(`express`)

const router = express.Router()
const _enum = require(`../controllers/enum`)
const { auth } = require(`../middleware/jwt`)

router.route(`/order`).get(_enum._getEnumOrderStatus)
router.route(`/platform`).get(_enum._getEnumPlatform)
router.route(`/payment`).get(_enum._getEnumPaymentStatus)
router.route(`/shipping`).get(_enum._getEnumShippingStatus)
router.route(`/importorder`).get(_enum._getEnumImportOrderStatus)
router.route(`/transportorder`).get(_enum._getEnumTransportOrderStatus)
router.route(`/unit-product`).get(_enum._getEnumUnitProduct)

module.exports = router
