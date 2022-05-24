const express = require(`express`);

const router = express.Router();
const administrator = require('../controllers/administrator')
const { auth } = require(`../middleware/jwt`);

router.route(`/add`).post( administrator._create);

module.exports = router;