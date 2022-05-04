const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const { createTimeline } = require('../utils/date-handle');
const { stringHandle } = require('../utils/string-handle');

const promotionService = require(`../services/promotion`);
const { Promotion, Voucher } = require('../models/promotion');

module.exports._get = async (req, res, next) => {
    try {
        await promotionService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        ['name'].map((e) => {
            if (req.body[e] == undefined) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        let promotionMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Promotions' });
        let promotionId = (promotionMaxId && promotionMaxId.value) || 0;
        req.body.promotion_id = ++promotionId;
        req.body.create_date = moment().tz(TIMEZONE).format();
        req.body.creator_id = req.user.user_id;
        req.body.last_update = moment().tz(TIMEZONE).format();
        req.body.updater_id = req.user.user_id;
        req.body.is_default = true;
        req.body.is_active = true;
        let _promotion = new Promotion(req.body);
        let checkExists = await client.db(req.user.database).collection('Promotions').findOne({ slug_name: _promotion.slug_name });
        if (checkExists) {
            throw new Error(`400: Promotion already exists!`);
        }
        let insertVouchers = [];
        if (_promotion.voucher_quantity > 0) {
            let voucherMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Vouchers' });
            let voucherId = (voucherMaxId && voucherMaxId.value) || 0;
            for (let i = 0; i < _promotion.voucher_quantity; i++) {
                let suffixes = String(Math.random()).substr(2, String(_promotion.voucher_quantity).length + 2);
                let _voucher = new Voucher({
                    voucher_id: ++voucherId,
                    voucher: `${_promotion.promotion_code}${suffixes}-${voucherId}`,
                    promotion_id: _promotion.promotion_id,
                });
                insertVouchers.push(_voucher);
            }
            if (insertVouchers.length > 0) {
                await client
                    .db(req.user.database)
                    .collection('AppSetting')
                    .updateOne({ name: 'Vouchers' }, { $set: { name: 'Vouchers', value: voucherId } }, { upsert: true });
                let inserts = await client.db(req.user.database).collection('Vouchers').insertMany(insertVouchers);
                if (!inserts.insertedIds) {
                    throw new Error(`400: Create voucher fail, please try again!`);
                }
            }
        }
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Promotions' }, { $set: { name: 'Promotions', value: promotionId } }, { upsert: true });
        let insert = await client.db(req.user.database).collection('Promotions').insertOne(_promotion);
        res.send({ success: true, data: _promotion });
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.promotion_id = Number(req.params.promotion_id);
        let oldPromotion = await client.db(req.user.database).collection(`Promotions`).findOne({ promotion_id: req.params.promotion_id });
        if (!oldPromotion) {
            throw new Error(`400: Promotion is not exists!`);
        }
        req.body.last_update = moment().tz(TIMEZONE).format();
        req.body.updater_id = req.user.user_id;
        let _promotion = new Promotion(oldPromotion).update(req.body);
        let checkExists = await client
            .db(req.user.database)
            .collection('Promotions')
            .findOne({ promotion_id: { $ne: _promotion.promotion_id }, name: _promotion.name });
        if (checkExists) {
            throw new Error(`400: Promotion already exists!`);
        }
        await client.db(req.user.database).collection('Promotions').updateOne({ promotion_id: req.params.promotion_id }, { $set: _promotion });
        res.send({ success: true, data: _promotion });
    } catch (err) {
        next(err);
    }
};

module.exports._checkVoucher = async (req, res, next) => {
    try {
        if (!req.body.voucher) {
            throw new Error(`400: Voucher không được để trống!`);
        }
        let voucher = await client.db(req.user.database).collection(`Vouchers`).findOne({
            voucher: req.body.voucher,
        });
        if (!voucher) {
            throw new Error(`400: Mã khuyến mãi không tồn tại hoặc đã hết hạn!`);
        }
        let promotion = await client.db(req.user.database).collection('Promotions').findOne({
            promotion_id: voucher.promotion_id,
        });
        if (!promotion) {
            throw new Error(`400: Voucher không tồn tại hoặc đã được sử dụngs!`);
        }
        res.send({ success: true, data: promotion });
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Promotions`)
            .deleteMany({ promotion_id: { $in: req.body.promotion_id } });
        res.send({
            success: true,
            message: 'Xóa chương trình khuyến mãi thành công!',
        });
    } catch (err) {
        next(err);
    }
};
