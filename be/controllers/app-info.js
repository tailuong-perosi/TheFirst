const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const { stringHandle } = require('../utils/string-handle');
const SDB = process.env.DATABASE;

module.exports._checkDomain = async (req, res, next) => {
    try {
        ['prefix'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        let domain = await client
            .db(SDB)
            .collection('Business')
            .findOne({
                prefix: new RegExp(stringHandle(req.body.prefix, { removeUnicode: true, removeSpace: true }), 'gi'),
            });
        if (!domain) {
            res.status(400).send({ success: false });
            return;
        }
        res.send({ success: true });
    } catch (err) {
        next(err);
    }
};

module.exports._getAppInfo = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        aggregateQuery.push({ $match: { name: 'AppInfo' } });
        let [appInfo] = await client.db(req.user.database).collection('AppSetting').aggregate(aggregateQuery).toArray();
        res.send({ success: true, data: appInfo });
    } catch (err) {
        next(err);
    }
};

module.exports._updateAppInfo = async (req, res, next) => {
    try {
        delete req.body.name;
        await client.db(req.user.database).collection('AppSetting').updateOne({ name: 'AppInfo' }, { $set: req.body });
        res.send({ success: true, message: 'Cập nhật thông tin thành công!', data: req.body });
    } catch (err) {
        next(err);
    }
};

module.exports.setupMenuC = async (req, res, next) => {
    try {
        await client
            .db(SDB)
            .collection('AppSetting')
            .updateOne(
                {
                    name: 'Menus',
                },
                {
                    $set: {
                        lists: req.body,
                    },
                }
            );

        return res.send({ success: true, message: 'Setup done' });
    } catch (err) {
        next(err);
    }
};

module.exports._addGHNToken = async (req, res, next) => {
    try {
        if (!req.body.ghn_token) {
            throw new Error(`400: Missing field ghn_token!`);
        }
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'GHNToken' }, { $set: { name: 'GHNToken', value: req.body.ghn_token } }, { upsert: true });
        res.send({ success: true, data: req.body });
    } catch (err) {
        next(err);
    }
};
