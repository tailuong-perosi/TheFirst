const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const customerService = require(`../services/customer`);

const XLSX = require('xlsx');
const { createTimeline } = require('../utils/date-handle');
const { hardValidate } = require('../utils/validate');

let convertToSlug = (text) => {
    /*
          string là chuỗi cần remove unicode
          trả về chuỗi ko dấu tiếng việt ko khoảng trắng
      */
    if (typeof text != 'string') {
        return '';
    }

    text = text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
    text = text.replace(/\s/g, '_');

    text = new String(text).toLowerCase();
    return text;
};

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
        await customerService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        let customer = await client.db(req.user.database).collection(`Customers`).findOne({
            phone: req.body.phone,
        });
        if (customer) {
            throw new Error(`400: Số điện thoại đã tồn tại!`);
        }
        // if (req.body.address == undefined || req.body.address == '')
        //     throw new Error(`400: Không được để trống địa chỉ!`);
        // if (req.body.ward == undefined || req.body.ward == '') throw new Error(`400: Không được để trống phường/xã!`);

        // if (req.body.province == undefined || req.body.province == '')
        //     throw new Error(`400: Không được để trống tỉnh/thành phố!`);

        // if (req.body.district == undefined || req.body.district == '')
        //     throw new Error(`400: Không được để trống quận/huyện!`);

        // if (req.body.ward_code == undefined || req.body.province_id == undefined || req.body.district_id == undefined)
        //     throw new Error(`400: Vui lòng truyền đầy đủ ward_code, province_id và district_id!`);

        let customer_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Customers' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }

                return 0;
            });
        req.body.last_name = req.body.last_name || '';
        req.body.first_name = req.body.first_name || '';

        customer_id++;
        let _customer = {
            customer_id: customer_id,
            code: String(customer_id).padStart(6, '0'),
            phone: String(req.body.phone),
            type_id: req.body.type_id || 1,
            email: req.body.email || '',
            first_name: req.body.first_name.trim(),
            last_name: req.body.last_name.trim(),
            gender: req.body.gender || '',
            birthday: req.body.birthday || '',
            address: req.body.address || '',
            district: req.body.district || '',
            ward: req.body.ward || '',
            province: req.body.province || '',
            district_id: parseInt(req.body.district_id),
            ward_code: req.body.ward_code + '',
            province_id: parseInt(req.body.province_id),
            balance: req.body.balance || {
                available: 0,
                debt: 0,
                freezing: 0,
            },
            point: req.body.point,
            used_point: req.body.used_point,
            order_quantity: req.body.order_quantity,
            order_total_cost: req.body.order_total_cost,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(String(req.body.first_name + ' ' + req.body.last_name), true).toLowerCase(),
            slug_type: removeUnicode(String(req.body.type || ''), true).toLowerCase(),
            slug_gender: removeUnicode(String(req.body.gender || ''), true).toLowerCase(),
            slug_address: removeUnicode(String(req.body.address || ''), true).toLowerCase(),
            slug_district: removeUnicode(String(req.body.district || ''), true).toLowerCase(),
            slug_province: removeUnicode(String(req.body.province || ''), true).toLowerCase(),
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Customers' }, { $set: { name: 'Customers', value: customer_id } }, { upsert: true });
        req[`body`] = _customer;
        await customerService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._importFile = async (req, res, next) => {
    try {
        if (req.file == undefined) {
            throw new Error('400: Vui lòng truyền file!');
        }
        let excelData = XLSX.read(req.file.buffer, {
            type: 'buffer',
            cellDates: true,
        });
        let rows = XLSX.utils.sheet_to_json(excelData.Sheets[excelData.SheetNames[0]]);
        let typeSlugs = [];
        rows = rows.map((eRow) => {
            let _row = {};
            for (let i in eRow) {
                let field = String(removeUnicode(i, true))
                    .replace(/\(\*\)/g, '')
                    .toLowerCase();
                _row[field] = eRow[i];
            }
            if (_row['nhomkhachhang']) {
                _row['_nhomkhachhang'] = removeUnicode(String(_row['nhomkhachhang']), true).toLowerCase();
                typeSlugs.push(_row['_nhomkhachhang']);
            }
            return _row;
        });
        typeSlugs = [...new Set(typeSlugs)];
        let [customerMaxId, typeMaxId] = await Promise.all([
            client.db(req.user.database).collection('AppSetting').findOne({ name: 'Customers' }),
            client.db(req.user.database).collection('AppSetting').findOne({ name: 'CustomerTypes' }),
        ]);
        let customer_id = (() => {
            if (customerMaxId && customerMaxId.value) {
                return customerMaxId.value;
            }
            return 0;
        })();
        let type_id = (() => {
            if (typeMaxId && typeMaxId.value) {
                return typeMaxId.value;
            }
            return 0;
        })();
        let types = await client
            .db(req.user.database)
            .collection('CustomerTypes')
            .find({ slug_name: { $in: typeSlugs } })
            .toArray();
        let _types = {};
        types.map((eType) => {
            _types[`${eType.slug_name}`] = eType;
        });
        insertCustomers = [];
        insertTypes = [];
        var phoneAlready = [];

        rows.map((eRow) => {
            if (eRow['stt']) {
                // Check condition

                var _indexPhone = phoneAlready.findIndex((itemP) => itemP == eRow['sodienthoai']);
                if (_indexPhone >= 0) throw new Error(`400: Số điện thoại ${eRow['sodienthoai']} bị trùng`);

                if (eRow['tenkhachhang'] == undefined || eRow['tenkhachhang'] == '')
                    throw new Error(`400: Tên khách hàng không được để trống (STT ${eRow['stt']})`);

                if (eRow['hokhachhang'] == undefined) eRow['hokhachhang'] = '';

                phoneAlready.push(eRow['sodienthoai']);

                if (!_types[eRow['_nhomkhachhang']]) {
                    type_id++;
                    let _type = {
                        type_id: type_id,
                        code: String(type_id).padStart(6, '0'),
                        name: eRow['nhomkhachhang'],
                        priority: 100,
                        description: '',
                        create_date: moment().tz(TIMEZONE).format(),
                        creator_id: req.user.user_id,
                        last_update: moment().tz(TIMEZONE).format(),
                        updater_id: req.user.user_id,
                        active: true,
                        slug_name: removeUnicode(String(eRow['nhomkhachhang']), true).toLowerCase(),
                    };
                    insertTypes.push(_type);
                    _types[_type.slug_name] = _type;
                }
                customer_id++;
                let _customer = {
                    customer_id: customer_id,
                    code: String(customer_id).padStart(6, '0'),
                    phone: eRow['sodienthoai'],
                    type_id: (() => {
                        if (_types[eRow['_nhomkhachhang']]) {
                            return _types[eRow['_nhomkhachhang']].type_id;
                        }
                        throw new Error(`400: Nhóm khách hàng ${eRow['nhomkhachhang']} không tồn tại!`);
                    })(),
                    first_name: eRow['hokhachhang'],
                    last_name: eRow['tenkhachhang'],
                    gender: eRow['gioitinh'],
                    birthday: eRow['ngaysinh'],
                    address: eRow['diachi'],
                    district: eRow['quan/huyen'],
                    province: eRow['tinh/thanhpho'],
                    balance: {
                        available: 0,
                        debt: 0,
                        freezing: 0,
                    },
                    point: eRow['diemtichluy'],
                    used_point: eRow['diemdasudung'],
                    order_quantity: eRow['donhangdamua'],
                    order_total_cost: eRow['tongtieuphi'],
                    create_date: moment().tz(TIMEZONE).format(),
                    creator_id: req.user.user_id,
                    last_update: moment().tz(TIMEZONE).format(),
                    updater_id: req.user.user_id,
                    active: true,
                    slug_name: removeUnicode(String(eRow['hokhachhang'] || '' + eRow['tenkhachhang'] || ''), true).toLowerCase(),
                    slug_type: removeUnicode(String(eRow['_nhomkhachhang'] || ''), true).toLowerCase(),
                    slug_gender: removeUnicode(String(eRow['gioitinh'] || ''), true).toLowerCase(),
                    slug_address: removeUnicode(String(eRow['diachi'] || ''), true).toLowerCase(),
                    slug_district: removeUnicode(String(eRow['quan/huyen'] || ''), true).toLowerCase(),
                    slug_province: removeUnicode(String(eRow['tinh/thanhpho'] || ''), true).toLowerCase(),
                };
                insertCustomers.push(_customer);
            }
        });

        var _customerAlready = await client
            .db(req.user.database)
            .collection('Customers')
            .find({
                phone: { $in: phoneAlready },
            })
            .toArray();

        if (_customerAlready.length > 0) throw new Error(`400: Số điện thoại đã tồn tại trong hệ thống`);

        await Promise.all([
            client
                .db(req.user.database)
                .collection('AppSetting')
                .updateOne({ name: 'CustomerTypes' }, { $set: { name: 'CustomerTypes', value: type_id } }),
            client
                .db(req.user.database)
                .collection('AppSetting')
                .updateOne({ name: 'Customers' }, { $set: { name: 'Customers', value: customer_id } }),
        ]);
        if (Array.isArray(insertTypes) && insertTypes.length > 0) {
            await client.db(req.user.database).collection('CustomerTypes').insertMany(insertTypes);
        }

        await client.db(req.user.database).collection('Customers');

        if (Array.isArray(insertCustomers) && insertCustomers.length > 0) {
            await client.db(req.user.database).collection('Customers').insertMany(insertCustomers);
        }

        res.send({ success: true, message: 'Thêm khách hàng thành công!' });
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.customer_id = Number(req.params.customer_id);
        req.body.phone = String(req.body.phone).trim().toUpperCase();
        let customer = await client.db(req.user.database).collection(`Customers`).findOne(req.params);
        if (!customer) {
            throw new Error(`400: Khách hàng không tồn tại!`);
        }
        if (req.body.phone) {
            let check = await client
                .db(req.user.database)
                .collection(`Customers`)
                .findOne({
                    customer_id: { $ne: customer.customer_id },
                    phone: req.body.phone,
                });
            if (check) {
                throw new Error(`400: Số điện thoại đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.customer_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _customer = { ...customer, ...req.body };
        _customer.first_name = _customer.first_name || '';
        _customer.last_name = _customer.last_name || '';

        _customer = {
            customer_id: _customer.customer_id,
            code: _customer.code,
            phone: String(_customer.phone),
            email: String(_customer.email) || '',
            type_id: _customer.type_id || 1,
            first_name: (_customer.first_name || '').trim(),
            last_name: (_customer.last_name || '').trim(),
            gender: _customer.gender || '',
            birthday: _customer.birthday || '',
            address: _customer.address || '',
            district: _customer.district || '',
            province: _customer.province || '',
            balance: _customer.balance || {
                available: 0,
                debt: 0,
                freezing: 0,
                total: 0,
            },
            point: _customer.point,
            used_point: _customer.used_point,
            order_quantity: _customer.order_quantity,
            order_total_cost: _customer.order_total_cost,
            create_date: _customer.create_date,
            creator_id: _customer.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _customer.active,
            slug_name: removeUnicode(_customer.first_name + ' ' + _customer.last_name, true).toLowerCase(),
            slug_type: removeUnicode(_customer.type, true).toLowerCase(),
            slug_gender: removeUnicode(_customer.gender, true).toLowerCase(),
            slug_address: removeUnicode(_customer.address, true).toLowerCase(),
            slug_district: removeUnicode(_customer.district, true).toLowerCase(),
            slug_province: removeUnicode(_customer.province, true).toLowerCase(),
        };
        req['body'] = _customer;
        await customerService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Customers`)
            .deleteMany({ customer_id: { $in: req.body.customer_id } });
        res.send({
            success: true,
            message: 'Xóa khách hàng thành công!',
        });
    } catch (err) {
        next(err);
    }
};

module.exports._getType = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        if (req.query.category_id) {
            aggregateQuery.push({
                $match: { category_id: Number(req.query.category_id) },
            });
        }
        aggregateQuery.push({ $sort: { priority: 1 } });
        let [types, counts] = await Promise.all([
            client.db(req.user.database).collection('CustomerTypes').aggregate(aggregateQuery).toArray(),
            client
                .db(req.user.database)
                .collection('CustomerTypes')
                .aggregate([...aggregateQuery, { $count: 'counts' }])
                .toArray(),
        ]);
        res.send({
            success: true,
            count: counts[0] ? counts[0].counts : 0,
            data: types,
        });
    } catch (err) {
        next(err);
    }
};

module.exports._createType = async (req, res, next) => {
    try {
        ['name'].map((e) => {
            if (req.body[e] == undefined) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        let typeCustomer = await client
            .db(req.user.database)
            .collection('CustomerTypes')
            .findOne({ slug: convertToSlug(req.body.name) });
        if (typeCustomer) {
            throw new Error(`400: Nhóm khách hàng đã tồn tại!`);
        }
        req.body.slug = convertToSlug(req.body.name);
        let typeMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'CustomerTypes' });
        let type_id = (() => {
            if (typeMaxId && typeMaxId.value) {
                return typeMaxId.value;
            }
            return 0;
        })();
        type_id++;
        req['body'] = {
            type_id: type_id,
            code: String(type_id).padStart(6, '0'),
            name: req.body.name,
            description: req.body.description || '',
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(String(req.body.name), true).toLowerCase(),
        };

        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'CustomerTypes' }, { $set: { name: 'CustomerTypes', value: type_id } }, { upsert: true });
        let insert = await client.db(req.user.database).collection('CustomerTypes').insertOne(req.body);
        if (!insert.insertedId) {
            throw new Error(`Thêm nhóm khách hàng thất bại!`);
        }
        res.send({ success: true, data: req.body });
    } catch (err) {
        next(err);
    }
};

