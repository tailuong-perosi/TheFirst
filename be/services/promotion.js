const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const { createTimeline } = require('../utils/date-handle');
const DB = process.env.DATABASE;

let changeBoolean = (text) => {
    if (/^(true){1}$/gi.test(text)) {
        return true;
    }
    if (/^(false){1}$/gi.test(text)) {
        return false;
    }
    throw new Error('400: Chỉ nhận true/false!');
};

module.exports._get = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        req.query = createTimeline(req.query);
        if (req.query.from_date) {
            aggregateQuery.push({ $match: { create_date: { $gte: req.query.from_date } } });
        }
        if (req.query.to_date) {
            aggregateQuery.push({ $match: { create_date: { $lte: req.query.to_date } } });
        }
        if (req.query.promotion_id) {
            aggregateQuery.push({ $match: { promotion_id: Number(req.query.promotion_id) } });
        }
        if (req.query.code) {
            aggregateQuery.push({ $match: { code: String(req.query.code) } });
        }
        if (req.query.creator_id) {
            aggregateQuery.push({ $match: { creator_id: Number(req.query.creator_id) } });
        }
        if (req.query.has_voucher) {
            aggregateQuery.push({ $match: { has_voucher: changeBoolean(req.query.has_voucher) } });
        }
        if (req.query.branch_id) {
            aggregateQuery.push({ $match: { branch_id: { $in: Number(req.query.branch_id) } } });
        }
        if (req.query.name) {
            aggregateQuery.push({
                $match: {
                    slug_type: new RegExp(`${removeUnicode(req.query.type, false).replace(/(\s){1,}/g, '(.*?)')}`, 'ig'),
                },
            });
        }
        if (req.query.search) {
            aggregateQuery.push({
                $match: {
                    $or: [
                        {
                            code: new RegExp(`${removeUnicode(req.query.search, false).replace(/(\s){1,}/g, '(.*?)')}`, 'ig'),
                        },
                        {
                            slug_name: new RegExp(`${removeUnicode(req.query.search, false).replace(/(\s){1,}/g, '(.*?)')}`, 'ig'),
                        },
                    ],
                },
            });
        }
        // lấy các thuộc tính tùy chọn khác
        if (req.query._business) {
            aggregateQuery.push(
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'business_id',
                        foreignField: 'user_id',
                        as: '_business',
                    },
                },
                { $unwind: { path: '$_business', preserveNullAndEmptyArrays: true } }
            );
        }
        if (req.query._creator) {
            aggregateQuery.push(
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'creator_id',
                        foreignField: 'user_id',
                        as: '_creator',
                    },
                },
                { $unwind: { path: '$_creator', preserveNullAndEmptyArrays: true } }
            );
        }
        aggregateQuery.push({
            $project: {
                slug_name: 0,
                '_business.password': 0,
                '_business.slug_name': 0,
                '_business.slug_address': 0,
                '_business.slug_district': 0,
                '_business.slug_province': 0,
                '_creator.password': 0,
                '_creator.slug_name': 0,
                '_creator.slug_address': 0,
                '_creator.slug_district': 0,
                '_creator.slug_province': 0,
            },
        });
        let countQuery = [...aggregateQuery];
        aggregateQuery.push({ $sort: { create_date: -1 } });
        if (req.query.page && req.query.page_size) {
            let page = Number(req.query.page) || 1;
            let page_size = Number(req.query.page_size) || 50;
            aggregateQuery.push({ $skip: (page - 1) * page_size }, { $limit: page_size });
        }
        // lấy data từ database
        let [promotions, counts] = await Promise.all([
            client.db(req.user.database).collection(`Promotions`).aggregate(aggregateQuery).toArray(),
            client
                .db(req.user.database)
                .collection(`Promotions`)
                .aggregate([...countQuery, { $count: 'counts' }])
                .toArray(),
        ]);
        res.send({
            success: true,
            count: counts[0] ? counts[0].counts : 0,
            data: promotions,
        });
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        let insert = await client.db(req.user.database).collection(`Promotions`).insertOne(req.body);
        if (!insert.insertedId) {
            throw new Error('500: Tạo chương trình khuyến mãi thất bại!');
        }
        try {
            let _action = {
                business_id: req.user.business_id,
                type: 'Tạo',
                properties: 'Chương trình khuyến mãi',
                name: 'Tạo chương trình khuyến mãi',
                data: req.body,
                performer_id: req.user.user_id,
                date: moment().tz(TIMEZONE).format(),
                slug_type: 'tao',
                slug_properties: 'chuongtrinhkhuyenmai',
                name: 'taochuongtrinhkhuyenmai',
            };
            await Promise.all([client.db(req.user.database).collection(`Actions`).insertOne(_action)]);
        } catch (err) {
            console.log(err);
        }
        res.send({ success: true, data: req.body });
    } catch (err) {
        next(err);
    }
};

module.exports.body = async (req, res, next) => {
    try {
        await client.db(req.user.database).collection(`Promotions`).updateMany(req.params, { $set: req.body });
        try {
            let _action = {
                business_id: req.user.business_id,
                type: 'Cập nhật',
                properties: 'Phương thức thanh toán',
                name: 'Cập nhật phương thức thanh toán',
                data: req.body,
                performer_id: req.user.user_id,
                date: moment().tz(TIMEZONE).format(),
                slug_type: 'capnhat',
                slug_properties: 'phuongthucthanhtoan',
                name: 'capnhatphuongthucthanhtoan',
            };
            await client.db(req.user.database).collection(`Actions`).insertOne(_action);
        } catch (err) {
            console.log(err);
        }
        res.send({ success: true, data: req.body });
    } catch (err) {
        next(err);
    }
};
