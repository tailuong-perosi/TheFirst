const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const SDB = process.env.DATABASE; // System Database
const jwt = require(`../libs/jwt`);

const crypto = require('crypto');
const bcrypt = require(`../libs/bcrypt`);
const mail = require(`../libs/nodemailer`);
const { otpMail } = require('../templates/otpMail');
const { verifyMail } = require('../templates/verifyMail');
const { sendSMS } = require('../libs/sendSMS');

const UserEKTService = require(`../services/userEKT`);

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
let user_id=0;

module.exports._register = async (req, res, next) => {
    try {
        req.body.username = String(req.body.username).trim().toLowerCase();
        req.body.password = bcrypt.hash(req.body.password);
        let user = await client
            .db(SDB)
            .collection('UsersEKT')
            .findOne({
                $or: [{ username: req.body.username }],
            });
        if (user) {
            throw new Error('400: Số điện thoại hoặc email đã được sử dụng!');
        }
        let [user_id] = await Promise.all([
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
                })
            ])
        user_id++;
        let _user = {
            user_id: user_id,
            code: String(user_id).padStart(6, '0'),
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            phone: req.body.phone,
            // avatar: req.body.avatar,
            // first_name: req.body.first_name,
            // last_name: req.body.last_name,
            // name: req.body.first_name || '' + req.body.last_name || '',
            // birth_day: req.body.birth_day,
            // address: req.body.address,
            // district: req.body.district,
            // store_id: req.body.store_id,
            // last_login: moment().tz(TIMEZONE).format(),
            // create_date: moment().tz(TIMEZONE).format(),
            // creator_id: req.user.user_id,
            // last_update: moment().tz(TIMEZONE).format(),
            // updater_id: req.user.user_id,
            // active: true,
            // slug_name: removeUnicode(`${req.body.first_name}${req.body.last_name}`, true).toLowerCase(),
            // slug_address: removeUnicode(`${req.body.address}`, true).toLowerCase(),
            // slug_district: removeUnicode(`${req.body.district}`, true).toLowerCase(),
            // slug_province: removeUnicode(`${req.body.province}`, true).toLowerCase(),
        };
        await client
            .db(SDB)
            .collection('UsersEKT')
            .insertOne(_user),
        await client
        .db(SDB)
        .collection('AppSetting')
        .updateOne({ name: 'Users' }, { $set: { name: 'Users', value: user_id } }, { upsert: true })
        res.send({success: true,data: _user});
    }catch (err) {
        next(err);
    }

};

module.exports._login = async (req, res, next) => {
    try {
        ['username', 'password'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        // let [prefix, username] = req.body.username.split("_");
        var username = req.body.username;
        let user = await client.db(SDB).collection('UsersEKT').findOne({username})

        if (!user) {
            throw new Error(`404: Tài khoản không chính xác!`);
        }
        if (!bcrypt.compare(req.body.password, user.password)) {
            res.send({ success: false, message: `Mật khẩu không chính xác!` });
            return;
        }
        delete user.password;
        let [accessToken, _update] = await Promise.all([
            jwt.createToken({ ...user, database: SDB, _user: user }, 30 * 24 * 60 * 60),
            client
                .db(SDB)
                .collection(`UsersEKT`)
                .updateOne({ user_id: Number(user.user_id) }, { $set: { last_login: moment().tz(TIMEZONE).format() } }),
        ]);
        res.send({ success: true, data: { accessToken } });
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.user_id = Number(req.params.user_id);
        let user = await client.db(SDB).collection('UsersEKT').findOne(req.params);
        if (!user) {
            throw new Error(`400: Người dùng không tồn tại!`);
        }
        delete req.body._id;
        delete req.body.user_id;
        delete req.body.code;
        delete req.body.username;
        delete req.body.password;

        let _user = { ...user, ...req.body };
        _user = {
            user_id: _user.user_id,
            code: _user.code,
            username: _user.username,
            password: _user.password,
            email: _user.email,
            phone: _user.phone,
            // avatar: _user.avatar,
            // first_name: _user.first_name,
            // last_name: _user.last_name,
            // birth_day: _user.birth_day,
            // address: _user.address,
            // district: _user.district,
            // province: _user.province,
            // branch_id: _user.branch_id,
            // store_id: _user.store_id,
            // last_login: _user.last_login,
            // create_date: _user.create_date,
            // creator_id: _user.creator_id,
            // last_update: moment().tz(TIMEZONE).format(),
            // updater_id: req.user.user_id,
            // active: _user.active,
            // slug_name: removeUnicode(`${req.body.first_name}${req.body.last_name}`, true).toLowerCase(),
            // slug_address: removeUnicode(`${req.body.address}`, true).toLowerCase(),
            // slug_district: removeUnicode(`${req.body.district}`, true).toLowerCase(),
            // slug_province: removeUnicode(`${req.body.province}`, true).toLowerCase(),
        };
        req['body'] = _user;
        await UserEKTService._update(req, res, next);
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
        res.send({
            success: true,
            message: 'Xóa người dùng thành công!',
        });
    } catch (err) {
        next(err);
    }
};

module.exports._getUser = async(req,res,next)=>{
    try {
        await UserEKTService._get(req, res, next);
    } catch (err) {
        next(err);
    }
}
module.exports._getOne = async(req,res,next)=>{
    try {
        await UserEKTService._getOne(req, res, next);
    } catch (err) {
        next(err);
    }
}
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
