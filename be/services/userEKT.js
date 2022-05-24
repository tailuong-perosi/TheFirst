const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const jwt = require(`../libs/jwt`);

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
        let aggregateQuery = [];
        // lấy các thuộc tính tìm kiếm cần độ chính xác cao ('1' == '1', '1' != '12',...)
        if (req.query.user_id) {
            aggregateQuery.push({ $match: { user_id: Number(req.query.user_id) } });
        }
        if (req.query.code) {
            aggregateQuery.push({ $match: { code: String(req.query.code) } });
        }
        
        let countQuery = [...aggregateQuery];
        aggregateQuery.push({ $sort: { create_date: -1 } });
        if (req.query.page && req.query.page_size) {
            let page = Number(req.query.page) || 1;
            let page_size = Number(req.query.page_size) || 50;
            aggregateQuery.push({ $skip: (page - 1) * page_size }, { $limit: page_size });
        }
        // lấy data từ database
        let [users, counts] = await Promise.all([
            client.db(DB).collection(`UsersEKT`).aggregate(aggregateQuery).toArray(),
            client
                .db(DB)
                .collection(`UsersEKT`)
                .aggregate([...countQuery, { $count: 'counts' }])
                .toArray(),
        ]);
        res.send({
            success: true,
            count: counts[0] ? counts[0].counts : 0,
            data: users,
        });
    } catch (err) {
        next(err);
    }
};

module.exports._getOne = async (req, res, next) => {
    try {
        // lấy data từ database
        let user = await client
            .db(DB)
            .collection(`UsersEKT`)
            .findOne({phone : req.params.user_phone})
        res.send({
            success: true,
            data: user,
        });
    } catch (err) {
        next(err);
    }
};
module.exports._create = async (req, res, next) => {
    try {
        let insert = await client.db(req.user.database).collection(`Users`).insertOne(req.body);
        if (!insert.insertedId) {
            throw new Error(`500: Tạo user thất bại!`);
        }
        delete req.body.password;
        try {
            let _action = {
                business_id: req.user?.business_id || req.body.user_id,
                type: 'Tạo',
                properties: 'Tài khoản',
                name: 'Tạo tài khoản',
                data: req.body,
                performer_id: req.user?.user_id || req.body.user_id,
                date: moment().tz(TIMEZONE).format(),
                slug_type: 'tao',
                slug_properties: 'taikhoan',
                name: 'taotaikhoan',
            };
            await Promise.all([client.db(req.user.database).collection(`Actions`).insertOne(_action)]);
        } catch (err) {
            console.log(err);
        }
        res.send({ success: true, data: req.body });
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
       
        await client.db(DB).collection(`UsersEKT`).updateOne(req.params, { $set: req.body });
        delete req.body.password;
        // try {
        //     let _action = {
        //         user_id: req.params.user_id,
        //         type: 'Cập nhật',
        //         properties: 'Tài khoản',
        //         name: 'Cập nhật tài khoản',
        //         data: req.body,
        //         date: moment().tz(TIMEZONE).format(),
        //         slug_type: 'capnhat',
        //         slug_properties: 'taikhoan',
        //         name: 'capnhattaikhoan',
        //     };
        //     await client.db(DB).collection(`Actions`).insertOne(_action);
        // } catch (err) {
        //     console.log(err);
        // }
        let [user] = await client
            .db(DB)
            .collection(`UsersEKT`)
            .aggregate([
                { $match: { phone: req.params.user_phone } },
            ])
            .toArray();
        delete user.password;
        let [accessToken] = await Promise.all([jwt.createToken(user, 24 * 60 * 60)]);
        res.send({ success: true, data: req.body, accessToken });
    } catch (err) {
        next(err);
    }
};

module.exports._getBusiness = async (req,res,next) =>{
    try {
        // let aggregateQuery = [];
        // // lấy các thuộc tính tìm kiếm cần độ chính xác cao ('1' == '1', '1' != '12',...)
        // if (req.query.user_phone) {
        //     aggregateQuery.push({ $match: { user_phone: Number(req.query.user_phone) } });
        // }    
        let staff = await client.db(DB).collection('Staff').find({user_phone : req.params.user_phone}).toArray()
        res.send({
            success: true,
            data: staff,
        })
    } catch (error) {
        next(error)
    }
}