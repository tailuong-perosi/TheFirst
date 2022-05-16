const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const { stringHandle } = require('../utils/string-handle');
const DB = process.env.DATABASE;

let removeUnicode = (text, removeSpace) => {
    /*
        string là chuỗi cần remove unicode
        trả về chuỗi ko dấu tiếng việt ko khoảng trắng
    */
    if (typeof text != 'string') {
        return '';
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
        let aggregateQuery = [];
        // lấy các thuộc tính tìm kiếm cần độ chính xác cao ('1' == '1', '1' != '12',...)
        if (req.query.order_id) {
            aggregateQuery.push({ $match: { order_id: Number(req.query.order_id) } });
        }

        if (req.query.channel) {
            aggregateQuery.push({ $match: { channel: req.query.chanel } });
        }

        if (req.query.is_print) {
            aggregateQuery.push({ $match: { is_print: req.query.is_print } });
        }

        if (req.query.is_delivery) {
            aggregateQuery.push({ $match: { is_delivery: true } });
        }

        if (req.query.shipping_company_id) {
            aggregateQuery.push({
                $match: {
                    shipping_company_id: parseInt(req.query.shipping_company_id),
                },
            });
        }

        if (req.query.is_confirm_delivery) {
            aggregateQuery.push({
                $match: {
                    is_confirm_delivery: parseInt(req.query.is_confirm_delivery),
                },
            });
        }

        if (req.query.employee_id) {
            aggregateQuery.push({
                $match: { employee_id: Number(req.query.employee_id) },
            });
        }

        if (req.query.code) {
            aggregateQuery.push({ $match: { code: new RegExp(stringHandle(req.query.code, { createRegexQuery: true }), 'gi') } });
        }

        if (req.query.customer_id) {
            aggregateQuery.push({
                $match: { customer_id: Number(req.query.customer_id) },
            });
        }
        if (req.query.customer_code) {
            aggregateQuery.push({
                $match: { 'customer.code': new RegExp(stringHandle(req.query.customer_code, { createRegexQuery: true }), 'gi') },
            });
        }
        if (req.query.creator_id) {
            aggregateQuery.push({
                $match: { creator_id: Number(req.query.creator_id) },
            });
        }
        if (req.query.bill_status) {
            aggregateQuery.push({
                $match: {
                    bill_status: removeUnicode(String(req.query.bill_status), true).toUpperCase(),
                },
            });
        }
        if (req.query.to_address) {
            aggregateQuery.push({
                $match: {
                    shipping_info: { to_address: new RegExp(req.query.to_address) },
                },
            });
        }

        if (req.query.shipping_status) {
            aggregateQuery.push({
                $match: {
                    bill_status: removeUnicode(String(req.query.shipping_status), true).toUpperCase(),
                },
            });
        }

        if (req.query['today']) {
            req.query[`from_date`] = moment().tz(TIMEZONE).startOf('days').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).endOf('days').format();
            delete req.query.today;
        }
        if (req.query['yesterday']) {
            req.query[`from_date`] = moment().tz(TIMEZONE).add(-1, `days`).startOf('days').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).add(-1, `days`).endOf('days').format();
            delete req.query.yesterday;
        }
        if (req.query['this_week']) {
            req.query[`from_date`] = moment().tz(TIMEZONE).startOf('weeks').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).endOf('weeks').format();
            delete req.query.this_week;
        }
        if (req.query['last_week']) {
            req.query[`from_date`] = moment().tz(TIMEZONE).add(-1, 'weeks').startOf('weeks').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).add(-1, 'weeks').endOf('weeks').format();
            delete req.query.last_week;
        }
        if (req.query['this_month']) {
            req.query[`from_date`] = moment().tz(TIMEZONE).startOf('months').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).endOf('months').format();
            delete req.query.this_month;
        }
        if (req.query['last_month']) {
            req.query[`from_date`] = moment().tz(TIMEZONE).add(-1, 'months').startOf('months').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).add(-1, 'months').endOf('months').format();
            delete req.query.last_month;
        }
        if (req.query['this_year']) {
            req.query[`from_date`] = moment().tz(TIMEZONE).startOf('years').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).endOf('years').format();
            delete req.query.this_year;
        }
        if (req.query['last_year']) {
            req.query[`from_date`] = moment().tz(TIMEZONE).add(-1, 'years').startOf('years').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).add(-1, 'years').endOf('years').format();
            delete req.query.last_year;
        }

        if (req.query.delivery_date) {
            req.query[`from_date`] = moment(req.query.delivery_date).tz(TIMEZONE).startOf('days').format();

            req.query[`to_date`] = moment(req.query.delivery_date).tz(TIMEZONE).endOf('days').format();
        }
        if (req.query['from_date']) {
            req.query[`from_date`] = moment(req.query[`from_date`]).tz(TIMEZONE).startOf('days').format();
        }
        if (req.query['to_date']) {
            req.query[`to_date`] = moment(req.query[`to_date`]).tz(TIMEZONE).endOf('days').format();
        }
        if (req.query.from_date) {
            aggregateQuery.push({
                $match: { create_date: { $gte: req.query.from_date } },
            });
        }
        if (req.query.to_date) {
            aggregateQuery.push({
                $match: { create_date: { $lte: req.query.to_date } },
            });
        }
        // lấy các thuộc tính tùy chọn khác
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Branchs',
                    localField: 'sale_location.branch_id',
                    foreignField: 'branch_id',
                    as: 'sale_location',
                },
            },
            { $unwind: { path: '$sale_location', preserveNullAndEmptyArrays: true } }
        );
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Customers',
                    localField: 'customer_id',
                    foreignField: 'customer_id',
                    as: 'customer',
                },
            },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } }
        );
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Customers',
                    localField: 'customer_id',
                    foreignField: 'customer_id',
                    as: 'customer',
                },
            },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } }
        );
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Users',
                    localField: 'employee_id',
                    foreignField: 'user_id',
                    as: 'employee',
                },
            },
            { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } }
        );
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
        // lấy các thuộc tính tìm kiếm với độ chính xác tương đối ('1' == '1', '1' == '12',...)
        if (req.query.chanel) {
            aggregateQuery.push({
                $match: {
                    slug_chanel: new RegExp(removeUnicode(req.query.chanel, true), 'ig'),
                },
            });
        }
        if (req.query.product_name) {
            aggregateQuery.push({
                $match: {
                    'order_details.slug_title': {
                        $in: [new RegExp(removeUnicode(req.query.product_name, false), 'ig')],
                    },
                },
            });
        }
        
       
        let countQuery = [...aggregateQuery];
        aggregateQuery.push({ $sort: { create_date: -1 } });
        if (req.query.page && req.query.page_size) {
            let page = Number(req.query.page) || 1;
            let page_size = Number(req.query.page_size) || 50;
            aggregateQuery.push({ $skip: (page - 1) * page_size }, { $limit: page_size });
        }
        // lấy data từ database
        console.log(req.user.database);
        let [orders, counts] = await Promise.all([
            client.db(req.user.database).collection(`Orders`).aggregate(aggregateQuery).toArray(),
            client
                .db(req.user.database)
                .collection(`Orders`)
                .aggregate([...countQuery, { $count: 'counts' }])
                .toArray(),
        ]);
        res.send({
            success: true,
            count: counts[0] ? counts[0].counts : 0,
            data: orders,
        });
    } catch (err) {
        next(err);
    }
};


module.exports._create = async (req, res, next) => {
    try {
        let insert = await client.db(req.user.database).collection(`Orders`).insertOne(req.body);
        if (!insert.insertedId) {
            throw new Error('500: Lỗi hệ thống, tạo đơn hàng thất bại!');
        }
        try {
            let _action = {
                business_id: req.user._business.business_id,
                type: 'Tạo',
                properties: 'Đơn hàng',
                name: 'Tạo đơn hàng',
                data: req.body,
                performer_id: req.user.user_id,
                date: moment().tz(TIMEZONE).format(),
                slug_type: 'tao',
                slug_properties: 'donhang',
                name: 'taodonhang',
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

module.exports._update = async (req, res, next) => {
    try {
        await client.db(req.user.database).collection(`Orders`).updateOne(req.params, { $set: req.body });
        try {
            let _action = {
                business_id: req.user.business_id,
                type: 'Cập nhật',
                properties: 'Đơn hàng',
                name: 'Cập nhật đơn hàng',
                data: req.body,
                performer_id: req.user.user_id,
                date: moment().tz(TIMEZONE).format(),
                slug_type: 'capnhat',
                slug_properties: 'donhang',
                name: 'capnhatdonhang',
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
