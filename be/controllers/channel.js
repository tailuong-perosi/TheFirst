const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const channelService = require(`../services/channel`);

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

let checkPlatform = async (name, url, clientId, secretKey) => {
    //kiểm tra kết nối với các nền tảng khác nhau dựa theo tên, id, key
    let result = Math.floor(Math.random() * 1000) % 2;
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (result == 1) {
                resolve('WORKING');
            } else {
                reject('NOT WORKING');
            }
        }, 2000);
    });
};

module.exports._get = async (req, res, next) => {
    try {
        await channelService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        ['name', 'url', 'platform_id', 'client_id', 'secret_key'].map((properties) => {
            if (req.body[properties] == undefined) {
                throw new Error(`400: Thiếu thuộc tính ${properties}!`);
            }
        });
        let channel_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Channels' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }

                return 0;
            });
        channel_id++;
        let status = await checkPlatform(req.body.name, req.body.url, req.body.client_id, req.body.secret_key).catch(
            (err) => {
                throw new Error(err);
            }
        );
        let _channel = {
            channel_id: Number(channel_id),
            code: String(channel_id).padStart(6, '0'),
            name: req.body.name,

            url: req.body.url,
            platform_id: req.body.platform_id,
            client_id: req.body.client_id,
            secret_key: req.body.secret_key,
            status: status,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(String(req.body.name), true).toLowerCase(),
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Channels' }, { $set: { name: 'Channels', value: channel_id } }, { upsert: true });
        req[`body`] = _channel;
        await channelService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};
module.exports._update = async (req, res, next) => {
    try {
        req.params.channel_id = Number(req.params.channel_id);
        let site = await client.db(req.user.database).collection(`Channels`).findOne(req.params);
        if (!site) {
            throw new Error(`400: Kênh không tồn tại!`);
        }
        delete req.body._id;
        delete req.body.channel_id;
        delete req.body.code;
        delete req.body.status;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _channel = { ...site, ...req.body };
        let status = await checkPlatform(_channel.name, _channel.url, _channel.client_id, _channel.secret_key).catch(
            (err) => {
                throw err;
            }
        );
        _channel = {
            channel_id: Nuber(_channel.channel_id),
            code: _channel.code,
            name: _channel.name,
            url: req.body.url,
            platform: _channel.platform,
            client_id: _channel.client_id,
            secret_key: _channel.secret_key,
            status: status,
            create_date: _channel.create_date,
            creator_id: _channel.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _channel.active,
            slug_name: removeUnicode(String(_channel.name), true).toLowerCase(),
        };
        req['_update'] = _channel;
        await channelService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection('Channels')
            .deleteMany({ channel_id: { $in: req.body.channel_id } });
        res.send({ success: true, data: 'Xóa kênh thành công!' });
    } catch (err) {
        next(err);
    }
};

module.exports._getPlatform = async (req, res, next) => {
    try {
        await channelService._getPlatform(req, res, next);
    } catch (err) {
        next(err);
        s;
    }
};
