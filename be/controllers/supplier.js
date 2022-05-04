const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const supplierService = require(`../services/supplier`);

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
        await supplierService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toUpperCase();
        let supplier = await client.db(req.user.database).collection(`Suppliers`).findOne({
            name: req.body.name,
        });
        if (supplier) {
            throw new Error(`400: Nhà cung cấp đã tồn tại!`);
        }
        let supplier_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Suppliers' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }
                return 0;
            });
        supplier_id++;
        let _supplier = {
            supplier_id: supplier_id,
            code: String(supplier_id).padStart(6, '0'),
            name: req.body.name,
            logo: req.body.logo || '',
            phone: req.body.phone || '',
            email: req.body.email || '',
            address: req.body.address || '',
            district: req.body.district || '',
            province: req.body.province || '',
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(String(req.body.name), true).toLowerCase(),
            slug_address: removeUnicode(String(req.body.address), true).toLowerCase(),
            slug_district: removeUnicode(String(req.body.district), true).toLowerCase(),
            slug_province: removeUnicode(String(req.body.province), true).toLowerCase(),
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Suppliers' }, { $set: { name: 'Suppliers', value: supplier_id } }, { upsert: true });
        req[`body`] = _supplier;
        await supplierService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.supplier_id = Number(req.params.supplier_id);
        let supplier = await client.db(req.user.database).collection(`Suppliers`).findOne(req.params);
        if (!supplier) {
            throw new Error(`400: Nhà cung cấp không tồn tại!`);
        }
        if (req.body.name) {
            req.body.name = String(req.body.name).trim().toUpperCase();
            let check = await client
                .db(req.user.database)
                .collection(`Suppliers`)
                .findOne({
                    supplier_id: { $ne: supplier.supplier_id },
                    name: req.body.name,
                });
            if (check) {
                throw new Error(`400: Nhà cung cấp đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.supplier_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _supplier = { ...supplier, ...req.body };
        _supplier = {
            supplier_id: _supplier.supplier_id,
            code: _supplier.code,
            name: _supplier.name,
            logo: _supplier.logo || '',
            phone: _supplier.phone || '',
            email: _supplier.email || '',
            address: _supplier.address || '',
            district: _supplier.district || '',
            province: _supplier.province || '',
            create_date: _supplier.create_date,
            creator_id: _supplier.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _supplier.active,
            slug_name: removeUnicode(String(_supplier.name), true).toLowerCase(),
            slug_address: removeUnicode(String(_supplier.address), true).toLowerCase(),
            slug_district: removeUnicode(String(_supplier.district), true).toLowerCase(),
            slug_province: removeUnicode(String(_supplier.province), true).toLowerCase(),
        };
        req['_update'] = _supplier;
        await supplierService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Suppliers`)
            .deleteMany({ supplier_id: { $in: req.body.supplier_id } });
        res.send({
            success: true,
            message: 'Xóa nhà cung cấp thành công!',
        });
    } catch (err) {
        next(err);
    }
};
