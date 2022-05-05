const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const SDB = process.env.DATABASE;

const bcrypt = require(`../libs/bcrypt`);
const jwt = require(`../libs/jwt`);
const mail = require(`../libs/nodemailer`);
const { otpMail } = require('../templates/otpMail');
const { verifyMail } = require('../templates/verifyMail');
const { sendSMS } = require('../libs/sendSMS');

const crypto = require('crypto');
const { _permissions } = require('../templates/permissions');
const { _menus } = require('../templates/menus');
const { _createUniqueKey } = require('../templates/unique-key');
const { stringHandle } = require('../utils/string-handle');

module.exports._checkBusiness = async (req, res, next) => {
    try {
        if (req.body.username == undefined) throw new Error('400: Vui lòng truyền username');

        var business = await client.db(SDB).collection('Business').findOne({
            username: req.body.username,
        });
        return res.send({ success: true, data: business });
    } catch (err) {
        next(err);
    }
};

module.exports._register = async (req, res, next) => {
    try {
        ['business_name', 'username', 'email', 'password'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });

        req.body.prefix = stringHandle(req.body.business_name, {
            removeUnicode: true,
            removeSpace: true,
            lowerCase: true,
        });
        if (
            req.body.prefix == 'root' ||
            req.body.prefix == 'admin' ||
            req.body.prefix == 'app' ||
            req.body.prefix == 'login' ||
            req.body.prefix == 'register'
        ) {
            return res.send({
                success: false,
                mess: 'Tên doanh nghiệp đã tồn tại, vui lòng chọn tên khác',
            });
        }
        req.body.username = req.body.username.trim().toLowerCase();
        req.body.email = req.body.email.trim().toLowerCase();
        req.body.password = bcrypt.hash(req.body.password);
        if (/^((admin)|(root)|(app)|(login)|(register))$/gi.test(req.body.prefix)) {
            throw new Error(`400: Bạn không thể sử dụng tên doanh nghiệp này!`);
        }

        let business = await client.db(SDB).collection('Business').findOne({ prefix: req.body.prefix });
        let user = await client
            .db(SDB)
            .collection('Business')
            .findOne({
                $or: [{ username: req.body.username }, { email: { $ne: '', $eq: req.body.email } }],
            });

        if (business) {
            throw new Error(`400: Tên doanh nghiệp đã được đăng ký!`);
        }
        if (user) {
            throw new Error(`400: Số điện thoại hoặc email đã được sử dụng!`);
        }
        const DB = `${req.body.prefix}DB`;
        let businessMaxId = await client.db(SDB).collection('AppSetting').findOne({ name: 'Business' });
        let businessId = (businessMaxId && businessMaxId.value) || 0;
        let otpCode = String(Math.random()).substr(2, 6);
        let verifyId = crypto.randomBytes(10).toString(`hex`);
        let verifyLink = `https://${req.body.prefix}.${process.env.DOMAIN}/verify-account?uid=${verifyId}`;
        let _verifyLink = {
            username: req.body.username,
            UID: String(verifyId),
            verify_link: verifyLink,
            verify_timelife: moment().tz(TIMEZONE).add(5, `minutes`).format(),
        };
        // await mail.sendMail(req.body.email, `Yêu cầu xác thực`, verifyMail(otpCode, verifyLink));
        await client.db(SDB).collection('VerifyLinks').insertOne(_verifyLink);
        let verifyMessage = `[VIESOFTWARE] Mã OTP của quý khách là ${otpCode}`;
        sendSMS([req.body.username], verifyMessage, 2, 'VIESOFTWARE');
        let _business = {
            business_id: ++businessId,
            username: req.body.username,
            prefix: req.body.prefix,
            business_name: req.body.business_name,
            database_name: DB,
            company_name: req.body.company_name || '',
            company_email: req.body.company_email || '',
            company_phone: req.body.company_phone || '',
            company_website: req.body.company_website || '',
            company_logo: 'https://icon-library.com/images/merchant-icon/merchant-icon-12.jpg' || '',
            company_address: req.body.company_address || '',
            company_district: req.body.company_district || '',
            company_province: req.body.company_province || '',
            tax_code: req.body.tax_code || '',
            career_id: req.body.career_id || '',
            price_recipe: req.body.price_recipe || 'FIFO',
            verify_with: (() => {
                if (req.body.verify_with) {
                    return String(req.body.verify_with).toUpperCase();
                }
                if (req.body.username) {
                    return 'PHONE';
                }
                if (req.body.email) {
                    return 'EMAIL';
                }
                return 'PHONE';
            })(),
            active: false,
        };
        let _admin = {
            user_id: -1,
            user_code: String(1).padStart(6, '0'),
            employee_id: -1,
            code: String(1).padStart(6, '0'),
            username: req.body.username,
            password: req.body.password,
            role_id: -1,
            email: req.body.email || '',
            avatar: req.body.avatar || 'https://' + process.env.DOMAIN + '/app/logo.png',
            first_name: req.body.first_name || '',
            last_name: req.body.last_name || '',
            name: (req.body.first_name || '') + (req.body.last_name || ''),
            birth_day: req.body.birth_day || moment().tz(TIMEZONE).format(),
            address: req.body.address || '',
            district: req.body.district || '',
            province: req.body.province || '',
            branch_id: -1,
            store_id: -1,
            otp_code: otpCode,
            otp_timelife: moment().tz(TIMEZONE).add(5, 'minutes').format(),
            last_login: moment().tz(TIMEZONE).format(),
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: -1,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: -1,
            active: true,
            slug_name: stringHandle((req.body.first_name || '') + ' ' + (req.body.last_name || ''), {
                createSlug: true,
            }),
            slug_address: stringHandle(req.body.address || '', { createSlug: true }),
            slug_district: stringHandle(req.body.district || '', { createSlug: true }),
            slug_province: stringHandle(req.body.province || '', { createSlug: true }),
        };
        let _supplier = {
            supplier_id: -1,
            code: String(1).padStart(6, '0'),
            name: 'Nhà cung cấp mặc định',
            logo: 'https://' + process.env.DOMAIN + '/app/logo.png',
            phone: '',
            email: '',
            address: '',
            district: '',
            province: '',
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: _admin.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: _admin.user_id,
            active: true,
            slug_name: 'nha-cung-cap-mac-dinh',
            slug_address: '',
            slug_district: '',
            slug_province: '',
        };
        let _customer = {
            customer_id: -1,
            code: String(1).padStart(6, '0'),
            phone: '0000000000',
            type_id: 1,
            first_name: 'Khách lẻ',
            last_name: '',
            gender: '',
            birthday: '',
            address: '',
            district: '',
            province: '',
            balance: {
                available: 0,
                debt: 0,
                freezing: 0,
            },
            point: 0,
            used_point: 0,
            order_quantity: 0,
            order_total_cost: 0,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: _admin.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: _admin.user_id,
            active: true,
            slug_name: 'khach-le',
            slug_type: '',
            slug_gender: '',
            slug_address: '',
            slug_district: '',
            slug_province: '',
        };
        let _roles = [
            {
                role_id: -1,
                code: String(1).padStart(6, '0'),
                name: 'ADMIN',
                permission_list: _permissions,
                menu_list: _menus,
                default: true,
                create_date: moment().tz(TIMEZONE).format(),
                creator_id: _admin.user_id,
                last_update: moment().tz(TIMEZONE).format(),
                updater_id: _admin.user_id,
                active: true,
                slug_name: 'admin',
            },
            {
                role_id: -2,
                code: String(2).padStart(6, '0'),
                name: 'EMPLOYEE',
                permission_list: [],
                menu_list: [],
                default: true,
                create_date: moment().tz(TIMEZONE).format(),
                creator_id: _admin.user_id,
                last_update: moment().tz(TIMEZONE).format(),
                updater_id: _admin.user_id,
                active: true,
                slug_name: 'employee',
            },
            {
                role_id: -3,
                code: String(3).padStart(6, '0'),
                name: 'SUPPLIER',
                permission_list: [],
                menu_list: [],
                default: true,
                create_date: moment().tz(TIMEZONE).format(),
                creator_id: _admin.user_id,
                last_update: moment().tz(TIMEZONE).format(),
                updater_id: _admin.user_id,
                active: true,
                slug_name: 'admin',
            },
            {
                role_id: -4,
                code: String(4).padStart(6, '0'),
                name: 'CUSTOMER',
                permission_list: [],
                menu_list: [],
                default: true,
                create_date: moment().tz(TIMEZONE).format(),
                creator_id: _admin.user_id,
                last_update: moment().tz(TIMEZONE).format(),
                updater_id: _admin.user_id,
                active: true,
                slug_name: 'customer',
            },
        ];
        let _branch = {
            branch_id: -1,
            code: String(1).padStart(6, '0'),
            name: 'Chi nhánh mặc định',
            logo: 'https://' + process.env.DOMAIN + '/app/logo.png',
            phone: '',
            email: '',
            fax: '',
            website: '',
            latitude: '',
            longitude: '',
            warehouse_type: 'Store',
            address: '',
            ward: '',
            district: '',
            province: '',
            accumulate_point: false,
            use_point: false,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: _admin.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: _admin.user_id,
            active: true,
            slug_name: 'chi-nhanh-mac-dinh',
            slug_warehouse_type: 'store',
            slug_address: '',
            slug_ward: '',
            slug_district: '',
            slug_province: '',
        };
        let _customerType = {
            type_id: -1,
            name: 'Mặc định',
            description: 'Mặc định',
            require_point: 0,
            require_order: 0,
            require_cost: 0,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: _admin.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: _admin.user_id,
            slug_name: 'mac-dinh',
        };
        let _paymentMethods = [
            {
                payment_method_id: -1,
                code: String(1).padStart(6, '0'),
                name: 'Tiền mặt',
                images: [],
                default: true,
                create_date: moment().tz(TIMEZONE).format(),
                creator_id: _admin.user_id,
                last_update: moment().tz(TIMEZONE).format(),
                updater_id: _admin.user_id,
                active: true,
                slug_name: 'tien-mat',
            },
            {
                payment_method_id: -2,
                code: String(2).padStart(6, '0'),
                name: 'Điểm tích lũy',
                images: [],
                default: false,
                create_date: moment().tz(TIMEZONE).format(),
                creator_id: _admin.user_id,
                last_update: moment().tz(TIMEZONE).format(),
                updater_id: _admin.user_id,
                active: true,
                slug_name: 'diem-tich-luy',
            },
        ];
        let _warranty = {
            warranty_id: -1,
            code: String(1).padStart(6, '0'),
            name: 'Bảo hành 12 tháng',
            type: 'Tháng',
            time: 12,
            description: '',
            default: true,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: _admin.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: _admin.user_id,
            active: true,
            slug_name: 'bao-hanh-12-thang',
            slug_type: 'thang',
        };
        let _shippingCompany = {
            shipping_company_id: -1,
            code: String(1).padStart(6, '0'),
            name: 'Tự giao hàng',
            image: 'https://' + process.env.DOMAIN + '/app/logo.png',
            phone: '',
            zipcode: '',
            address: '',
            district: '',
            province: '',
            default: true,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: _admin.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: _admin.user_id,
            active: true,
            slug_name: 'tu-giao-hang',
            slug_address: '',
            slug_district: '',
            slug_province: '',
        };
        let _pointSetting = {
            point_setting_id: 1,
            name: 'Mặc định',
            accumulate_for_promotion_product: false,
            accumulate_for_refund_order: false,
            accumulate_for_payment_point: false,
            accumulate_for_fee_shipping: false,
            stack_point: false,
            exchange_point_rate: 0,
            exchange_money_rate: 0,
            order_require: 0,
            order_cost_require: 0,
            all_branch: false,
            branch_id: [],
            all_customer_type: false,
            customer_type_id: [],
            all_category: false,
            category_id: [],
            all_product: false,
            product_id: [],
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: _admin.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: _admin.user_id,
            active: true,
            slug_name: stringHandle('Mặc định', { createSlug: true }),
        };
        await client
            .db(SDB)
            .collection('AppSetting')
            .updateOne({ name: 'Business' }, { $set: { name: 'Business', value: businessId } }, { upsert: true });
        await client
            .db(DB)
            .collection('AppSetting')
            .updateOne({ name: 'Users' }, { $set: { name: 'Users', value: 1 } }, { upsert: true });
        await client
            .db(DB)
            .collection('AppSetting')
            .updateOne({ name: 'Suppliers' }, { $set: { name: 'Suppliers', value: 1 } }, { upsert: true });
        await client
            .db(DB)
            .collection('AppSetting')
            .updateOne({ name: 'Customers' }, { $set: { name: 'Customers', value: 1 } }, { upsert: true });
        await client
            .db(DB)
            .collection('AppSetting')
            .updateOne({ name: 'Roles' }, { $set: { name: 'Roles', value: 4 } }, { upsert: true });
        await client
            .db(DB)
            .collection('AppSetting')
            .updateOne({ name: 'Branchs' }, { $set: { name: 'Branchs', value: 1 } }, { upsert: true });
        await client
            .db(DB)
            .collection('AppSetting')
            .updateOne({ name: 'CustomerTypes' }, { $set: { name: 'CustomerTypes', value: 1 } }, { upsert: true });
        await client
            .db(DB)
            .collection('AppSetting')
            .updateOne({ name: 'PaymentMethods' }, { $set: { name: 'PaymentMethods', value: 2 } }, { upsert: true });
        await client
            .db(DB)
            .collection('AppSetting')
            .updateOne({ name: 'Warranties' }, { $set: { name: 'Warranties', value: 1 } }, { upsert: true });
        await client
            .db(DB)
            .collection('AppSetting')
            .updateOne({ name: 'ShippingCompanies' }, { $set: { name: 'ShippingCompanies', value: 1 } }, { upsert: true });
        await client
            .db(DB)
            .collection('AppSetting')
            .updateOne({ name: 'PointSettings' }, { $set: { name: 'PointSettings', value: 1 } }, { upsert: true });

        // Những model mặc định
        await Promise.all([
            client.db(SDB).collection('Business').insertOne(_business),
            client.db(DB).collection('Users').insertMany([_admin]),
            client.db(DB).collection('Suppliers').insertOne(_supplier),
            client.db(DB).collection('Customers').insertOne(_customer),
            client.db(DB).collection('CustomerTypes').insertOne(_customerType),
            client.db(DB).collection('Roles').insertMany(_roles),
            client.db(DB).collection('Branchs').insertOne(_branch),
            client.db(DB).collection('PaymentMethods').insertMany(_paymentMethods),
            client.db(DB).collection('Warranties').insertOne(_warranty),
            client.db(DB).collection('ShippingCompanies').insertOne(_shippingCompany),
            client.db(DB).collection('PointSettings').insertOne(_pointSetting),
            _createUniqueKey(client, DB),
        ]).catch(async (err) => {
            await Promise.all([client.db(SDB).collection('Business').deleteMany({ business_id: businessId }), client.db(DB).dropDatabase()]);
            console.log(err.message);
            throw new Error('Tạo tài khoản không thành công!');
        });
        res.send({
            success: true,
            data: _business,
            verify_with: _business.verify_with,
            verify_link: verifyLink,
        });
        // console.log("ten "+req.user);
    } catch (err) {
        next(err);
    }
};

