const express = require(`express`);

const router = express.Router();
const address = require(`../controllers/address`);

router.route(`/ward`).get(address._getWard);
router.route(`/district`).get(address._getDistrict);
router.route(`/province`).get(address._getProvince);
router.route(`/country`).get(address._getCountry);

module.exports = router;
