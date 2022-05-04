const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const { createTimeline } = require('../utils/date-handle');
const { stringHandle } = require('../utils/string-handle');
const DB = process.env.DATABASE;

module.exports._get = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        if (req.query.performer_id) {
            aggregateQuery.push({ performer_id: Number(req.query.performer_id) });
        }
        req.query = createTimeline(req.query);
        if (req.query.from_date) {
            aggregateQuery.push({ $match: { create_date: { $gte: req.query.from_date } } });
        }
        if (req.query.to_date) {
            aggregateQuery.push({ $match: { create_date: { $lte: req.query.to_date } } });
        }
        if (req.query.type) {
            aggregateQuery.push({
                $match: { slug_type: new RegExp(stringHandle(req.query.type, { createSlug: true }), 'gi') },
            });
        }
        if (req.query.properties) {
            aggregateQuery.push({
                $match: {
                    slug_properties: new RegExp(stringHandle(req.query.properties, { createSlug: true }), 'gi'),
                },
            });
        }
        if (req.query.name) {
            aggregateQuery.push({
                $match: { slug_name: new RegExp(stringHandle(req.query.name, { createSlug: true }), 'gi') },
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
                { $unwind: '$_business' }
            );
        }
        if (req.query._performer) {
            aggregateQuery.push(
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'performer_id',
                        foreignField: 'user_id',
                        as: '_performer',
                    },
                },
                { $unwind: '$_performer' }
            );
        }

        aggregateQuery.push({
            $project: {
                '_business.password': 0,
                '_business.sub_name': 0,
                '_business.sub_address': 0,
                '_business.sub_district': 0,
                '_business.sub_province': 0,
                '_performer.password': 0,
                '_performer.sub_name': 0,
                '_performer.sub_address': 0,
                '_performer.sub_district': 0,
                '_performer.sub_province': 0,
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
        let [actions, counts] = await Promise.all([
            client.db(req.user.database).collection(`Actions`).aggregate(aggregateQuery).toArray(),
            client
                .db(req.user.database)
                .collection(`Actions`)
                .aggregate([...countQuery, { $count: 'counts' }])
                .toArray(),
        ]);
        res.send({
            success: true,
            count: counts[0] ? counts[0].counts : 0,
            data: actions,
        });
    } catch (err) {
        next(err);
    }
};
