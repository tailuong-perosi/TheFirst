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
const { stringHandle } = require('../utils/string-handle');

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
// let user_id=0;
module.exports._checkBusiness = async (req, res, next) => {
    try {
        if (req.body.phone == undefined) throw new Error('400: Vui lòng truyền số điện thoại');

        var user = await client.db(SDB).collection('UsersEKT').findOne({
            phone: req.body.phone,
        });
        return res.send({ success: true, data: user });
    } catch (err) {
        next(err);
    }
    console.log(4);

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

module.exports._register = async (req, res, next) => {
    try {
        [ 'phone', 'email', 'password'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });

        req.body.prefix = stringHandle(req.body.phone, {
            removeUnicode: true,
            removeSpace: true,
            lowerCase: true,
        });
        req.body.phone = String(req.body.phone).trim().toLowerCase();
        req.body.password = bcrypt.hash(req.body.password);
        let userEKT = await client.db(SDB).collection('UsersEKT').findOne({ prefix: req.body.prefix });

        let user = await client
            .db(SDB)
            .collection('UsersEKT')
            .findOne({
                $or: [{ phone: req.body.phone }],
            });
        if (user) {
            throw new Error('400: Số điện thoại hoặc email đã được sử dụng!');
        }
        let otpCode = String(Math.random()).substr(2, 6);
        let verifyId = crypto.randomBytes(10).toString(`hex`);
        let verifyLink = `https://${req.body.prefix}.${process.env.DOMAIN}/verify-account?uid=${verifyId}`;
        let _verifyLink = {
            phone: req.body.phone,
            UID: String(verifyId),
            verify_link: verifyLink,
            verify_timelife: moment().tz(TIMEZONE).add(5, `minutes`).format(),
        };

        let verifyMessage = `[VIESOFTWARE] Mã OTP của quý khách là ${otpCode}`;
        sendSMS([req.body.phone], verifyMessage, 2, 'VIESOFTWARE');
        
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
            prefix: req.body.prefix,
            phone: req.body.phone,
            password: req.body.password,
            email: req.body.email,
            fullname: req.body.fullname,
            address: req.body.address,
            job: req.body.job,
            avatar: req.body.avatar || 'https://images.hdqwalls.com/download/doctor-strange-comic-hero-z5-2560x1600.jpg',
            phone: req.body.phone,
            active: false,
            otp_code: otpCode,
            otp_timelife: moment().tz(TIMEZONE).add(5, 'minutes').format(),
   
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
    console.log(1);

};

module.exports._login = async (req, res, next) => {
    try {
        // let shop = req.headers[`shop`];

        ['phone', 'password'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        // let [prefix, phone] = req.body.phone.split("_");
        var phone = req.body.phone;
        let user = await client.db(SDB).collection('UsersEKT').findOne({phone})
        // let user = await client.db(SDB).collection('UsersEKT').findOne({ prefix: shop.toLowerCase() });


        if (!user) {
            throw new Error(`404: Tài khoản không chính xác!`);
        }
        if (user.active == false) {
            throw new Error(`403: Tài khoản chưa được xác thực!`);
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
        
        // let user = await client.db(SDB).collection('UsersEKT').findOne({phone: req.params.user_phone})
        req.params.user_id = Number(req.params.user_id);
        let user = await client.db(req.user.database).collection('UsersEKT').findOne(req.params);
        console.log(1);
        
        if (!user) {
            throw new Error(`400: Người dùng không tồn tại!`);
        }
        delete req.body._id;
        delete req.body.user_id;
        delete req.body.code;
        delete req.body.phone;
        delete req.body.password;
        // delete req.body.fullname;
        // delete req.body.address;
        // delete req.body.job;
        

        let _user = { ...user, ...req.body };
        _user = {
            user_id: _user.user_id,
            code: _user.code,
            phone: _user.phone,
            password: _user.password,
            email: _user.email,
            avatar: _user.avatar,
            fullname: _user.fullname,
            address: _user.address,
            job: _user.job,

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
            .db(SDB)
            .collection(`UsersEKT`)
            .deleteMany({ user_id: { $in: req.params.user_id } });
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
        ['phone'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });

        const prefix = (req.headers && req.headers.shop) || false;
        let business = await (async () => {
            if (!prefix) {
                let result = client.db(SDB).collection('UsersEKT').findOne({ username: req.body.phone });
                return result;
            }
            let result = client.db(SDB).collection('UsersEKT').findOne({ prefix: prefix });
            return result;
        })();
        const DB =
            (business && business.database_name) ||
            (() => {
                throw new Error('400: Doanh nghiệp chưa được đăng ký!');
            })();

        let user = await client.db(SDB).collection('UsersEKT').findOne({ phone: req.body.phone });
        if (!user) {
            throw new Error('400: Tài khoản người dùng không tồn tại!');
        }
        let otpCode = String(Math.random()).substr(2, 6);
        let verifyMessage = `[VIESOFTWARE] Mã OTP của quý khách là ${otpCode}`;
        sendSMS([req.body.phone], verifyMessage, 2, 'VIESOFTWARE');
        await client
            .db(SDB)
            .collection(`UsersEKT`)
            .updateOne(
                { phone: req.body.phone },
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
    console.log(2);
};
module.exports._verifyOTP = async (req, res, next) => {
    try {
        ['phone', 'otp_code'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        const prefix = (req.headers && req.headers.shop) || false;
        
        let business = await (async () => {
            if (!prefix) {
                let result = client.db(SDB).collection('UsersEKT').findOne({ phone: req.body.phone });
                return result;
            }
            let result = client.db(SDB).collection('UsersEKT').findOne({ prefix: prefix });
            return result;
        })();
        
        let user = await client.db(SDB).collection('UsersEKT').findOne({ phone: req.body.phone });
        if (!user) {
            throw new Error('400: Tài khoản người dùng không tồn tại!');
        }
        if (req.body.otp_code != user.otp_code) {
            throw new Error('400: Mã xác thực không chính xác!');
        }
        if (user.active == false) {
            delete user.password;
            await client
                .db(SDB)
                .collection('UsersEKT')
                .updateOne(
                    { phone: req.body.phone },
                    {
                        $set: {
                            active: true,
                        },
                    }
                );
            
            let accessToken = await jwt.createToken({  _user: user }, 30 * 24 * 60 * 60);
            res.send({
                success: true,
                message: 'Kích hoạt tài khoản thành công!',
                data: { accessToken: accessToken },
            });
        } else {
            delete user.password;
            await client
                .db(SDB)
                .collection('UsersEKT')
                .updateOne({ phone: req.body.phone }, { $set: { otp_code: true, otp_timelife: true } });
            let accessToken = await jwt.createToken({  _user: user }, 30 * 24 * 60 * 60);
            res.send({
                success: true,
                message: `Mã OTP chính xác, xác thực thành công!`,
                data: { accessToken: accessToken },
            });
        }
    } catch (err) {
        next(err);
    }
    console.log(3);

};
module.exports._recoveryPassword = async (req, res, next) => {
    try {
        ['phone', 'password'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        
        let user = await client.db(SDB).collection('UsersEKT').findOne({ phone: req.body.phone });
        if (user.active != true) {
            throw new Error(`400: Tài khoản chưa được xác thực OTP!`);
        }
        await client
            .db(SDB)
            .collection('UsersEKT')
            .updateOne(
                { phone: req.body.phone },
                {
                    $set: {
                        password: bcrypt.hash(req.body.password),
                        otp_code: false,
                        otp_timelife: false,
                    },
                }
            );
        let _user = await client
            .db(SDB)
            .collection(`UsersEKT`)
            .findOne({phone: req.body.phone})
                
        delete _user.password;
        let accessToken = await jwt.createToken({ _user: user }, 30 * 24 * 60 * 60);
        res.send({
            success: true,
            message: 'Khôi phục mật khẩu thành công!',
            data: { accessToken: accessToken },
        });
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

            let userNew = await client
                .db(SDB)
                .collection(`UsersEKT`)
                .findOne({phone: req.body.phone})
            if (!userNew) return res.status(404).send({ success: false, message: 'Không tìm thấy người dùng này' });

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
