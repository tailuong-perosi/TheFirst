const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const tableService = require(`../services/table`);

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
        await tableService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toUpperCase();
        req.body.position = String(req.body.position).trim().toUpperCase();
        let table = await client.db(req.user.database).collection(`Tables`).findOne({
            store_id: req.body.store_id,
            position: req.body.position,
            name: req.body.name,
        });
        if (table) {
            throw new Error(`400: Bàn tại vị trí này đã tồn tại!`);
        }
        let table_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Tables' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }
                return 0;
            });
        table_id++;
        let _table = {
            table_id: table_id,
            code: String(table_id).padStart(6, '0'),
            store_id: Number(req.body.store_id),
            position: String(req.body.position),
            name: req.body.name,
            limit_people: Number(req.body.limit_people) || 10,
            current_people: Number(req.body.current_people) || 0,
            current_payment: Number(req.body.current_payment) || 0,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_position: removeUnicode(req.body.position, true).toLowerCase(),
            slug_name: removeUnicode(req.body.name, true).toLowerCase(),
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Tables' }, { $set: { name: 'Tables', value: table_id } }, { upsert: true });
        req[`body`] = _table;
        await tableService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};
module.exports._update = async (req, res, next) => {
    try {
        req.params.table_id = Number(req.params.table_id);
        if (req.body.position) {
            req.body.position = String(req.body.position).trim().toUpperCase();
        }
        let table = await client.db(req.user.database).collection(`Tables`).findOne(req.params);
        if (!table) {
            throw new Error(`400: Bàn không tồn tại!`);
        }
        if (req.body.name) {
            req.body.name = String(req.body.name).trim().toUpperCase();
            let check = await client
                .db(req.user.database)
                .collection(`Tables`)
                .findOne({
                    table_id: { $ne: Number(table.table_id) },
                    store_id: table.store_id,
                    position: String(req.body.position || table.position),
                    name: req.body.name,
                });
            if (check) {
                throw new Error(`400: Bàn tại vị trí này đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.table_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _table = { ...table, ...req.body };
        _table = {
            table_id: _table.table_id,
            code: _table.code,
            store_id: _table.store_id,
            position: _table.position,
            name: _table.name,
            limit_people: Number(_table.limit_people) || 10,
            current_people: Number(_table.current_people) || 0,
            current_payment: Number(_table.current_payment) || 0,
            create_date: _table.create_date,
            creator_id: _table.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _table.active,
            slug_position: removeUnicode(_table.position, true).toLowerCase(),
            slug_name: removeUnicode(_table.name, true).toLowerCase(),
        };
        req['body'] = _table;
        await tableService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Tables`)
            .deleteMany({ table_id: { $in: req.body.table_id } });
        res.send({
            success: true,
            message: 'Xóa bàn thành công!',
        });
    } catch (err) {
        next(err);
    }
};
