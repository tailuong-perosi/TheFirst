const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const SDB = process.env.DATABASE;

const actionService = require(`../services/action`);
const { createTimeline } = require('../utils/date-handle');
const { stringHandle } = require('../utils/string-handle');

module.exports.getAllMenuSystem = async (req, res, next) => {
    try {
        var menuAppSetting = await client.db(SDB).collection('AppSetting').findOne({
            name: 'Menus',
        });
        return res.send({ success: true, data: menuAppSetting.lists });
    } catch (err) {
        next(err);
    }
};

module.exports._get = async (req, res, next) => {
    try {
        await actionService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._getFileHistory = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        if (req.query.file_id) {
            aggregateQuery.push({ $match: { file_id: Number(req.query.file_id) } });
        }
        if (req.query.creator_id) {
            aggregateQuery.push({ $match: { creator_id: Number(req.query.creator_id) } });
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
                $match: {
                    slug_type: new RegExp(`${stringHandle(req.query.type, { createRegexQuery: true })}`, 'ig'),
                },
            });
        }
        if (req.query.property) {
            aggregateQuery.push({
                $match: {
                    slug_property: new RegExp(`${stringHandle(req.query.property, { createRegexQuery: true })}`, 'ig'),
                },
            });
        }
        if (req.query.action_name) {
            aggregateQuery.push({
                $match: {
                    slug_action_name: new RegExp(`${stringHandle(req.query.action_name, { createRegexQuery: true })}`, 'ig'),
                },
            });
        }
        if (req.query.file_name) {
            aggregateQuery.push({
                $match: {
                    slug_file_name: new RegExp(`${stringHandle(req.query.file_name, { createRegexQuery: true })}`, 'ig'),
                },
            });
        }
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Users',
                    localField: 'creator_id',
                    foreignField: 'user_id',
                    as: 'creator_info',
                },
            },
            { $unwind: { path: '$creator_info', preserveNullAndEmptyArrays: true } }
        );
        let countQuery = [...aggregateQuery];
        aggregateQuery.push({ $sort: { create_date: -1 } });
        let page = Number(req.query.page || 1);
        let page_size = Number(req.query.page_size || 50);
        aggregateQuery.push({ $skip: (page - 1) * page_size }, { $limit: page_size });
        let [actions, counts] = await Promise.all([
            client.db(req.user.database).collection(`FileHistories`).aggregate(aggregateQuery).toArray(),
            client
                .db(req.user.database)
                .collection(`FileHistories`)
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

module.exports._createFileHistory = async (req, res, next) => {
    try {
        let fileMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'FileHistories' });
        let fileId = (fileMaxId && fileMaxId.value) || 0;
        let _file = {
            file_id: ++fileId,
            type: req.body.type || 'IMPORT',
            property: req.body.property,
            action_name: req.body.action_name || '',
            file_name: req.body.file_name || '',
            links: req.body.links || [],
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            active: true,
            slug_type: stringHandle(req.body.type || '', { createSlug: true }),
            slug_property: stringHandle(req.body.property || '', { createSlug: true }),
            slug_action_name: stringHandle(req.body.action_name || '', { createSlug: true }),
            slug_file_name: stringHandle(req.body.file_name || '', { createSlug: true }),
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'FileHistories' }, { $set: { name: 'FileHistories', value: fileId } }, { upsert: true });
        let insert = await client.db(req.user.database).collection(`FileHistories`).insertOne(_file);
        if (!insert.insertedId) {
            throw new Error(`500: Ghi lịch sử xuất nhập file thất bại!`);
        }
        res.send({ success: true, data: _file });
    } catch (err) {
        next(err);
    }
};
