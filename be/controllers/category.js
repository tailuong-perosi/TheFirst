const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const categoryService = require(`../services/category`);

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
        await categoryService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        req.body.name = String(req.body.name).trim().toUpperCase();
        let category = await client.db(req.user.database).collection(`Categories`).findOne({
            name: req.body.name,
        });
        if (category) {
            throw new Error(`400: Nhóm sản phẩm đã tồn tại!`);
        }
        let category_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Categories' })
            .then((doc) => {
                if (doc && doc.value) {
                    return Number(doc.value);
                }

                return 0;
            });
        category_id++;
        let _category = {
            category_id: category_id,
            code: String(category_id).padStart(6, '0'),
            name: req.body.name,
            parent_id: req.body.parent_id || 0,
            priority: req.body.priority || 1,
            image: req.body.image || [],
            description: req.body.description || '',
            default: req.body.default || false,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: removeUnicode(String(req.body.name), true).toLowerCase(),
            condition:req.body.condition || null,
        };
        if (req.body.products) {
            await client
                .db(req.user.database)
                .collection(`Products`)
                .updateMany({ product_id: { $in: products } }, { $set: { category_id: category_id } });
        }
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Categories' }, { $set: { name: 'Categories', value: category_id } }, { upsert: true });
        req[`body`] = _category;

        await categoryService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.category_id = Number(req.params.category_id);
        req.body.name = String(req.body.name).trim().toUpperCase();
        let category = await client.db(req.user.database).collection(`Categories`).findOne(req.params);
        if (!category) {
            throw new Error(`400: Nhóm sản phẩm không tồn tại!`);
        }
        if (req.body.name) {
            let check = await client
                .db(req.user.database)
                .collection(`Categories`)
                .findOne({
                    category_id: { $ne: category.category_id },
                    name: req.body.name,
                });
            if (check) {
                throw new Error(`400: Nhóm sản phẩm đã tồn tại!`);
            }
        }
        delete req.body._id;
        delete req.body.business_id;
        delete req.body.category_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _category = { ...category, ...req.body };
        _category = {
            category_id: _category.category_id,
            code: _category.code,
            name: _category.name,
            parent_id: _category.parent_id || 0,
            priority: _category.priority || 1,
            image: _category.image || [],
            description: _category.description || '',
            default: _category.default || false,
            create_date: _category.create_date,
            creator_id: _category.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _category.active,
            slug_name: removeUnicode(String(_category.name), true).toLowerCase(),
            condition:req.body.condition || null,
        };
        req['body'] = _category;
        await categoryService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Categories`)
            .deleteMany({ category_id: { $in: req.body.category_id } });
        res.send({
            success: true,
            message: 'Xóa bài viết thành công!',
        });
    } catch (err) {
        next(err);
    }
};
