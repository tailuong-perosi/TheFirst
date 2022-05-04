const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const SDB = process.env.DATABASE; // System Database

const userService = require(`../services/user`);

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
        await userService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        req.body.username = String(req.body.username).trim().toLowerCase();
        req.body.password = bcrypt.hash(req.body.password);
        let user = await client
            .db(req.user.database)
            .collection('Users')
            .findOne({
                $or: [{ username: req.body.username }],
            });
        if (user) {
            throw new Error('400: Username hoặc Email đã được sử dụng!');
        }
        let user_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Users' })
            .then((doc) => {
                if (doc) {
                    if (doc.value) {
                        return Number(doc.value);
                    }
                }
                return 0;
            });
        user_id++;
        let _user = {
            user_id: user_id,
            code: String(user_id).padStart(6, '0'),
            business_id: req.user.business_id,
            username: req.body.username,
            password: req.body.password,
            role_id: req.body.role_id,
            email: req.body.email,
            phone: req.body.phone,
            avatar: req.body.avatar,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            name: req.body.first_name || '' + req.body.last_name || '',
            birth_day: req.body.birth_day,
            address: req.body.address,
            district: req.body.district,
            province: req.body.province,
            branch_id: req.body.branch_id,
            store_id: req.body.store_id,
            last_login: moment().tz(TIMEZONE).format(),
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(`${req.body.first_name}${req.body.last_name}`, true).toLowerCase(),
            slug_address: removeUnicode(`${req.body.address}`, true).toLowerCase(),
            slug_district: removeUnicode(`${req.body.district}`, true).toLowerCase(),
            slug_province: removeUnicode(`${req.body.province}`, true).toLowerCase(),
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Users' }, { $set: { name: 'Users', value: user_id } }, { upsert: true });
        req[`body`] = _user;
        await userService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.user_id = Number(req.params.user_id);
        let user = await client.db(req.user.database).collection('Users').findOne(req.params);
        if (!user) {
            throw new Error(`400: Người dùng không tồn tại!`);
        }
        delete req.body._id;
        delete req.body.user_id;
        delete req.body.code;
        delete req.body.username;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _user = { ...user, ...req.body };
        _user = {
            user_id: _user.user_id,
            code: _user.code,
            username: _user.username,
            password: _user.password,
            role_id: _user.role_id,
            email: _user.email,
            phone: _user.phone,
            avatar: _user.avatar,
            first_name: _user.first_name,
            last_name: _user.last_name,
            birth_day: _user.birth_day,
            address: _user.address,
            district: _user.district,
            province: _user.province,
            branch_id: _user.branch_id,
            store_id: _user.store_id,
            last_login: _user.last_login,
            create_date: _user.create_date,
            creator_id: _user.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _user.active,
            slug_name: removeUnicode(`${req.body.first_name}${req.body.last_name}`, true).toLowerCase(),
            slug_address: removeUnicode(`${req.body.address}`, true).toLowerCase(),
            slug_district: removeUnicode(`${req.body.district}`, true).toLowerCase(),
            slug_province: removeUnicode(`${req.body.province}`, true).toLowerCase(),
        };
        req['body'] = _user;
        await userService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Users`)
            .deleteMany({ user_id: { $in: req.body.user_id } });
        io.emit('delete_staff', req.user._business.prefix + '#' + req.body.user_id[0]);

        //Resend
        setTimeout(() => {
            io.emit('delete_staff', req.user._business.prefix + '#' + req.body.user_id[0]);
        }, 2000);
        res.send({
            success: true,
            message: 'Xóa người dùng thành công!',
        });
    } catch (err) {
        next(err);
    }
};
