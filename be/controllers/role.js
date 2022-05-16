const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const roleService = require(`../services/role`);

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
        await roleService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toUpperCase();
        let role = await client.db(req.user.database).collection(`Roles`).findOne({
            name: req.body.name,
        });
        if (role) {
            throw new Error(`400: Vai trò đã tồn tại!`);
        }
        let role_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Roles' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }
                return 0;
            });
        role_id++;
        let _role = {
            role_id: role_id,
            code: String(role_id).padStart(6, '0'),
            name: req.body.name,
            permission_list: req.body.permission_list || [],
            menu_list: req.body.menu_list || [],
            default: req.body.default || false,
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
            .updateOne({ name: 'Roles' }, { $set: { name: 'Roles', value: role_id } }, { upsert: true });
        req[`body`] = _role;
        await roleService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};
module.exports._update = async (req, res, next) => {
    try {
        req.params.role_id = Number(req.params.role_id);
        let role = await client.db(req.user.database).collection(`Roles`).findOne(req.params);
        if (!role) {
            throw new Error(`400: Vai trò không tồn tại!`);
        }
        if (req.body.name) {
            req.body.name = String(req.body.name).trim().toUpperCase();
            let check = await client
                .db(req.user.database)
                .collection(`Roles`)
                .findOne({
                    role_id: { $ne: role.role_id },
                    name: req.body.name,
                });
            if (check) {
                throw new Error(`400: Vai trò đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.role_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _role = { ...role, ...req.body };
        _role = {
            role_id: _role.role_id,
            code: _role.code,
            name: _role.name,
            permission_list: _role.permission_list || [],
            menu_list: _role.menu_list || [],
            default: _role.default || false,
            create_date: _role.create_date,
            creator_id: _role.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _role.active,
            slug_name: removeUnicode(_role.name, true).toLowerCase(),
        };
        req['body'] = _role;
        await roleService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Roles`)
            .deleteMany({ role_id: { $in: req.body.role_id } });
        res.send({
            success: true,
            message: 'Xóa vai trò thành công!',
        });
    } catch (err) {
        next(err);
    }
};

module.exports._AddRole = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toUpperCase();
        let role = await client.db(DB).collection(`Roles`).findOne({
            name: req.body.name,
        });
        if (role) {
            throw new Error(`400: Vai trò đã tồn tại!`);
        }
        let role_id = await client
            .db(DB)
            .collection('AppSetting')
            .findOne({ name: 'Roles' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }
                return 0;
            });
        role_id++;
        let _role = {
            role_id: role_id,
            name: req.body.name,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            busines_id: req.user.busines_id
        }
        await client.db(DB).collection('Roles').updateOne(_role)
    }
    catch(err){
        console.log(err);
    }
}