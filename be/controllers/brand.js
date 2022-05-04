const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const brandService = require(`../services/brand`);

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
        await brandService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toUpperCase();
        let brand = await client.db(req.user.database).collection(`Brands`).findOne({
            name: req.body.name,
        });
        if (brand) {
            throw new Error(`400: Thương hiệu đã tồn tại!`);
        }
        let brand_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Brands' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }
                return 0;
            });

        brand_id++;
        let _brand = {
            brand_id: brand_id,
            code: String(brand_id).padStart(6, '0'),
            name: req.body.name,
            priority: req.body.priority || 0,
            images: req.body.images || [],
            content: req.body.content || '',
            country_code: req.body.country_code || '',
            founder_year: req.body.founder_year || '',
            tags: req.body.tags || [],
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(String(req.body.name), true).toLowerCase(),
            slug_tags: (() => {
                if (req.body.tags && Array.isArray(req.body.tags) && req.body.tags.length > 0) {
                    return req.body.tags.map((tag) => {
                        return removeUnicode(String(tag), true).toLowerCase();
                    });
                }
                return [];
            })(),
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Brands' }, { $set: { name: 'Brands', value: brand_id } }, { upsert: true });
        req[`_insert`] = _brand;
        await brandService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.brand_id = Number(req.params.brand_id);
        req.body.name = String(req.body.name).trim().toUpperCase();
        let brand = await client.db(req.user.database).collection(`Brands`).findOne(req.params);
        if (!brand) {
            throw new Error(`400: Bài viết không tồn tại!`);
        }
        if (req.body.title) {
            let check = await client
                .db(req.user.database)
                .collection(`Brands`)
                .findOne({
                    brand_id: { $ne: brand.brand_id },
                    title: req.body.title,
                });
            if (check) {
                throw new Error(`400: Bài viết đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.business_id;
        delete req.body.brand_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _brand = { ...brand, ...req.body };
        _brand = {
            business_id: _brand.business_id,
            brand_id: _brand.brand_id,
            code: _brand.code,
            name: _brand.name,
            priority: _brand.priority,
            images: _brand.images,
            content: _brand.content,
            country_code: _brand.country_code,
            founder_year: _brand.founder_year,
            tags: _brand.tags,
            create_date: _brand.create_date,
            creator_id: _brand.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _brand.active,
            slug_name: removeUnicode(String(_brand.name), true).toLowerCase(),
            slug_tags: (() => {
                if (_brand.tags && Array.isArray(_brand.tags) && _brand.tags.length > 0) {
                    return _brand.tags.map((tag) => {
                        return removeUnicode(String(tag), true).toLowerCase();
                    });
                }
                return [];
            })(),
        };
        req['body'] = _brand;
        await brandService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Brands`)
            .deleteMany({ brand_id: { $in: req.body.brand_id } });
        res.send({
            success: true,
            message: 'Xóa thương hiệu thành công!',
        });
    } catch (err) {
        next(err);
    }
};
