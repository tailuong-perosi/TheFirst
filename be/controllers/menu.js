const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const SDB = process.env.DATABASE; // System Database

const menuService = require(`../services/menu`);

const bcrypt = require(`../libs/bcrypt`);
const { io } = require('../config/socket');

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
        await menuService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toLowerCase();
        let menu = await client
            .db(SDB)
            .collection('Menu')
            .findOne({
                $or: [{ name: req.body.name }],
            });
        if (menu) {
            throw new Error('400: Chức năng đã được sử dụng !');
        }
        let menu_id = await client
            .db(SDB)
            .collection('AppSetting')
            .findOne({ name: 'Menu' })
            .then((doc) => {
                if (doc) {
                    if (doc.value) {
                        return Number(doc.value);
                    }
                }
                return 0;
            });
        menu_id++;
        let _menu = {
            menu_id: menu_id,
            name: req.body.name,
            parent_menu_id: req.body.parent_menu_id,
            description: req.body.description,
            url: req.body.url,
            view_position: req.body.view_position,
            status: req.body.status,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            is_delete: false
        };
        await client
            .db(SDB)
            .collection('AppSetting')
            .updateOne({ name: 'Menu' }, { $set: { name: 'Menu', value: menu_id } }, { upsert: true });
        req[`body`] = _menu;
        await menuService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.menu_id = Number(req.params.menu_id);
        let menu = await client.db(SDB).collection('Menu').findOne(req.params);
        if (!menu) {
            throw new Error(`400: Chức năng không tồn tại!`);
        }
        delete req.body.menu_id;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _menu = { ...menu, ...req.body };
         _menu = {
            menu_id: _menu.menu_id,
            name: req.body.name,
            parent_menu_id: _menu.parent_menu_id,
            description: _menu.description,
            url: _menu.url,
            view_position: _menu.view_position,
            status: _menu.status,
            create_date: _menu.create_date,
            creator_id: _menu.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            is_delete: _menu.is_delete,
        };
        req['body'] = _menu;
        await menuService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(SDB)
            .collection(`Menu`)
            .deleteMany({ menu_id: { $in: req.body.menu_id } });
        //Resend
        res.send({
            success: true,
            message: 'Xóa người dùng thành công!',
        });
    } catch (err) {
        next(err);
    }
};
