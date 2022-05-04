const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;
const XLSX = require('xlsx');
const shippingCompanyService = require(`../services/shipping-company`);

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
    text = new String(text).toLowerCase();
    return text;
};

const validate = (current, fields) => {
    var object = {};
    Object.keys(current).map((cur) => {
        if (fields.includes(cur) == true && current[cur] != undefined) {
            object[cur] = current[cur];
        }
    });
    return Object.keys(object).length == fields.length ? object : false;
};

let convertToSlug = (text) => {
    /*
        string là chuỗi cần remove unicode
        trả về chuỗi ko dấu tiếng việt ko khoảng trắng
    */
    if (typeof text != 'string') {
        return '';
    }

    text = text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
    text = text.replace(/\s/g, '_');

    text = new String(text).toLowerCase();
    return text;
};

module.exports._get = async (req, res, next) => {
    try {
        await shippingCompanyService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toUpperCase();
        let shippingCompany = await client.db(req.user.database).collection(`ShippingCompanies`).findOne({
            name: req.body.name,
        });
        if (shippingCompany) {
            throw new Error(`400: Đối tác vận chuyển đã tồn tại!`);
        }
        let shipping_company_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'ShippingCompanies' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }

                return 0;
            });
        shipping_company_id++;
        let _shippingCompany = {
            shipping_company_id: shipping_company_id,
            code: String(shipping_company_id).padStart(6, '0'),
            name: req.body.name,
            image: req.body.image || '',
            phone: req.body.phone || '',
            zipcode: req.body.zipcode || '',
            address: req.body.address || '',
            district: req.body.district || '',
            province: req.body.province || '',
            default: req.body.default || false,
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
        if (_shippingCompany.default) {
            await client
                .db(req.user.database)
                .collection('Taxes')
                .updateMany({}, { $set: { default: false } });
        }
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne(
                { name: 'ShippingCompanies' },
                { $set: { name: 'ShippingCompanies', value: shipping_company_id } },
                { upsert: true }
            );
        req[`body`] = _shippingCompany;
        await shippingCompanyService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};
module.exports._update = async (req, res, next) => {
    try {
        req.params.shipping_company_id = Number(req.params.shipping_company_id);
        let shippingCompany = await client.db(req.user.database).collection(`ShippingCompanies`).findOne(req.params);
        if (!shippingCompany) {
            throw new Error(`400: Đối tác vận chuyển không tồn tại!`);
        }
        if (req.body.name) {
            req.body.name = String(req.body.name).trim().toUpperCase();
            let check = await client
                .db(req.user.database)
                .collection(`ShippingCompanies`)
                .findOne({
                    shipping_company_id: { $ne: shippingCompany.shipping_company_id },
                    name: req.body.name,
                });
            if (check) {
                throw new Error(`400: Đối tác vận chuyển đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.shipping_company_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _shippingCompany = { ...shippingCompany, ...req.body };
        _shippingCompany = {
            shipping_company_id: _shippingCompany.shipping_company_id,
            code: _shippingCompany.code,
            name: _shippingCompany.name,
            image: _shippingCompany.image || '',
            phone: _shippingCompany.phone || '',
            zipcode: _shippingCompany.zipcode || '',
            address: _shippingCompany.address || '',
            district: _shippingCompany.district || '',
            province: _shippingCompany.province || '',
            default: _shippingCompany.default || false,
            create_date: _shippingCompany.create_date,
            creator_id: _shippingCompany.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _shippingCompany.active,
            slug_name: removeUnicode(_shippingCompany.name, true).toLowerCase(),
            slug_address: removeUnicode(_shippingCompany.address, true).toLowerCase(),
            slug_district: removeUnicode(_shippingCompany.district, true).toLowerCase(),
            slug_province: removeUnicode(_shippingCompany.province, true).toLowerCase(),
        };
        if (_shippingCompany.default) {
            await client
                .db(req.user.database)
                .collection('Taxes')
                .updateMany({}, { $set: { default: false } });
        }
        req['_update'] = _shippingCompany;
        await shippingCompanyService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`ShippingCompanies`)
            .deleteMany({
                shipping_company_id: { $in: req.body.shipping_company_id },
            });
        res.send({
            success: true,
            message: 'Xóa đơn vị vận chuyển thành công!',
        });
    } catch (err) {
        next(err);
    }
};

module.exports._createCompareCard = async (req, res, next) => {};

module.exports._importCompareCard = async (req, res, next) => {
    try {
        if (req.file == undefined) {
            throw new Error('400: Vui lòng truyền file!');
        }

        await shippingCompanyService._importCompareCard(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._getCompareCard = async (req, res, next) => {
    try {
        await shippingCompanyService._getCompareCard(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._updateCompareCard = async (req, res, next) => {};
