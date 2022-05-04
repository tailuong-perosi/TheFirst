const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const blogService = require(`../services/blog`);

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
        await blogService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        ['title', 'content'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        req.body.title = String(req.body.title).trim().toUpperCase();
        let blog = await client.db(req.user.database).collection(`Blogs`).findOne({
            title: req.body.title,
        });
        if (blog) {
            throw new Error(`400: Bài viết đã tồn tại!`);
        }
        let blog_id = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Blogs' })
            .then((doc) => {
                if (doc) {
                    if (doc.value) {
                        return Number(doc.value);
                    }
                }
                return 0;
            });

        blog_id++;
        let _blog = {
            blog_id: blog_id,
            code: String(blog_id).padStart(6, '0'),
            title: req.body.title,
            blog_category_id: req.body.blog_category_id,
            images: req.body.images,
            content: req.body.content,
            tags: req.body.tags || [],
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_title: removeUnicode(String(req.body.title), true),
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
            .updateOne({ name: 'Blogs' }, { $set: { name: 'Blogs', value: blog_id } }, { upsert: true });
        req[`body`] = _blog;
        await blogService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.blog_id = Number(req.params.blog_id);
        req.body.title = String(req.body.title).trim().toUpperCase();
        let blog = await client.db(req.user.database).collection(`Blogs`).findOne(req.params);
        if (!blog) {
            throw new Error(`400: Bài viết không tồn tại!`);
        }
        if (req.body.title) {
            let check = await client
                .db(req.user.database)
                .collection(`Blogs`)
                .findOne({
                    business_id: req.user.business_id,
                    blog_id: { $ne: blog.blog_id },
                    title: req.body.title,
                });
            if (check) {
                throw new Error(`400: Đã tồn tại bài viết trùng tên!`);
            }
        }
        delete req.body._id;
        delete req.body.business_id;
        delete req.body.blog_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _blog = { ...blog, ...req.body };
        _blog = {
            business_id: _blog.business_id,
            blog_id: _blog.blog_id,
            code: _blog.code,
            title: _blog.title,
            blog_category_id: _blog.blog_category_id,
            images: _blog.images,
            content: _blog.content,
            tags: _blog.tags || [],
            create_date: _blog.create_date,
            creator_id: _blog.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: _blog.active,
            slug_title: removeUnicode(_blog.title),
            slug_tags: (() => {
                if (_blog.tags && Array.isArray(_blog.tags) && _blog.tags.length > 0) {
                    return _blog.tags.map((tag) => {
                        return removeUnicode(String(tag), true).toLowerCase();
                    });
                }
                return [];
            })(),
        };
        req['body'] = _blog;
        await blogService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection(`Blogs`)
            .deleteMany({ blog_id: { $in: req.body.blog_id } });
        res.send({
            success: true,
            message: 'Xóa bài viết thành công!',
        });
    } catch (err) {
        next(err);
    }
};
