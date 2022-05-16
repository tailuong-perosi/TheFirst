
const express = require(`express`);
const router = express.Router();

const role = require(`../controllers/role`);
const permission = require('../controllers/Pemission')
const menu = require('../controllers/Menu')

router.route('/').get(permission._get)
router.route('/add').post(permission._create)

router.route('/role').get(role._AddRole)
// router.route('/role/add').post(role)

router.route('/menu').get(menu._get)
router.route('/menu/add').post(menu._create)

module.exports = router