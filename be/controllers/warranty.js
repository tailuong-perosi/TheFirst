const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const warrantyService = require(`../services/warranty`);

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
        await warrantyService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toUpperCase();
        let warranty = await client.db(req.user.database).collection(`Warranties`).findOne({
            name: req.body.name,
        });
        if (warranty) {
            throw new Error(`400: Chương trình bảo hành đã tồn tại!`);
        }
        let warranty_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Warranties' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }
                return 0;
            });
        warranty_id++;
        let _warranty = {
            warranty_id: warranty_id,
            code: String(warranty_id).padStart(6, '0'),
            name: req.body.name,
            type: String(req.body.type || ''),
            time: Number(req.body.time || 0),
            description: req.body.description || '',
            default: req.body.default || false,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            sub_name: removeUnicode(req.body.name, true).toLowerCase(),
            sub_type: removeUnicode(req.body.type, true).toLowerCase(),
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Warranties' }, { $set: { name: 'Warranties', value: warranty_id } }, { upsert: true });
        req[`body`] = _warranty;
        await warrantyService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};
module.exports._update = async (req, res, next) => {
    try {
        req.params.warranty_id = Number(req.params.warranty_id);
        let warranty = await client.db(req.user.database).collection(`Warranties`).findOne(req.params);
        if (!warranty) {
            throw new Error(`400: Chương trình bảo hành không tồn tại!`);
        }
        if (req.body.name) {
            req.body.name = String(req.body.name).trim().toUpperCase();
            let check = await client
                .db(req.user.database)
                .collection(`Warranties`)
                .findOne({
                    warranty_id: { $ne: warranty.warranty_id },
                    name: req.body.name,
                });
            if (check) {
                throw new Error(`400: Chương trình bảo hành đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.warranty_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _warranty = { ...warranty, ...req.body };
        _warranty = {
            warranty_id: _warranty.warranty_id,
            code: _warranty.code,
            name: _warranty.name,
            type: String(_warranty.type || ''),
            time: Number(_warranty.time || 0),
            description: _warranty.description || '',
            default: _warranty.default || false,
            create_date: _warranty.create_date,
            creator_id: _warranty.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _warranty.active,
            sub_name: removeUnicode(_warranty.name, true).toLowerCase(),
            sub_type: removeUnicode(_warranty.type, true).toLowerCase(),
        };
        req['body'] = _warranty;
        await warrantyService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Warranties`)
            .deleteMany({ warranty_id: { $in: req.body.warranty_id } });
        res.send({
            success: true,
            message: 'Xóa chương trình bảo hành thành công!',
        });
    } catch (err) {
        next(err);
    }
};
