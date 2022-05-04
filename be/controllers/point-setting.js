const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const pointService = require(`../services/point-setting`);
const { stringHandle } = require('../utils/string-handle');

let removeUnicode = (text, removeSpace) => {
    /*
        string là chuỗi cần remove unicode
        trả về chuỗi ko dấu tiếng việt ko khoảng trắng
    */
    if (typeof text != 'string') {
        throw new Error('Type of text input must be string!');
    }
    if (removeSpace && typeof removeSpace != 'boolean') {
        throw new Error('Type of removeSpace input must be boolean!');
    }
    text = text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
    if (removeSpace) {
        text = text.replace(/\s/g, '');
    }
    return text;
};

module.exports._get = async (req, res, next) => {
    try {
        await pointService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        [].map((e) => {
            if (req.body[e] == undefined) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        let settingMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'PointSettings' });
        let settingId = (() => {
            if (settingMaxId && settingId.value) {
                return settingId.value;
            }
            return 0;
        })();
        if (req.body.branch_id) {
        }
        if (req.body.customer_type) {
        }
        if (req.body.category_id) {
        }
        if (req.body.product_id) {
        }
        settingId++;
        let _setting = {
            point_setting_id: settingId,
            name: req.body.name,
            accumulate_for_promotion_product: req.body.accumulate_for_promotion_product || false,
            accumulate_for_refund_order: req.body.accumulate_for_refund_order || false,
            accumulate_for_payment_point: req.body.accumulate_for_payment_point || false,
            accumulate_for_fee_shipping: req.body.accumulate_for_fee_shipping || false,
            stack_point: req.body.stack_point || false,
            exchange_point_rate: req.body.exchange_point_rate || 0,
            exchange_money_rate: req.body.exchange_money_rate || 0,
            order_require: req.body.order_require || 0,
            order_cost_require: req.body.order_cost_require || 0,
            all_branch: req.body.all_branch || false,
            branch_id: req.body.branch_id || [],
            all_customer_type: req.body.all_customer_type || false,
            customer_type_id: req.body.customer_type_id || [],
            all_category: req.body.all_category || false,
            category_id: req.body.category_id || [],
            all_product: req.body.all_product || false,
            product_id: req.body.product_id || [],
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: stringHandle(req.body.name, { createSlug: true }),
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'PointSettings' }, { $set: { name: 'PointSettings', value: settingId } }, { $upsert: true });
        req['body'] = _setting;
        await pointService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        if (req.body.active == undefined) throw new Error('400: missing param active');
        if (req.body.accumulate_for_promotion_product == undefined) throw new Error('400: missing param accumulate_for_promotion_product');
        if (req.body.stack_point == undefined) throw new Error('400: missing param stack_point');
        if (req.body.exchange_point_rate == undefined) throw new Error('400: missing param exchange_point_rate');
        if (req.body.order_require == undefined) throw new Error('400: missing param order_require');
        if (req.body.all_branch == undefined) throw new Error('400: missing param all_branch');
        if (req.body.branch_id == undefined) throw new Error('400: missing param branch_id');
        if (req.body.all_customer_type == undefined) throw new Error('400: missing param all_customer_type');
        if (req.body.customer_type_id == undefined) throw new Error('400: missing param customer_type_id');
        if (req.body.all_category == undefined) throw new Error('400: missing param all_category');
        if (req.body.category_id == undefined) throw new Error('400: missing param category_id');
        if (req.body.all_product == undefined) throw new Error('400: missing param all_product');
        if (req.body.product_id == undefined) throw new Error('400: missing param product_id');

        await pointService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`PointSettings`)
            .deleteMany({ point_setting_id: { $in: req.body.point_setting_id } });
        res.send({
            success: true,
            message: 'Xóa chương trình tích điểm thành công!',
        });
    } catch (err) {
        next(err);
    }
};
