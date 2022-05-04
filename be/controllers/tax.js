const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const taxService = require(`../services/tax`);

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
        await taxService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toUpperCase();
        let tax = await client.db(req.user.database).collection(`Taxes`).findOne({
            name: req.body.name,
        });
        if (tax) {
            throw new Error(`400: Thuế đã tồn tại!`);
        }
        let tax_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Taxes' })
            .then((doc) => {
                if (doc) {
                    if (doc.value) {
                        return Number(doc.value);
                    }
                }
                return 0;
            });
        tax_id++;
        let _tax = {
            tax_id: tax_id,
            code: String(tax_id).padStart(6, '0'),
            name: req.body.name,
            value: Number(req.body.value),
            description: req.body.description || '',
            default: req.body.default || false,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(req.body.name, true).toLowerCase(),
        };
        if (_tax.default) {
            await client
                .db(req.user.database)
                .collection('Taxes')
                .updateMany({}, { $set: { default: false } });
        }
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Taxes' }, { $set: { name: 'Taxes', value: tax_id } }, { upsert: true });
        req[`body`] = _tax;
        await taxService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};
module.exports._update = async (req, res, next) => {
    try {
        req.params.tax_id = Number(req.params.tax_id);
        let tax = await client.db(req.user.database).collection(`Taxes`).findOne(req.params);
        if (!tax) {
            throw new Error(`400: Thuế không tồn tại!`);
        }
        if (req.body.name) {
            req.body.name = String(req.body.name).trim().toUpperCase();
            let check = await client
                .db(req.user.database)
                .collection(`Taxes`)
                .findOne({
                    tax_id: { $ne: tax.tax_id },
                    name: req.body.name,
                });
            if (check) {
                throw new Error(`400: Thuế đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.tax_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _tax = { ...tax, ...req.body };
        _tax = {
            tax_id: _tax.tax_id,
            code: _tax.code,
            name: _tax.name,
            value: Number(_tax.value),
            description: _tax.description || '',
            default: _tax.default || false,
            create_date: _tax.create_date,
            creator_id: _tax.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(_tax.name, true).toLowerCase(),
        };
        if (_tax.default) {
            await client
                .db(req.user.database)
                .collection('Taxes')
                .updateMany({}, { $set: { default: false } });
        }
        req['body'] = _tax;
        await taxService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Taxes`)
            .deleteMany({ tax_id: { $in: req.body.tax_id } });
        res.send({
            success: true,
            message: 'Xóa thuế thành công!',
        });
    } catch (err) {
        next(err);
    }
};