module.exports._updateType = async (req, res, next) => {
    try {
    } catch (err) {
        next(err);
    }
};

module.exports._deleteType = async (req, res, next) => {
    try {
    } catch (err) {
        next(err);
    }
};

module.exports._getPointHistory = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        if (req.query.customer_id) {
            aggregateQuery.push({
                $match: { customer_id: Number(req.query.customer_id) },
            });
        }
        if (req.query.branch_id) {
            aggregateQuery.push({
                $match: { branch_id: Number(req.query.branch_id) },
            });
        }
        if (req.query.type) {
            aggregateQuery.push({
                $match: { type: String(req.query.type).toUpperCase() },
            });
        }
        req.query = createTimeline(req.query);
        if (req.query.from_date) {
            aggregateQuery.push({
                $match: { create_date: { $gte: req.query.from_date } },
            });
        }
        if (req.query.to_date) {
            aggregateQuery.push({
                $match: { create_date: { $lte: req.query.to_date } },
            });
        }
        let countQuery = [...aggregateQuery];
        aggregateQuery.push({ $sort: { create_date: -1 } });
        if (req.query.page && req.query.page_size) {
            let page = Number(req.query.page) || 1;
            let page_size = Number(req.query.page_size) || 50;
            aggregateQuery.push({ $skip: (page - 1) * page_size }, { $limit: page_size });
        }
        let [histories, counts] = await Promise.all([
            client.db(req.user.database).collection(`PointUseHistories`).aggregate(aggregateQuery).toArray(),
            client
                .db(req.user.database)
                .collection(`PointUseHistories`)
                .aggregate([...countQuery, { $count: 'counts' }])
                .toArray(),
        ]);
        res.send({
            success: true,
            count: counts[0] ? counts[0].counts : 0,
            data: histories,
        });
    } catch (err) {
        next(err);
    }
};