module.exports._login = async (req, res, next) => {
    try {
        let shop = req.headers[`shop`];
        ['username', 'password'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        // let [prefix, username] = req.body.username.split("_");
        var username = req.body.username;
        let business = await client.db(SDB).collection('Business').findOne({ prefix: shop.toLowerCase() });
        if (!business) {
            throw new Error(`400: Tài khoản doanh nghiệp chưa được đăng ký!`);
        }
        if (business.active == false) {
            throw new Error(`403: Doanh nghiệp chưa được xác thực!`);
        }
        if (business.active == `banned`) {
            throw new Error(`404: Doanh nghiệp đang bị tạm khoá!`);
        }
        const DB = (() => {
            if (business && business.database_name) {
                return business.database_name;
            }
            throw new Error('404: Không tìm thấy doanh nghiệp này!');
        })();
        let [user] = await client
            .db(DB)
            .collection(`Users`)
            .aggregate([
                { $match: { username: username } },
                {
                    $lookup: {
                        from: 'Roles',
                        localField: 'role_id',
                        foreignField: 'role_id',
                        as: '_role',
                    },
                },
                { $unwind: { path: '$_role', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'Branchs',
                        localField: 'branch_id',
                        foreignField: 'branch_id',
                        as: '_branch',
                    },
                },
                { $unwind: { path: '$_branch', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'Stores',
                        localField: 'store_id',
                        foreignField: 'store_id',
                        as: '_store',
                    },
                },
                { $unwind: { path: '$_store', preserveNullAndEmptyArrays: true } },
            ])
            .toArray();
        if (!user) {
            throw new Error(`404: Tài khoản không chính xác!`);
        }
        if (!bcrypt.compare(req.body.password, user.password)) {
            res.send({ success: false, message: `Mật khẩu không chính xác!` });
            return;
        }
        delete user.password;
        let [accessToken, refreshToken, _update] = await Promise.all([
            jwt.createToken({ ...user, database: DB, _business: business }, 30 * 24 * 60 * 60),
            jwt.createToken({ ...user, database: DB, _business: business }, 30 * 24 * 60 * 60 * 10),
            client
                .db(DB)
                .collection(`Users`)
                .updateOne({ user_id: Number(user.user_id) }, { $set: { last_login: moment().tz(TIMEZONE).format() } }),
        ]);
        res.send({ success: true, data: { accessToken, refreshToken } });
    } catch (err) {
        next(err);
    }
};

module.exports._refreshToken = async (req, res, next) => {
    try {
        if (req.body.refreshToken == undefined) throw new Error('400: Vui lòng truyền refreshToken');
        try {
            let decoded = await jwt.verifyToken(req.body.refreshToken);
            let user = decoded.data;

            let [userNew] = await client
                .db(user.database)
                .collection(`Users`)
                .aggregate([
                    { $match: { username: user.username } },
                    {
                        $lookup: {
                            from: 'Roles',
                            localField: 'role_id',
                            foreignField: 'role_id',
                            as: '_role',
                        },
                    },
                    { $unwind: { path: '$_role', preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: 'Branchs',
                            localField: 'branch_id',
                            foreignField: 'branch_id',
                            as: '_branch',
                        },
                    },
                    { $unwind: { path: '$_branch', preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: 'Stores',
                            localField: 'store_id',
                            foreignField: 'store_id',
                            as: '_store',
                        },
                    },
                    { $unwind: { path: '$_store', preserveNullAndEmptyArrays: true } },
                ])
                .toArray();
            if (userNew == undefined) return res.status(404).send({ success: false, message: 'Không tìm thấy người dùng này' });

            let business = await client.db(SDB).collection('Business').findOne({ prefix: user._business.prefix });
            userNew.database = business.database_name;
            userNew['_business'] = business;
            let accessToken = await jwt.createToken(userNew, 30 * 24 * 60 * 60);
            let refreshToken = await jwt.createToken(userNew, 30 * 24 * 60 * 60 * 10);
            res.send({ success: true, accessToken, refreshToken });
        } catch (error) {
            console.log(error);
            throw new Error(`400: Refresh token không chính xác!`);
        }
    } catch (err) {
        next(err);
    }
};

module.exports._checkVerifyLink = async (req, res, next) => {
    try {
        ['UID'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        let link = await client.db(SDB).collection(`VerifyLinks`).findOne({
            UID: req.body.UID,
        });
        if (!link) {
            throw new Error('400: UID không tồn tại!');
        }
        res.send({ success: true, data: link });
    } catch (err) {
        next(err);
    }
};

module.exports._getOTP = async (req, res, next) => {
    try {
        ['username'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        const prefix = (req.headers && req.headers.shop) || false;
        let business = await (async () => {
            if (!prefix) {
                let result = client.db(SDB).collection('Business').findOne({ username: req.body.username });
                return result;
            }
            let result = client.db(SDB).collection('Business').findOne({ prefix: prefix });
            return result;
        })();
        const DB =
            (business && business.database_name) ||
            (() => {
                throw new Error('400: Doanh nghiệp chưa được đăng ký!');
            })();
        let user = await client.db(DB).collection('Users').findOne({ username: req.body.username });
        if (!user) {
            throw new Error('400: Tài khoản người dùng không tồn tại!');
        }
        let otpCode = String(Math.random()).substr(2, 6);
        let verifyMessage = `[VIESOFTWARE] Mã OTP của quý khách là ${otpCode}`;
        sendSMS([req.body.username], verifyMessage, 2, 'VIESOFTWARE');
        // let otpCode = String(Math.random()).substr(2, 6);
        // await Promise.all(mail.sendMail(user.email, 'Mã xác thực', otpMail(otpCode)));
        await client
            .db(DB)
            .collection(`Users`)
            .updateOne(
                { username: req.body.username },
                {
                    $set: {
                        otp_code: otpCode,
                        otp_timelife: moment().tz(TIMEZONE).add(5, 'minutes').format(),
                    },
                }
            );
        res.send({ success: true, data: `Gửi OTP đến số điện thoại thành công!` });
    } catch (err) {
        next(err);
    }
};

module.exports._verifyOTP = async (req, res, next) => {
    try {
        ['username', 'otp_code'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        const prefix = (req.headers && req.headers.shop) || false;
        let business = await (async () => {
            if (!prefix) {
                let result = client.db(SDB).collection('Business').findOne({ username: req.body.username });
                return result;
            }
            let result = client.db(SDB).collection('Business').findOne({ prefix: prefix });
            return result;
        })();
        const DB =
            (business && business.database_name) ||
            (() => {
                throw new Error('400: Doanh nghiệp chưa được đăng ký!');
            })();
        let user = await client.db(DB).collection('Users').findOne({ username: req.body.username });
        if (!user) {
            throw new Error('400: Tài khoản người dùng không tồn tại!');
        }
        if (req.body.otp_code != user.otp_code) {
            throw new Error('400: Mã xác thực không chính xác!');
        }
        if (business.active == false) {
            delete user.password;
            await client
                .db(SDB)
                .collection('Business')
                .updateOne(
                    { username: req.body.username },
                    {
                        $set: {
                            active: true,
                        },
                    }
                );
            let [userData] = await client
                .db(DB)
                .collection('Users')
                .aggregate([
                    { $match: { username: req.body.username } },
                    {
                        $lookup: {
                            from: 'Roles',
                            localField: 'role_id',
                            foreignField: 'role_id',
                            as: '_role',
                        },
                    },
                    { $unwind: { path: '$_role', preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: 'Branchs',
                            localField: 'branch_id',
                            foreignField: 'branch_id',
                            as: '_branch',
                        },
                    },
                    { $unwind: { path: '$_branch', preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: 'Stores',
                            localField: 'store_id',
                            foreignField: 'store_id',
                            as: '_store',
                        },
                    },
                    { $unwind: { path: '$_store', preserveNullAndEmptyArrays: true } },
                ])
                .toArray();
            let accessToken = await jwt.createToken({ ...userData, database: DB, _business: business }, 30 * 24 * 60 * 60);
            res.send({
                success: true,
                message: 'Kích hoạt tài khoản thành công!',
                data: { accessToken: accessToken },
            });
        } else {
            delete user.password;
            await client
                .db(DB)
                .collection('Users')
                .updateOne({ username: req.body.username }, { $set: { otp_code: true, otp_timelife: true } });
            let [userData] = await client
                .db(DB)
                .collection('Users')
                .aggregate([
                    { $match: { username: req.body.username } },
                    {
                        $lookup: {
                            from: 'Roles',
                            localField: 'role_id',
                            foreignField: 'role_id',
                            as: '_role',
                        },
                    },
                    { $unwind: { path: '$_role', preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: 'Branchs',
                            localField: 'branch_id',
                            foreignField: 'branch_id',
                            as: '_branch',
                        },
                    },
                    { $unwind: { path: '$_branch', preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: 'Stores',
                            localField: 'store_id',
                            foreignField: 'store_id',
                            as: '_store',
                        },
                    },
                    { $unwind: { path: '$_store', preserveNullAndEmptyArrays: true } },
                ])
                .toArray();
            let accessToken = await jwt.createToken({ ...userData, database: DB, _business: business }, 30 * 24 * 60 * 60);
            res.send({
                success: true,
                message: `Mã OTP chính xác, xác thực thành công!`,
                data: { accessToken: accessToken },
            });
        }
    } catch (err) {
        next(err);
    }
};

module.exports._recoveryPassword = async (req, res, next) => {
    try {
        ['username', 'password'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        const prefix = (req.headers && req.headers.shop) || false;
        let business = await (async () => {
            if (!prefix) {
                let result = client.db(SDB).collection('Business').findOne({ username: req.body.username });
                return result;
            }
            let result = client.db(SDB).collection('Business').findOne({ prefix: prefix });
            return result;
        })();
        const DB =
            (business && business.database_name) ||
            (() => {
                throw new Error('400: Doanh nghiệp chưa được đăng ký!');
            })();
        let user = await client.db(DB).collection('Users').findOne({ username: req.body.username });
        if (user.otp_code != true) {
            throw new Error(`400: Tài khoản chưa được xác thực OTP!`);
        }
        await client
            .db(DB)
            .collection('Users')
            .updateOne(
                { username: req.body.username },
                {
                    $set: {
                        password: bcrypt.hash(req.body.password),
                        otp_code: false,
                        otp_timelife: false,
                    },
                }
            );
        let [_user] = await client
            .db(DB)
            .collection(`Users`)
            .aggregate([
                { $match: { username: req.body.username } },
                {
                    $lookup: {
                        from: 'Roles',
                        localField: 'role_id',
                        foreignField: 'role_id',
                        as: '_role',
                    },
                },
                { $unwind: { path: '$_role', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'Branchs',
                        localField: 'branch_id',
                        foreignField: 'branch_id',
                        as: '_branch',
                    },
                },
                { $unwind: { path: '$_branch', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'Stores',
                        localField: 'store_id',
                        foreignField: 'store_id',
                        as: '_store',
                    },
                },
                { $unwind: { path: '$_store', preserveNullAndEmptyArrays: true } },
            ])
            .toArray();
        delete _user.password;
        let accessToken = await jwt.createToken({ ..._user, database: DB, _business: business }, 30 * 24 * 60 * 60);
        res.send({
            success: true,
            message: 'Khôi phục mật khẩu thành công!',
            data: { accessToken: accessToken },
        });
    } catch (err) {
        next(err);
    }
};
