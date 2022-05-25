const express = require(`express`);
const router = express.Router();

const work = require('../controllers/Works')

router.route('/').get(work._get)



module.exports = router