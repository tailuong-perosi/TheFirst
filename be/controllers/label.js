const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const labelService = require(`../services/label`);

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
        await labelService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toUpperCase();
        let label = await client.db(req.user.database).collection(`Labels`).findOne({
            name: req.body.name,
        });
        if (label) {
            throw new Error(`400: Nhóm cửa hàng đã tồn tại!`);
        }
        let label_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Labels' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }
                return 0;
            });
        label_id++;
        let _label = {
            label_id: label_id,
            code: String(label_id).padStart(6, '0'),
            name: req.body.name,
            description: req.body.description || '',
            default: req.body.default || false,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(name, true).toLowerCase(),
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Labels' }, { $set: { name: 'Labels', value: label_id } }, { upsert: true });
        req[`body`] = _label;
        await labelService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.label_id = Number(req.params.label_id);
        let label = await client.db(req.user.database).collection(`Labels`).findOne(req.params);
        if (!label) {
            throw new Error(`400: Nhóm cửa hàng không tồn tại!`);
        }
        if (req.body.name) {
            req.body.name = String(req.body.name).trim().toUpperCase();
            let check = await client
                .db(req.user.database)
                .collection(`Labels`)
                .findOne({
                    label_id: { $ne: label.label_id },
                    name: req.body.name,
                });
            if (check) {
                throw new Error(`400: Nhóm cửa hàng đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.label_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _label = { ...label, ...req.body };
        _label = {
            label_id: _label.label_id,
            code: _label.code,
            name: _label.name,
            description: _label.description,
            default: _label.default || false,
            create_date: _label.create_date,
            creator_id: _label.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(_label.name, true).toLowerCase(),
        };
        req['body'] = _label;
        await labelService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Labels`)
            .deleteMany({ label_id: { $in: req.body.label_id } });
        res.send({
            success: true,
            message: 'Xóa nhóm cửa hàng thành công!',
        });
    } catch (err) {
        next(err);
    }
};
