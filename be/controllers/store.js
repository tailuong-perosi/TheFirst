const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const storeService = require(`../services/store`);

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
        await storeService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toUpperCase();
        let store = await client.db(req.user.database).collection(`Stores`).findOne({
            name: req.body.name,
        });
        if (store) {
            throw new Error(`400: Cửa hàng đã tồn tại!`);
        }
        let store_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Stores' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }
                return 0;
            });
        store_id++;
        let _store = {
            store_id: store_id,
            code: String(store_id).padStart(6, '0'),
            name: req.body.name,
            branch_id: req.body.branch_id || '',
            label_id: req.body.label_id || '',
            logo: req.body.logo || '',
            phone: String(req.body.phone) || '',
            latitude: String(req.body.latitude) || '',
            longitude: String(req.body.longitude) || '',
            address: String(req.body.address) || '',
            district: String(req.body.district) || '',
            province: String(req.body.province) || '',
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(req.body.name, true).toLowerCase(),
            slug_address: removeUnicode(req.body.address, true).toLowerCase(),
            slug_district: removeUnicode(req.body.district, true).toLowerCase(),
            slug_province: removeUnicode(req.body.province, true).toLowerCase(),
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Stores' }, { $set: { name: 'Stores', value: store_id } }, { upsert: true });
        req[`body`] = _store;
        await storeService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.store_id = Number(req.params.store_id);
        let store = await client.db(req.user.database).collection(`Stores`).findOne(req.params);
        if (!store) {
            throw new Error(`400: Cửa hàng không tồn tại!`);
        }
        if (req.body.name) {
            req.body.name = String(req.body.name).trim().toUpperCase();
            let check = await client
                .db(req.user.database)
                .collection(`Stores`)
                .findOne({
                    store_id: { $ne: store.store_id },
                    name: req.body.name,
                });
            if (check) {
                throw new Error(`400: Cửa hàng đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.store_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _store = { ...store, ...req.body };
        _store = {
            store_id: _storestore_id,
            code: _store.code,
            name: _store.name,
            branch_id: _store.branch_id || '',
            label_id: _store.label_id || '',
            logo: _store.logo || '',
            phone: String(_store.phone) || '',
            latitude: String(_store.latitude) || '',
            longitude: String(_store.longitude) || '',
            address: String(_store.address) || '',
            district: String(_store.district) || '',
            province: String(_store.province) || '',
            create_date: _store.create_date,
            creator_id: _store.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(_store.name, true).toLowerCase(),
            slug_address: removeUnicode(_store.address, true).toLowerCase(),
            slug_district: removeUnicode(_store.district, true).toLowerCase(),
            slug_province: removeUnicode(_store.province, true).toLowerCase(),
        };
        req['body'] = _store;
        await storeService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Stores`)
            .deleteMany({ store_id: { $in: req.body.store_id } });
        res.send({
            success: true,
            message: 'Xóa cửa hàng thành công!',
        });
    } catch (err) {
        next(err);
    }
};
