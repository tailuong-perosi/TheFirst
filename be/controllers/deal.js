const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const dealService = require(`../services/deal`);

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
        await dealService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toUpperCase();
        let deal = await client.db(req.user.database).collection(`Deals`).findOne({
            name: req.body.name,
        });
        if (deal) {
            throw new Error(`400: Chương trình giảm giá đã tồn tại!`);
        }
        let deal_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Deals' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }
                return 0;
            });
        deal_id++;
        let _deal = {
            deal_id: deal_id,
            code: String(customer_id).padStart(6, '0'),
            name: req.body.name,
            type: String(req.body.type).trim().toUpperCase(),
            saleoff_type: String(req.body.saleoff_type).trim().toUpperCase(),
            saleoff_value: Number(req.body.saleoff_value || 0),
            max_saleoff_value: Number(req.body.max_saleoff_value || 0),
            image: req.body.image || [],
            image_list: (() => {
                if (slug_type == 'banner') {
                    return req.body.image_list || [];
                }
                return [];
            })(),
            category_list: (() => {
                if (slug_type == 'category') {
                    return req.body.category_list || [];
                }
                return [];
            })(),
            product_list: (() => {
                if (slug_type == 'product') {
                    return req.body.product_list || [];
                }
                return [];
            })(),
            start_time: moment(req.body.start_time).tz(TIMEZONE).format(),
            end_time: moment(req.body.end_time).tz(TIMEZONE).format(),
            description: req.body.description || '',
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(String(req.body.name), true).toLowerCase(),
            slug_type: removeUnicode(String(req.body.type), true).toLowerCase(),
            slug_saleoff_type: removeUnicode(String(req.body.saleoff_type), true).toLowerCase(),
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Deals' }, { $set: { name: 'Deals', value: deal_id } }, { upsert: true });
        req[`body`] = _deal;
        await dealService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.deal_id = Number(req.params.deal_id);
        let deal = await client.db(req.user.database).collection(`Deals`).findOne(req.params);
        if (!deal) {
            throw new Error(`400: Chương trình giảm giá không tồn tại!`);
        }
        if (req.body.name) {
            req.body.name = String(req.body.name).trim().toUpperCase();
            let check = await client
                .db(req.user.database)
                .collection(`Deals`)
                .findOne({
                    deal_id: { $ne: Number(deal.deal_id) },
                    name: req.body.name,
                });
            if (check) {
                throw new Error(`400: Chương trình giảm giá đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.deal_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _deal = { ...deal, ...req.body };
        _deal = {
            deal_id: _deal.deal_id,
            code: _deal.code,
            name: _deal.name,
            type: String(_deal.type).trim().toUpperCase(),
            saleoff_type: String(_deal.saleoff_type).trim().toUpperCase(),
            saleoff_value: Number(_deal.saleoff_value || 0),
            max_saleoff_value: Number(_deal.max_saleoff_value || 0),
            image: _deal.image || [],
            image_list: _deal.image_list,
            category_list: _deal.category_list,
            product_list: _deal.product_list,
            start_time: moment(_deal.start_time).tz(TIMEZONE).format(),
            end_time: moment(_deal.end_time).tz(TIMEZONE).format(),
            description: _deal.description || '',
            create_date: _deal.create_date,
            creator_id: _deal.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _deal.active,
            slug_name: removeUnicode(String(_deal.name), true).toLowerCase(),
            slug_type: removeUnicode(String(_deal.type), true).toLowerCase(),
            slug_saleoff_type: removeUnicode(String(_deal.saleoff_type), true).toLowerCase(),
        };
        req['body'] = _deal;
        await dealService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Deals`)
            .deleteMany({ deal_id: { $in: req.body.deal_id } });
        res.send({
            success: true,
            message: 'Xóa bài viết thành công!',
        });
    } catch (err) {
        next(err);
    }
};

module.exports._updateSaleOff = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection('Deals')
            .updateMany(
                { deal_id: { $in: req.body.deal_id } },
                { $set: { saleoff_value: Number(req.body.saleoff_value) } }
            );
        res.send({ success: true, data: 'Cập nhật giá ưu đãi thành công!' });
    } catch (err) {
        next(err);
    }
};
