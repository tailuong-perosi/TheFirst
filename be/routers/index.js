const express = require(`express`);

const router = express.Router();

router.get('/check-working', (req, res, next) => {
    try {
        res.send({ success: true, message: 'API is working!' });
    } catch (err) {
        next(err);
    }
});

router.use(`/authorization`, require(`./authorization`));
router.use(`/appinfo`, require(`./app-info`));
router.use(`/business`, require(`./business`));
router.use(`/address`, require(`./address`));
router.use('/enum', require('./enum'));
router.use(`/user`, require(`./user`));
router.use(`/role`, require(`./role`));
router.use(`/action`, require(`./action`));
router.use(`/customer`, require(`./customer`));
router.use(`/branch`, require(`./branch`));
router.use(`/point-setting`, require(`./point-setting`));
router.use(`/store`, require(`./store`));
router.use(`/deal`, require(`./deal`));
router.use(`/label`, require(`./label`));
router.use(`/blog`, require(`./blog`));
router.use(`/table`, require(`./table`));
router.use(`/supplier`, require(`./supplier`));
router.use(`/product`, require(`./product`));
router.use(`/brand`, require(`./brand`));
router.use(`/deal`, require(`./deal`));
router.use(`/topping`, require(`./topping`));
router.use(`/category`, require(`./category`));
router.use(`/tax`, require(`./tax`));
router.use(`/warranty`, require(`./warranty`));
router.use(`/promotion`, require(`./promotion`));
router.use(`/shipping-company`, require(`./shipping-company`));
router.use(`/order`, require(`./order`));
router.use(`/statistic`, require(`./statistic`));
router.use(`/channel`, require(`./channel`));
router.use(`/inventory`, require(`./inventory`));
router.use(`/upload`, require(`./upload`));
router.use(`/payment`, require(`./payment`));
router.use('/report', require('./report'));

router.use(`/userEKT`, require(`./userEKT`));
router.use(`/shoppingdairy`,require(`./shoppingDairy`));
router.use(`/administrator`, require(`./administrator`));
router.use(`/work`, require(`./work`));
router.use(`/menu`, require('./menu'));

module.exports = router;
