const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const toppingService = require(`../services/topping`);

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
        await toppingService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toUpperCase();
        let topping = await client.db(req.user.database).collection(`Toppings`).findOne({
            name: req.body.name,
        });
        if (topping) {
            throw new Error(`400: Topping đã tồn tại!`);
        }
        let topping_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Toppings' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }

                return 0;
            });
        topping_id++;
        let _topping = {
            topping_id: topping_id,
            code: String(topping_id).padStart(6, '0'),
            name: req.body.name,
            category_id: Number(req.body.category_id),
            price: req.body.price || 0,
            limit: req.body.limit || 10,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(req.body.name, true).toLowerCase(),
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Toppings' }, { $set: { name: 'Toppings', value: topping_id } }, { upsert: true });
        req[`body`] = _topping;
        await toppingService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};
module.exports._update = async (req, res, next) => {
    try {
        req.params.topping_id = Number(req.params.topping_id);
        let topping = await client.db(req.user.database).collection(`Toppings`).findOne(req.params);
        if (!topping) {
            throw new Error(`400: Topping không tồn tại!`);
        }
        if (req.body.name) {
            req.body.name = String(req.body.name).trim().toUpperCase();
            let check = await client
                .db(req.user.database)
                .collection(`Toppings`)
                .findOne({
                    topping_id: { $ne: topping.topping_id },
                    name: req.body.name,
                });
            if (check) {
                throw new Error(`400: Topping đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.topping_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _topping = { ...topping, ...req.body };
        _topping = {
            topping_id: _topping.topping_id,
            code: _topping.code,
            name: _topping.name,
            category_id: Number(_topping.category_id),
            price: _topping.price || 0,
            limit: _topping.limit || 10,
            create_date: _topping.create_date,
            creator_id: _topping.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _topping.active,
            slug_name: removeUnicode(_topping.name, true).toLowerCase(),
        };
        req['body'] = _topping;
        await toppingService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Toppings`)
            .deleteMany({ topping_id: { $in: req.body.topping_id } });
        res.send({
            success: true,
            message: 'Xóa topping thành công!',
        });
    } catch (err) {
        next(err);
    }
};
