const express = require(`express`);

const router = express.Router();
const user = require(`../controllers/userEKT`);
    

router.route(`/register`).post(user._register);
router.route('/login').post(user._login)
router.route(`/update/:user_id`).patch(user._update);
router.route(`/`).get(user._getUser);
router.route(`/:user_id`).get(user._getUser);
// router.route(`/delete`).delete(auth, user._delete);

module.exports = router;