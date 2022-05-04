const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const SDB = process.env.DATABASE; // System Database

const businessService = require(`../services/business`);

const bcrypt = require(`../libs/bcrypt`);

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
        await businessService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        ['business_name', 'email', 'password'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        if (!req.body.phone && !req.body.username) {
            throw new Error(`400: Thiếu username hoặc phone`);
        }
        req.body.prefix = removeUnicode(req.body.business_name, true).toLowerCase();
        req.body.username = String(req.body.username || '')
            .trim()
            .toLowerCase();
        req.body.phone = String(req.body.phone || '')
            .trim()
            .toLowerCase();
        req.body.email = String(req.body.email || '')
            .trim()
            .toLowerCase();
        req.body.password = bcrypt.hash(req.body.password);
        if (/^((viesoftware)|(admin))$/gi.test(req.body.prefix)) {
            throw new Error(`400: Tên doanh nghiệp đã được sử dụng!`);
        }
        let [business, user] = await Promise.all([
            client.db(SDB).collection('Business').findOne({ prefix: req.body.prefix }),
            client
                .db(SDB)
                .collection('Users')
                .findOne({
                    $or: [
                        { phone: req.body.phone, phone: { $ne: '' } },
                        { username: req.body.username, username: { $ne: '' } },
                        { email: req.body.email, email: { $ne: '' } },
                    ],
                }),
        ]);
        if (business) {
            throw new Error(`400: Tên doanh nghiệp đã được đăng ký!`);
        }
        if (user) {
            throw new Error(`400: Số điện thoại hoặc tên đăng nhập đã được sử dụng!`);
        }
        const DB = `${req.body.prefix}DB`;
        let [business_id, system_user_id] = await Promise.all([
            client
                .db(SDB)
                .collection('AppSetting')
                .findOne({ name: 'Business' })
                .then((doc) => {
                    if (doc) {
                        if (doc.value) {
                            return Number(doc.value);
                        }
                    }
                    return 0;
                }),
            client
                .db(SDB)
                .collection('AppSetting')
                .findOne({ name: 'Users' })
                .then((doc) => {
                    if (doc) {
                        if (doc.value) {
                            return Number(doc.value);
                        }
                    }
                    return 0;
                }),
        ]).catch((err) => {
            throw new Error('Kiểm tra thông tin doanh nghiệp không thành công!');
        });
        let otpCode = String(Math.random()).substr(2, 6);
        if (req.body.username) {
            let verifyId = crypto.randomBytes(10).toString(`hex`);
            let verifyLink = `https://quantribanhang.viesoftware.vn/verifyaccount?uid=${verifyId}`;
            let _verifyLink = {
                username: req.body.username,
                UID: String(verifyId),
                verify_link: verifyLink,
                verify_timelife: moment().tz(TIMEZONE).add(5, `minutes`).format(),
            };
            await Promise.all([
                mail.sendMail(req.body.email, `Yêu cầu xác thực`, verifyMail(otpCode, verifyLink)),
                client.db(SDB).collection('VerifyLinks').insertOne(_verifyLink),
            ]);
        }
        if (req.body.phone) {
            let verifyMessage = `[VIESOFTWARE] Mã OTP của quý khách là ${otpCode}`;
            sendSMS([req.body.phone], verifyMessage, 2, 'VIESOFTWARE');
        }
        business_id++;
        system_user_id++;
        let user_id = 1;
        let role_id = 1;
        let branch_id = 1;
        let store_id = 1;
        let payment_method_id = 1;
        let warranty_id = 1;
        let _business = {
            business_id: business_id,
            system_user_id: system_user_id,
            prefix: req.body.prefix,
            business_name: req.body.business_name,
            database_name: DB,
            company_name: req.body.company_name || '',
            company_email: req.body.company_email || '',
            company_phone: req.body.company_phone || '',
            company_website: req.body.company_website || '',
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
                if (req.body.phone) {
                    return 'PHONE';
                }
                if (req.body.username) {
                    return 'EMAIL';
                }
                return 'PHONE';
            })(),
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: user_id,
            active: true,
        };
        let _user = {
            system_user_id: system_user_id,
            user_id: user_id,
            code: String(user_id).padStart(6, '0'),
            business_id: business_id,
            username: req.body.username,
            phone: req.body.phone,
            password: req.body.password,
            system_role_id: 2,
            role_id: role_id,
            email: req.body.email || '',
            avatar: req.body.avatar || '',
            first_name: req.body.first_name || '',
            last_name: req.body.last_name || '',
            birth_day: req.body.birth_day || '',
            address: req.body.address || '',
            district: req.body.district || '',
            province: req.body.province || '',
            branch_id: branch_id,
            store_id: store_id,
            otp_code: otpCode,
            otp_timelife: moment().tz(TIMEZONE).add(5, 'minutes').format(),
            last_login: moment().tz(TIMEZONE).format(),
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: user_id,
            active: false,
            slug_name: removeUnicode(`${req.body.first_name || ''}${req.body.last_name || ''}`, true).toLowerCase(),
            slug_address: removeUnicode(`${req.body.address || ''}`, true).toLowerCase(),
            slug_district: removeUnicode(`${req.body.district || ''}`, true).toLowerCase(),
            slug_province: removeUnicode(`${req.body.province || ''}`, true).toLowerCase(),
        };
        let _role = {
            role_id: role_id,
            code: String(role_id).padStart(6, '0'),
            name: 'ADMIN',
            permission_list: [],
            menu_list: [],
            default: true,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: 0,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: 0,
            active: true,
            slug_name: 'admin',
        };
        let _branch = {
            branch_id: branch_id,
            code: String(branch_id).padStart(6, '0'),
            name: 'Chi nhánh mặc định',
            logo: '',
            phone: '',
            email: '',
            fax: '',
            website: '',
            latitude: '',
            longitude: '',
            warehouse_type: 'Sở hữu',
            address: '',
            ward: '',
            district: '',
            province: '',
            accumulate_point: false,
            use_point: false,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: user_id,
            active: true,
            slug_name: 'chinhanhmacdinh',
            slug_warehouse_type: 'sohuu',
            slug_address: '',
            slug_ward: '',
            slug_district: '',
            slug_province: '',
        };
        let _store = {
            store_id: store_id,
            code: String(store_id).padStart(6, '0'),
            name: 'Cửa hàng mặc định',
            branch_id: branch_id,
            label_id: '',
            logo: '',
            phone: '',
            latitude: '',
            longitude: '',
            address: '',
            ward: '',
            district: '',
            province: '',
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: user_id,
            active: true,
            slug_name: 'cuahangmacdinh',
            slug_address: '',
            slug_ward: '',
            slug_district: '',
            slug_province: '',
        };
        let _paymentMethod = {
            payment_method_id: Number(payment_method_id),
            code: String(payment_method_id).padStart(6, '0'),
            name: 'Tiền mặt',
            images: [],
            default: true,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: user_id,
            active: true,
            slug_name: removeUnicode(String('Tiền mặt'), true),
        };
        let _warranty = {
            warranty_id: warranty_id,
            code: String(warranty_id).padStart(6, '0'),
            name: 'Bảo hành 12 tháng',
            type: 'Tháng',
            time: 12,
            description: '',
            default: true,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: user_id,
            active: true,
            sub_name: removeUnicode('Bảo hành 12 tháng', true).toLowerCase(),
            sub_type: removeUnicode('Tháng', true).toLowerCase(),
        };
        await Promise.all([
            client.db(SDB).collection('Business').insertOne(_business),
            client.db(SDB).collection('Users').insertOne(_user),
            client.db(DB).collection('Users').insertOne(_user),
            client.db(DB).collection('Roles').insertOne(_role),
            client.db(DB).collection('PaymentMethods').insertOne(_paymentMethod),
            client.db(DB).collection('Branchs').insertOne(_branch),
            client.db(DB).collection('Stores').insertOne(_store),
            client.db(DB).collection('Waranties').insertOne(_warranty),
        ]).catch((err) => {
            throw new Error('Tạo tài khoản không thành công!');
        });
        await Promise.all([
            client
                .db(SDB)
                .collection('AppSetting')
                .updateOne({ name: 'Business' }, { $set: { name: 'Business', value: business_id } }, { upsert: true }),
            client
                .db(SDB)
                .collection('AppSetting')
                .updateOne({ name: 'Users' }, { $set: { name: 'Users', value: system_user_id } }, { upsert: true }),
            client
                .db(DB)
                .collection('AppSetting')
                .updateOne({ name: 'Users' }, { $set: { name: 'Users', value: user_id } }, { upsert: true }),
            client
                .db(DB)
                .collection('AppSetting')
                .updateOne({ name: 'Roles' }, { $set: { name: 'Roles', value: role_id } }, { upsert: true }),
            client
                .db(DB)
                .collection('AppSetting')
                .updateOne(
                    { name: 'PaymentMethods' },
                    { $set: { name: 'PaymentMethods', value: role_id } },
                    { upsert: true }
                ),
            client
                .db(DB)
                .collection('AppSetting')
                .updateOne({ name: 'Branchs' }, { $set: { name: 'Branchs', value: branch_id } }, { upsert: true }),
            client
                .db(DB)
                .collection('AppSetting')
                .updateOne({ name: 'Stores' }, { $set: { name: 'Stores', value: store_id } }, { upsert: true }),
            client
                .db(DB)
                .collection('AppSetting')
                .updateOne({ name: 'Warranties' }, { $set: { name: 'Warranties', value: store_id } }, { upsert: true }),
        ]);
        res.send({ success: true, data: _user });
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.business_id = Number(req.params.business_id);
        let business = await client.db(SDB).collection('Business').findOne(req.params);
        if (!business) {
            throw new Error(`400: Doanh nghiệp không tồn tại!`);
        }
        delete req.body._id;
        delete req.body.business_id;
        delete req.body.system_user_id;
        delete req.body.database_name;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _business = { ...business, ...req.body };
        _business = {
            business_id: _business.business_id,
            system_user_id: _business.system_user_id,
            prefix: _business.prefix,
            business_name: _business.business_name,
            database_name: _business.database_name,
            company_name: _business.company_name,
            company_email: _business.company_email,
            company_phone: _business.company_phone,
            company_fax: _business.company_fax,
            company_website: _business.company_website,
            company_logo: _business.company_logo,
            company_address: _business.company_address,
            company_district: _business.company_district,
            company_province: _business.company_province,
            tax_code: _business.tax_code,
            career_id: _business.career_id,
            price_recipe: 'FIFO',
            verify_with: 'PHONE',
            create_date: _business.create_date,
            creator_id: 1,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: 1,
            active: true,
        };
        req['body'] = _business;
        await businessService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        let business = await client
            .db(SDB)
            .collection('Business')
            .find({ business_id: { $in: req.body.business_id } })
            .toArray();
        const DBs = business.map((eBusiness) => {
            return eBusiness.database_name;
        });
        await client
            .db(SDB)
            .collection(`Business`)
            .deleteMany({ business_id: { $in: req.body.business_id } });
        await Promise.all(
            DBs.map((DB) => {
                return client.db(DB).dropDatabase();
            })
        );
        res.send({
            success: true,
            message: 'Xóa doanh nghiệp thành công!',
        });
    } catch (err) {
        next(err);
    }
};
