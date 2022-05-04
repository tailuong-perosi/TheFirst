const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;
const { io } = require('../config/socket');
const jwt = require(`../libs/jwt`);

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
        if (req.query.user_id) {
            aggregateQuery.push({ $match: { user_id: Number(req.query.user_id) } });
        }
        if (req.query.code) {
            aggregateQuery.push({ $match: { code: String(req.query.code) } });
        }
        if (req.query.creator_id) {
            aggregateQuery.push({ $match: { creator_id: Number(req.query.creator_id) } });
        }
        if (req.query.branch_id) {
            aggregateQuery.push({ $match: { branch_id: Number(req.query.branch_id) } });
        }
        if (req.query.store_id) {
            aggregateQuery.push({ $match: { store_id: Number(req.query.store_id) } });
        }
        if (req.query.role_id) {
            aggregateQuery.push({ $match: { role_id: Number(req.query.role_id) } });
        }
        if (req.query['today'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).startOf('days').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).endOf('days').format();
            delete req.query.today;
        }
        if (req.query['yesterday'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).add(-1, `days`).startOf('days').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).add(-1, `days`).endOf('days').format();
            delete req.query.yesterday;
        }
        if (req.query['this_week'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).startOf('weeks').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).endOf('weeks').format();
            delete req.query.this_week;
        }
        if (req.query['last_week'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).add(-1, 'weeks').startOf('weeks').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).add(-1, 'weeks').endOf('weeks').format();
            delete req.query.last_week;
        }
        if (req.query['this_month'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).startOf('months').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).endOf('months').format();
            delete req.query.this_month;
        }
        if (req.query['last_month'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).add(-1, 'months').startOf('months').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).add(-1, 'months').endOf('months').format();
            delete req.query.last_month;
        }
        if (req.query['this_year'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).startOf('years').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).endOf('years').format();
            delete req.query.this_year;
        }
        if (req.query['last_year'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).add(-1, 'years').startOf('years').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).add(-1, 'years').endOf('years').format();
            delete req.query.last_year;
        }
        if (req.query['from_date'] != undefined) {
            req.query[`from_date`] = moment(req.query[`from_date`]).tz(TIMEZONE).startOf('days').format();
        }
        if (req.query['to_date'] != undefined) {
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
                    slug_name: new RegExp(`${removeUnicode(req.query.name, false).replace(/(\s){1,}/g, '(.*?)')}`, 'ig'),
                },
            });
        }
        if (req.query.address) {
            aggregateQuery.push({
                $match: {
                    slug_address: new RegExp(`${removeUnicode(req.query.address, false).replace(/(\s){1,}/g, '(.*?)')}`, 'ig'),
                },
            });
        }
        if (req.query.district) {
            aggregateQuery.push({
                $match: {
                    slug_district: new RegExp(`${removeUnicode(req.query.district, false).replace(/(\s){1,}/g, '(.*?)')}`, 'ig'),
                },
            });
        }
        if (req.query.province) {
            aggregateQuery.push({
                $match: {
                    slug_province: new RegExp(`${removeUnicode(req.query.province, false).replace(/(\s){1,}/g, '(.*?)')}`, 'ig'),
                },
            });
        }
        if (req.query.search) {
            aggregateQuery.push({
                $match: {
                    $or: [
                        {
                            username: new RegExp(`${removeUnicode(req.query.search, false).replace(/(\s){1,}/g, '(.*?)')}`, 'ig'),
                        },
                        {
                            slug_name: new RegExp(`${removeUnicode(req.query.search, false).replace(/(\s){1,}/g, '(.*?)')}`, 'ig'),
                        },
                    ],
                },
            });
        }
        // lấy các thuộc tính tùy chọn khác
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Roles',
                    localField: 'role_id',
                    foreignField: 'role_id',
                    as: '_role',
                },
            },
            { $unwind: { path: '$_role', preserveNullAndEmptyArrays: true } }
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
        if (req.query._branch) {
            aggregateQuery.push(
                {
                    $lookup: {
                        from: 'Branchs',
                        localField: 'branch_id',
                        foreignField: 'branch_id',
                        as: '_branch',
                    },
                },
                { $unwind: { path: '$_branch', preserveNullAndEmptyArrays: true } }
            );
        }
        if (req.query._store) {
            aggregateQuery.push(
                {
                    $lookup: {
                        from: 'Stores',
                        localField: 'store_id',
                        foreignField: 'store_id',
                        as: '_store',
                    },
                },
                { $unwind: { path: '$_store', preserveNullAndEmptyArrays: true } }
            );
        }
        if (req.query._employees) {
            aggregateQuery.push({
                $lookup: {
                    from: 'Users',
                    let: { businessId: '$business_id' },
                    pipeline: [{ $match: { $expr: { $eq: ['$business_id', '$$businessId'] } } }],
                    as: '_employees',
                },
            });
        }
        aggregateQuery.push({
            $project: {
                slug_name: 0,
                password: 0,
                slug_address: 0,
                slug_district: 0,
                slug_province: 0,
                '_branch.slug_name': 0,
                '_branch.slug_warehouse_type': 0,
                '_branch.slug_address': 0,
                '_branch.slug_district': 0,
                '_branch.slug_province': 0,
                '_store.slug_name': 0,
                '_store.slug_address': 0,
                '_store.slug_district': 0,
                '_store.slug_province': 0,
                '_business.password': 0,
                '_business.otp_code': 0,
                '_business.otp_timelife': 0,
                '_business.sub_name': 0,
                '_business.sub_address': 0,
                '_business.sub_district': 0,
                '_business.sub_province': 0,
                '_creator.password': 0,
                '_creator.otp_code': 0,
                '_creator.otp_timelife': 0,
                '_creator.sub_name': 0,
                '_creator.sub_address': 0,
                '_creator.sub_district': 0,
                '_creator.sub_province': 0,
                '_employees.password': 0,
                '_employees.otp_code': 0,
                '_employees.otp_timelife': 0,
                '_employees.sub_name': 0,
                '_employees.sub_address': 0,
                '_employees.sub_district': 0,
                '_employees.sub_province': 0,
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
        let [users, counts] = await Promise.all([
            client.db(req.user.database).collection(`Users`).aggregate(aggregateQuery).toArray(),
            client
                .db(req.user.database)
                .collection(`Users`)
                .aggregate([...countQuery, { $count: 'counts' }])
                .toArray(),
        ]);
        res.send({
            success: true,
            count: counts[0] ? counts[0].counts : 0,
            data: users,
        });
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        let insert = await client.db(req.user.database).collection(`Users`).insertOne(req.body);
        if (!insert.insertedId) {
            throw new Error(`500: Tạo user thất bại!`);
        }
        delete req.body.password;
        try {
            let _action = {
                business_id: req.user?.business_id || req.body.user_id,
                type: 'Tạo',
                properties: 'Tài khoản',
                name: 'Tạo tài khoản',
                data: req.body,
                performer_id: req.user?.user_id || req.body.user_id,
                date: moment().tz(TIMEZONE).format(),
                slug_type: 'tao',
                slug_properties: 'taikhoan',
                name: 'taotaikhoan',
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
        await client.db(req.user.database).collection(`Users`).updateOne(req.params, { $set: req.body });
        delete req.body.password;
        try {
            let _action = {
                business_id: req.user.business_id,
                type: 'Cập nhật',
                properties: 'Tài khoản',
                name: 'Cập nhật tài khoản',
                data: req.body,
                performer_id: req.user.user_id,
                date: moment().tz(TIMEZONE).format(),
                slug_type: 'capnhat',
                slug_properties: 'taikhoan',
                name: 'capnhattaikhoan',
            };
            await client.db(req.user.database).collection(`Actions`).insertOne(_action);
        } catch (err) {
            console.log(err);
        }
        // if (req.body.user_id == req.body.business_id) {
        //     await client
        //         .db(req.user.database)
        //         .collection('Users')
        //         .updateMany(
        //             {
        //                 business_id: Number(req.body.user_id),
        //             },
        //             {
        //                 $set: {
        //                     price_recipe: req.body.price_recipe,
        //                     company_name: req.body.company_name,
        //                     company_website: req.body.company_website,
        //                 },
        //             }
        //         );
        // }
        let [user] = await client
            .db(req.user.database)
            .collection(`Users`)
            .aggregate([
                { $match: { user_id: Number(req.user.user_id) } },
                {
                    $lookup: {
                        from: 'Roles',
                        localField: 'role_id',
                        foreignField: 'role_id',
                        as: '_role',
                    },
                },
                { $unwind: { path: '$_role', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'Branchs',
                        localField: 'branch_id',
                        foreignField: 'branch_id',
                        as: '_branch',
                    },
                },
                { $unwind: { path: '$_branch', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'Stores',
                        localField: 'store_id',
                        foreignField: 'store_id',
                        as: '_store',
                    },
                },
                { $unwind: { path: '$_store', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        slug_name: 0,
                        password: 0,
                        slug_address: 0,
                        slug_district: 0,
                        slug_province: 0,
                        '_role.slug_name': 0,
                        '_branch.slug_name': 0,
                        '_branch.slug_warehouse_type': 0,
                        '_branch.slug_address': 0,
                        '_branch.slug_district': 0,
                        '_branch.slug_province': 0,
                        '_store.slug_name': 0,
                        '_store.slug_address': 0,
                        '_store.slug_district': 0,
                        '_store.slug_province': 0,
                    },
                },
            ])
            .toArray();
        delete user.password;
        let [accessToken] = await Promise.all([jwt.createToken(user, 24 * 60 * 60)]);
        res.send({ success: true, data: req.body, accessToken });
    } catch (err) {
        next(err);
    }
};
