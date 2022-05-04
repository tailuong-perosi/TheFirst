const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const SDB = process.env.DATABASE;
const { Branch } = require('../models/branch');
const branchService = require(`../services/branch`);
const ghn = require('../shipping/GHN');

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
        await branchService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        if (req.body.type != 'Warehouse' && req.body.type != 'Store') throw new Error('400: type không hợp lệ');
        req.body.name = String(req.body.name || '')
            .trim()
            .toUpperCase();
        req.body.email = String(req.body.email || '')
            .trim()
            .toLowerCase();

        let branch = await client.db(req.user.database).collection(`Branchs`).findOne({
            name: req.body.name,
        });

        if (branch) {
            throw new Error(`400: Chi nhánh đã tồn tại!`);
        }
        let branch_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Branchs' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }
                return 0;
            });
        let _branch = {
            branch_id: ++branch_id,
            code: String(branch_id).padStart(6, '0'),
            name: req.body.name,
            logo: req.body.logo || '',
            phone: req.body.phone || '',
            email: req.body.email || '',
            fax: req.body.fax || '',
            website: req.body.website || '',
            latitude: req.body.latitude || '',
            longitude: req.body.longitude || '',
            type: req.body.type,
            GHN_shop_id: req.body.GHN_shop_id || 0,
            address: req.body.address || '',
            ward: req.body.ward || '',
            district: req.body.district || '',
            province: req.body.province || '',
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(String(req.body.name), true).toLowerCase(),
            slug_type: removeUnicode(String(req.body.type || 'Store'), true).toLowerCase(),
            slug_address: removeUnicode(String(req.body.address), true).toLowerCase(),
            slug_ward: removeUnicode(String(req.body.ward), true).toLowerCase(),
            slug_district: removeUnicode(String(req.body.district), true).toLowerCase(),
            slug_province: removeUnicode(String(req.body.province), true).toLowerCase(),
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Branchs' }, { $set: { name: 'Branchs', value: branch_id } }, { upsert: true });
        req[`body`] = _branch;
        await branchService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.branch_id = Number(req.params.branch_id);

        let branch = await client.db(req.user.database).collection(`Branchs`).findOne(req.params);
        if (!branch) {
            throw new Error(`400: Chi nhánh không tồn tại!`);
        }
        if (req.body.name) {
            req.body.name = String(req.body.name).trim().toUpperCase();
            let check = await client
                .db(req.user.database)
                .collection(`Branchs`)
                .findOne({
                    branch_id: { $ne: req.params.branch_id },
                    name: req.body.name,
                });
            if (check) {
                throw new Error(`400: Tên chi nhánh đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.business_id;
        delete req.body.branch_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _branch = { ...branch, ...req.body };
        _branch = {
            business_id: _branch.business_id,
            branch_id: _branch.branch_id,
            code: _branch.code,
            name: _branch.name,
            logo: _branch.logo,
            phone: _branch.phone,
            email: _branch.email,
            fax: _branch.fax,
            website: _branch.website,
            latitude: _branch.latitude,
            longitude: _branch.longitude,
            type: _branch.type,
            GHN_shop_id: req.body.GHN_shop_id || 0,
            address: _branch.address,
            ward: _branch.ward,
            district: _branch.district,
            province: _branch.province,
            create_date: _branch.create_date,
            creator_id: _branch.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _branch.active,
            slug_name: removeUnicode(String(_branch.name || ''), true).toLowerCase(),
            slug_type: removeUnicode(String(_branch.type || ''), true).toLowerCase(),
            slug_address: removeUnicode(String(_branch.address || ''), true).toLowerCase(),
            slug_ward: removeUnicode(String(_branch.ward || ''), true).toLowerCase(),
            slug_district: removeUnicode(String(_branch.district || ''), true).toLowerCase(),
            slug_province: removeUnicode(String(_branch.province || ''), true).toLowerCase(),
        };
        if (req.body.connect_ghn) {
            let ward = await client.db(SDB).collection('Wards').findOne({ ward_name: _branch.ward });
            let setting = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'GHNToken' });
            let token =
                (setting && setting.value) ||
                (() => {
                    throw new Error(`400: GHN token chưa được cài đặt!`);
                })();
            _branch.GHN_shop_id = await ghn._createWarehouse(
                {
                    name: _branch.name,
                    phone: _branch.phone,
                    address: _branch.address,
                    ward_code: ward.ward_code,
                    district_id: ward.district_id,
                },
                token
            );
        }
        req[`body`] = _branch;
        await branchService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Branchs`)
            .deleteMany({ branch_id: { $in: req.body.branch_id } });
        res.send({
            success: true,
            message: 'Xóa chi nhánh thành công!',
        });
    } catch (err) {
        next(err);
    }
};
