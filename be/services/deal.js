const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
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
        if (req.query.deal_id) {
            aggregateQuery.push({ $match: { deal_id: Number(req.query.deal_id) } });
        }
        if (req.query.code) {
            aggregateQuery.push({ $match: { code: String(req.query.code) } });
        }
        if (req.query.creator_id) {
            aggregateQuery.push({ $match: { creator_id: Number(req.query.creator_id) } });
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
        if (req.query['from_date']) {
            req.query[`from_date`] = moment(req.query[`from_date`]).tz(TIMEZONE).startOf('days').format();
        }
        if (req.query['to_date']) {
            req.query[`to_date`] = moment(req.query[`to_date`]).tz(TIMEZONE).endOf('days').format();
        }
        if (req.query.from_date) {
            aggregateQuery.push({ $match: { create_date: { $gte: req.query.from_date } } });
        }
        if (req.query.to_date) {
            aggregateQuery.push({ $match: { create_date: { $lte: req.query.to_date } } });
        }
        // lấy các thuộc tính tìm kiếm với độ chính xác tương đối ('1' == '1', '1' == '12',...)
        if (req.query.name) {
            aggregateQuery.push({
                $match: {
                    slug_name: new RegExp(
                        `${removeUnicode(req.query.name, false).replace(/(\s){1,}/g, '(.*?)')}`,
                        'ig'
                    ),
                },
            });
        }
        if (req.query.type) {
            aggregateQuery.push({
                $match: {
                    slug_type: new RegExp(
                        `${removeUnicode(req.query.type, false).replace(/(\s){1,}/g, '(.*?)')}`,
                        'ig'
                    ),
                },
            });
        }
        if (req.query.search) {
            aggregateQuery.push({
                $match: {
                    $or: [
                        {
                            code: new RegExp(
                                `${removeUnicode(req.query.search, false).replace(/(\s){1,}/g, '(.*?)')}`,
                                'ig'
                            ),
                        },
                        {
                            slug_name: new RegExp(
                                `${removeUnicode(req.query.search, false).replace(/(\s){1,}/g, '(.*?)')}`,
                                'ig'
                            ),
                        },
                    ],
                },
            });
        }
        // lấy các thuộc tính tùy chọn khác
        if (req.query._list) {
            aggregateQuery.push({
                $lookup: {
                    from: 'Categories',
                    let: { categoryIds: '$category_list' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$category_id', '$$categoryIds'] } } },
                        {
                            $lookup: {
                                from: 'Categories',
                                let: { categoryId: '$category_id' },
                                pipeline: [{ $match: { $expr: { $eq: ['$parent_id', '$$categoryId'] } } }],
                                as: 'children_category',
                            },
                        },
                        ...(() => {
                            if (req.query._list_page && req.query._list_page_size) {
                                return [{ $skip: (page - 1) * page_size }, { $limit: page_size }];
                            }
                            return [];
                        })(),
                    ],
                    as: '_categories',
                },
            });
            aggregateQuery.push({
                $lookup: {
                    from: 'Products',
                    let: { productIds: '$product_list' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$product_id', '$$productIds'] } } },
                        {
                            $lookup: {
                                from: 'Variants',
                                let: { productId: '$product_id' },
                                pipeline: [{ $match: { $expr: { $eq: ['$product_id', '$$productId'] } } }],
                                as: 'variants',
                            },
                        },
                        ...(() => {
                            if (req.query._list_page && req.query._list_page_size) {
                                return [{ $skip: (page - 1) * page_size }, { $limit: page_size }];
                            }
                            return [];
                        })(),
                    ],
                    as: '_products',
                },
            });
        }
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
                '_categories.slug_name': 0,
                '_products.slug_name': 0,
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
        let [deals, counts] = await Promise.all([
            client.db(req.user.database).collection(`Deals`).aggregate(aggregateQuery).toArray(),
            client
                .db(req.user.database)
                .collection(`Deals`)
                .aggregate([...countQuery, { $count: 'counts' }])
                .toArray(),
        ]);
        res.send({
            success: true,
            count: counts[0] ? counts[0].counts : 0,
            data: deals,
        });
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        let insert = await client.db(req.user.database).collection(`Deals`).insertOne(req.body);
        if (!insert.insertedId) {
            throw new Error('500: Tạo ưu đãi thất bại!');
        }
        try {
            let _action = {
                business_id: req.user.business_id,
                type: 'Tạo',
                properties: 'Ưu đãi',
                name: 'Tạo ưu đãi',
                data: req.body,
                performer_id: req.user.user_id,
                date: moment().tz(TIMEZONE).format(),
                slug_type: 'tao',
                slug_properties: 'uudai',
                name: 'taouudai',
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
        await client.db(req.user.database).collection(`Deals`).updateOne(req.params, { $set: req.body });
        try {
            let _action = {
                business_id: req.user.business_id,
                type: 'Cập nhật',
                properties: 'Ưu đãi',
                name: 'Cập nhật ưu đãi',
                data: req.body,
                performer_id: req.user.user_id,
                date: moment().tz(TIMEZONE).format(),
                slug_type: 'capnhat',
                slug_properties: 'uudai',
                name: 'capnhatuudai',
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
