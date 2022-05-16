const { truncateSync } = require("fs");
const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;
const permissionService = require('../services/Permission')
module.exports._get = async (req,res,next) => {
    try {
        await permissionService._get(req,res,next)
    } catch (error) {
        next(error);
    }
}

module.exports._create = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toUpperCase();
        let permission = await client.db(DB).collection(`Permission`).findOne({
            name: req.body.name,
        });
        if (permission) {
            throw new Error(`400: Vai trò đã tồn tại!`);
        }
        let permission_id = await client
            .db(DB)
            .collection('AppSetting')
            .findOne({ name: 'Permission' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }
                return 0;
            });
        permission_id++;
        let _permission = {
            permission_id: permission_id,
            name: req.body.name,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            is_active: true,
            change_active_at: moment().tz(TIMEZONE).format(),
            busines_id: req.user.busines_id
        }
        await client.db(DB).collection('Permission').updateOne(_permission)
    }
    catch(err){
        console.log(err);
    }
}

module.exports._update = async (req, res, next) => {
    try {
        req.params.permission_id = Number(req.params.permission_id);
        let permission = await client.db(DB).collection(`Permission`).findOne(req.params);
        if (!permission) {
            throw new Error(`400: Vai trò không tồn tại!`);
        }
        if (req.body.name) {
            req.body.name = String(req.body.name).trim().toUpperCase();
            let check = await client
                .db(DB)
                .collection(`Permission`)
                .findOne({
                    permission_id: { $ne: permission.permission_id },
                    name: req.body.name,
                });
            if (check) {
                throw new Error(`400: Vai trò đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.permission_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _permission = {...permission, ...req.body}
        _permission = {
            role_id: _permission.role_id,
            code: _permission.code,
            name: _permission.name,
            create_date: _permission.create_date,
            creator_id: _permission.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _permission.active,
            change_active_at: moment().tz(TIMEZONE).format(),
            busines_id: req.user.busines_id
        };
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(DB)
            .collection(`Permission`)
            .deleteMany({ permission_id: { $in: req.body.permission_id } });
        res.send({
            success: true,
            message: 'Xóa quyền thành công!',
        });
    } catch (err) {
        next(err);
    }
};