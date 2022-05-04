const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const paymentService = require(`../services/payment`);

let removeUnicode = (text, removeSpace) => {
    /*
        string là chuỗi cần remove unicode
        trả về chuỗi ko dấu tiếng việt ko khoảng trắng
    */
    if (typeof text != 'string') {
        throw new Error('Type of text input must be string!');
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
        await paymentService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        ['name'].map((properties) => {
            if (req.body[properties] == undefined) {
                throw new Error(`400: Thiếu thuộc tính ${properties}!`);
            }
        });
        req.body.name = String(req.body.name || '')
            .trim()
            .toUpperCase();
        let payment = await client
            .db(req.user.database)
            .collection('PaymentMethods')
            .findOne({ business_id: req.user.business_id, name: req.body.name });
        if (payment) {
            throw new Error(`400: Phương thức thanh toán đã tồn tại!`);
        }
        let payment_method_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'PaymentMethods' })
            .then((doc) => {
                if (doc && doc.value) {
                    return doc.value;
                }
                return 0;
            });
        payment_method_id++;
        let _paymentMethod = {
            business_id: req.user.business_id,
            payment_method_id: Number(payment_method_id),
            code: String(payment_method_id).padStart(6, '0'),
            name: req.body.name,
            slug_name: removeUnicode(String(req.body.name), true),
            images: req.body.images || [],
            default: req.body.default || false,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
        };
        if (_paymentMethod.default == true) {
            await client
                .db(req.user.database)
                .collection('PaymentMethods')
                .updateMany({}, { $set: { default: false } });
        }
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'PaymentMethods' }, { $set: { name: 'PaymentMethods', value: payment_method_id } }, { upsert: true });
        req[`body`] = _paymentMethod;
        await paymentService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};
module.exports._update = async (req, res, next) => {
    try {
        req.params.payment_method_id = Number(req.params.payment_method_id);
        let paymentMethod = await client.db(req.user.database).collection(`PaymentMethods`).findOne(req.params);
        if (!paymentMethod) {
            throw new Error(`400: Phương thức thanh toán không tồn tại!`);
        }
        delete req.body._id;
        delete req.body.payment_method_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _paymentMethod = { ...paymentMethod, ...req.body };
        _paymentMethod = {
            business_id: _paymentMethod.business_id,
            payment_method_id: Number(_paymentMethod.payment_method_id),
            code: Number(_paymentMethod.code),
            name: String(_paymentMethod.name).toUpperCase(),
            slug_name: removeUnicode(String(_paymentMethod.name), true).toLowerCase(),
            images: _paymentMethod.images,
            default: _paymentMethod.default,
            create_date: _paymentMethod.create_date,
            creator_id: Number(_paymentMethod.user_id),
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _paymentMethod.active,
        };
        let exists = await client
            .db(req.user.database)
            .collection(`PaymentMethods`)
            .findOne({
                business_id: req.user.business_id,
                payment_method_id: { $ne: _paymentMethod.payment_method_id },
                name: _paymentMethod.name,
            });
        if (exists) {
            throw new Error(`400: Phương thức thanh toán đã tồn tại!`);
        }
        if (_paymentMethod.default == true) {
            await client
                .db(req.user.database)
                .collection('PaymentMethods')
                .updateMany({}, { $set: { default: false } });
        }
        req['body'] = _paymentMethod;
        await paymentService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        let _delete = [];
        let isDefault = false;
        for (let i in req.body.payment_method_id) {
            if (req.body.payment_method_id[i] > 0) {
                _delete.push(req.body.payment_method_id[i]);
            } else {
                isDefault = true;
            }
        }
        await client
            .db(req.user.database)
            .collection('PaymentMethods')
            .deleteMany({ payment_method_id: { $in: _delete } });
        if (isDefault) {
            res.send({ success: false, data: 'Không thể xóa phương thức mặc định của hệ thống!' });
        } else {
            res.send({ success: true, data: 'Xóa phương thức thanh toán thành công!' });
        }
    } catch (err) {
        next(err);
    }
};