class ChangePointOption {
    /**
     *
     * @param {ChangePointOption} option
     * @returns
     */
    constructor(option) {
        this.database = option.database;
        this.customer = option.customer;
        this.order = option.order;
        this.increasePoint = option.increasePoint || 0;
        this.decreasePoint = option.decreasePoint || 0;
        this.isExists = option.isExists || false;
        this.writeLog = option.writeLog || false;
        hardValidate(this, this.dataForm());
    }
}
ChangePointOption.prototype.dataForm = function () {
    return {
        database: { types: ['string'], require: true },
        customer: { types: ['object'], require: true },
        order: { types: ['object'], require: true },
        isExists: { types: ['boolean'], require: true },
        increasePoint: { types: ['number'], require: true },
        decreasePoint: { types: ['number'], require: true },
        writeLog: { types: ['boolean'], require: true },
    };
};

/**
 *
 * @param {ChangePointOption} option
 * @returns
 */
module.exports._changePoint = async (option) => {
    try {
        if (!option.isExists) {
            let customer = await client.db(option.database).collection('Customers').findOne({ customer_id: option.customerId });
            if (!customer) {
                throw new Error(`400: Khách hàng không khả dụng!`);
            }
        }
        if (customer.point + option.increasePoint - option.decreasePoint < 0) {
            throw new Error(`400: Khách hàng không đủ điểm để thực hiện thao tác này!`);
        }
        await client
            .db(option.database)
            .collection('Customers')
            .updateOne(
                { customer_id: option.customer.customer_id },
                {
                    $inc: {
                        point: option.increasePoint - option.decreasePoint,
                        used_point: option.decreasePoint,
                        order_quantity: 1,
                        order_total_cost: order.final_cost || 0,
                    },
                }
            );
        if (option.writeLog) {
            let logId = await client
                .db(option.database)
                .collection('AppSetting')
                .findOne({ name: 'PointLogs' })
                .then((doc) => (doc && doc.value) || 0);
            let insertLogs = [];
            if (option.increasePoint > 0) {
                insertLogs.push({
                    log_id: ++logId,
                    customer_id: option.customer.customer_id,
                    order_id: option.order.order_id,
                    type: 'increase-point',
                    value: option.increasePoint,
                    create_date: moment().tz(TIMEZONE).format(),
                    creator_id: req.user.user_id,
                    last_update: moment().tz(TIMEZONE).format(),
                    updater_id: req.user.user_id,
                });
            }
            if (option.decreasePoint > 0) {
                insertLogs.push({
                    log_id: ++logId,
                    customer_id: option.customer.customer_id,
                    order_id: option.order.order_id,
                    type: 'decrease-point',
                    value: option.decreasePoint,
                    create_date: moment().tz(TIMEZONE).format(),
                    creator_id: req.user.user_id,
                    last_update: moment().tz(TIMEZONE).format(),
                    updater_id: req.user.user_id,
                });
            }
            if (insertLogs.length > 0) {
                await client.db(option.database).collection('PointLogs').insertMany(insertLogs);
            }
        }
    } catch (err) {
        throw err;
    }
};
