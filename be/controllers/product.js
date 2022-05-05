const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const productService = require(`../services/product`);

const XLSX = require('xlsx');
const { stringHandle } = require('../utils/string-handle');

let removeUnicode = (text, removeSpace) => {
    /*
        string là chuỗi cần remove unicode
        trả về chuỗi ko dấu tiếng việt ko khoảng trắng
    */
    if (typeof text != 'string') {
        throw new Error('Type of text input must be string!');
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
        await productService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        ['products'].map((e) => {
            if (!req.body[e]) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        [req.body] = req.body.products;

        let productMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Products' });
        let productId = (productMaxId && productMaxId.value) || 0;
        let attributeMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Attributes' });
        let attributeId = (attributeMaxId && attributeMaxId.value) || 0;
        let variantMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Variants' });
        let variantId = (variantMaxId && variantMaxId.value) || 0;
        let locationMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Locations' });
        let locationId = (locationMaxId && locationMaxId.value) || 0;
        let inventoryMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Inventories' });
        let inventoryId = (inventoryMaxId && inventoryMaxId.value) || 0;
        let supplier = await client
            .db(req.user.database)
            .collection('Suppliers')
            .findOne({ supplier_id: Number(req.body.supplier_id) });

        if (req.body.sku == undefined) throw new Error('400: Vui lòng truyền mã định danh sản phẩm (SKU)');
        var productAlready = await client.db(req.user.database).collection('Products').findOne({
            sku: req.body.sku,
        });
        if (productAlready != undefined) throw new Error(`400: Mã định danh sản phẩm (SKU) ${req.body.sku} đã tồn tại`);
        req['_product'] = {
            product_id: ++productId,
            code: String(productId).padStart(6, '0'),
            sku: req.body.sku,
            images: req.body.images || [],
            name: req.body.name,
            slug: stringHandle(req.body.name, { createSlug: true }),
            supplier_id: req.body.supplier_id || [],
            category_id: req.body.category_id || [],
            tax_id: req.body.tax_id || [],
            warranties: req.body.warranties || [],
            length: req.body.length || 0,
            width: req.body.width || 0,
            height: req.body.height || 0,
            weight: req.body.weight || 0,
            unit: req.body.unit || '',
            brand_id: req.body.brand_id || '',
            origin_code: req.body.origin_code || '',
            status: req.body.status || '',
            description: req.body.description || '',
            tags: req.body.tags || [],
            files: req.body.files || [],
            sale_quantity: req.body.sale_quantity || 0,
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            active: true,
            slug_name: stringHandle(req.body.name, { createSlug: true }),
            slug_tags: (() => {
                if (req.body.tags) {
                    req.body.tags.map((tag) => {
                        return stringHandle(tag, { createSlug: true });
                    });
                }
                return [];
            })(),
        };
        req['_attributes'] = [];
        if (Array.isArray(req.body.attributes) && req.body.attributes.length > 0) {
            req.body.attributes.map((eAttribute) => {
                if (eAttribute) {
                    req._attributes.push({
                        attribute_id: ++attributeId,
                        code: String(attributeId).padStart(6, '0'),
                        product_id: productId,
                        option: eAttribute.option,
                        values: eAttribute.values,
                        create_date: moment().tz(TIMEZONE).format(),
                        creator_id: req.user.user_id,
                        last_update: moment().tz(TIMEZONE).format(),
                        updater_id: req.user.user_id,
                        active: true,
                        slug_option: stringHandle(eAttribute.option, { createSlug: true }),
                        slug_values: (() => {
                            return eAttribute.values.map((eValue) => {
                                return stringHandle(eValue, { createSlug: true });
                            });
                        })(),
                    });
                }
            });}
        // } else {
        //     throw new Error('400: Sản phẩm chưa có thuộc tính!');
        // }
        req['_variants'] = [];
        req['_locations'] = [];
        if (Array.isArray(req.body.variants) && req.body.variants.length > 0) {
            req.body.variants.map((eVariant) => {
                if (eVariant) {
                    req._variants.push({
                        variant_id: ++variantId,
                        code: String(variantId).padStart(6, '0'),
                        product_id: productId,
                        title: eVariant.title,
                        sku: eVariant.sku,
                        image: eVariant.image || [],
                        options: eVariant.options || [],
                        ...(() => {
                            if (eVariant.options && eVariant.options > 0) {
                                let options = {};
                                for (let i = 0; i <= eVariant.options; i++) {
                                    options[`option${i + 1}`] = eVariant.options[i];
                                }
                                return options;
                            }
                            return {};
                        })(),
                        supplier: (() => {
                            if (supplier && supplier.name) {
                                return supplier.name;
                            }
                            return '';
                        })(),
                        import_price_default: eVariant.import_price || 0,
                        price: eVariant.price,
                        enable_bulk_price: eVariant.enable_bulk_price || false,
                        bulk_prices: eVariant.bulk_prices,
                        create_date: moment().tz(TIMEZONE).format(),
                        creator_id: req.user.user_id,
                        last_update: moment().tz(TIMEZONE).format(),
                        updater_id: req.user.user_id,
                        active: true,
                        slug_title: stringHandle(eVariant.title, { createSlug: true }),
                    });
                    if (eVariant.locations) {
                        eVariant.locations.map((eLocation) => {});
                    }
                }
            });
        } else {
            throw new Error('400: Sản phẩm chưa có phiên bản!');
        }
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Products' }, { $set: { name: 'Products', value: productId } }, { upsert: true });
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Attributes' }, { $set: { name: 'Attributes', value: attributeId } }, { upsert: true });
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Variants' }, { $set: { name: 'Variants', value: variantId } }, { upsert: true });
        await productService._create(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        req.params.product_id = Number(req.params.product_id);
        let [product] = await client
            .db(req.user.database)
            .collection('Products')
            .aggregate([
                { $match: { product_id: Number(req.params.product_id) } },
                {
                    $lookup: {
                        from: 'Attributes',
                        let: { productId: '$product_id' },
                        pipeline: [{ $match: { $expr: { $eq: ['$product_id', '$$productId'] } } }],
                        as: 'attributes',
                    },
                },
                {
                    $lookup: {
                        from: 'Variants',
                        let: { productId: '$product_id' },
                        pipeline: [{ $match: { $expr: { $eq: ['$product_id', '$$productId'] } } }],
                        as: 'variants',
                    },
                },
            ])
            .toArray();
        if (!product) {
            throw new Error('400: Sản phẩm không tồn tại!');
        }
        let supplier = await client.db(req.user.database).collection('Suppliers').findOne({ supplier_id: product.supplier_id });
        if (!supplier) {
            throw new Error(`400: Nhà sản xuất không tồn tại!`);
        }
        let attributeMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Attributes' });
        let attributeId = (attributeMaxId && attributeMaxId.value) || 0;
        let variantMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Variants' });
        let variantId = (variantMaxId && variantMaxId.value) || 0;
        delete req.body._id;
        delete req.body.product_id;
        delete req.body.code;
        delete req.body.sale_quantity;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _product = { ...product, ...req.body };
        _product = {
            product_id: _product.product_id,
            code: _product.code,
            name: _product.name,
            sku: _product.sku,
            slug: stringHandle(_product.name, { createSlug: true }),
            supplier_id: _product.supplier_id || 0,
            category_id: _product.category_id || [],
            tax_id: _product.tax_id || [],
            warranties: _product.warranties || [],
            image: _product.image || [],
            length: _product.length || 0,
            width: _product.width || 0,
            height: _product.height || 0,
            weight: _product.weight || 0,
            unit: _product.unit || '',
            brand_id: _product.brand_id || 0,
            origin_code: _product.origin_code || '',
            status: _product.status || '',
            description: _product.description || '',
            tags: _product.tags || [],
            files: _product.files || [],
            sale_quantity: _product.sale_quantity || 0,
            create_date: _product.create_date,
            last_update: moment().tz(TIMEZONE).format(),
            creator_id: _product.creator_id,
            active: _product.active,
            slug_name: stringHandle(_product.name, { createSlug: true }),
            slug_tags: (() => {
                if (_product.tags) {
                    return _product.tags.map((tag) => {
                        return stringHandle(tag, { createSlug: true });
                    });
                }
            })(),
        };
        req['_product'] = _product;
        let _attributes = {};
        product.attributes.map((eAttribute) => {
            _attributes[eAttribute.attribute_id] = eAttribute;
        });
        let insertAttributes = [];
        let updateAttributes = [];
        if (req.body.attributes) {
            for (let i in req.body.attributes) {
                let _attribute = { ...req.body.attributes[i] };
                if (!_attribute.attribute_id) {
                    insertAttributes.push({
                        attribute_id: ++attributeId,
                        code: String(attributeId).padStart(6, '0'),
                        product_id: product.product_id,
                        option: _attribute.option,
                        values: _attribute.values,
                        create_date: moment().tz(TIMEZONE).format(),
                        creator_id: req.user.user_id,
                        last_update: moment().tz(TIMEZONE).format(),
                        updater_id: req.user.updater_id,
                        active: true,
                        slug_option: stringHandle(_attribute.option, { createSlug: true }),
                        slug_values: (() => _attribute.values.map((eValue) => stringHandle(eValue, { createSlug: true })))(),
                    });
                } else {
                    updateAttributes.push({
                        attribute_id: _attribute.attribute_id,
                        code: _attribute.code,
                        product_id: _attribute.product_id,
                        option: _attribute.option,
                        values: _attribute.values,
                        create_date: _attribute.create_date,
                        creator_id: _attribute.creator_id,
                        last_update: moment().tz(TIMEZONE).format(),
                        updater_id: req.user.updater_id,
                        active: true,
                        slug_option: stringHandle(_attribute.option, { createSlug: true }),
                        slug_values: (() => _attribute.values.map((eValue) => stringHandle(eValue, { createSlug: true })))(),
                    });
                }
            }
        }
        let insertVariants = [];
        let updateVariants = [];
        if (req.body.variants) {
            for (let i in req.body.variants) {
                let _variant = { ...req.body.variants[i] };
                if (!_variant.variant_id) {
                    insertVariants.push({
                        variant_id: ++variantId,
                        code: String(variantId).padStart(6, '0'),
                        product_id: product.product_id,
                        title: String(_variant.title).toUpperCase(),
                        sku: String(_variant.sku).toUpperCase(),
                        image: _variant.image || [],
                        options: _variant.options || [],
                        ...(() => {
                            if (_variant.options && _variant.options > 0) {
                                let options = {};
                                for (let i = 0; i <= _variant.options; i++) {
                                    options[`option${i + 1}`] = _variant.options[i];
                                }
                                return options;
                            }
                            return {};
                        })(),
                        supplier: ((supplier) => {
                            if (supplier && supplier.name) {
                                return supplier.name;
                            }
                            return '';
                        })(supplier),
                        import_price_default: _variant.import_price || 0,
                        price: _variant.price,
                        enable_bulk_price: _variant.enable_bulk_price || false,
                        bulk_prices: _variant.bulk_prices,
                        create_date: moment().tz(TIMEZONE).format(),
                        creator_id: req.user.user_id,
                        last_update: moment().tz(TIMEZONE).format(),
                        updater_id: req.user.user_id,
                        active: true,
                        slug_title: removeUnicode(String(eVariant.title), true).toLowerCase(),
                    });
                } else {
                    updateVariants.push({
                        variant_id: _variant.variant_id,
                        code: _variant.code,
                        product_id: _variant.product_id,
                        title: _variant.title,
                        sku: _variant.sku,
                        image: _variant.image || [],
                        options: _variant.options || [],
                        ...(() => {
                            if (_variant.options && _variant.options > 0) {
                                let options = {};
                                for (let i = 0; i <= _variant.options; i++) {
                                    options[`option${i + 1}`] = _variant.options[i];
                                }
                                return options;
                            }
                            return {};
                        })(),
                        supplier: ((supplier) => {
                            if (supplier && supplier.name) {
                                return supplier.name;
                            }
                            return '';
                        })(supplier),
                        import_price_default: _variant.import_price || 0,
                        price: _variant.price,
                        enable_bulk_price: _variant.enable_bulk_price || false,
                        bulk_prices: _variant.bulk_prices,
                        create_date: _variant.create_date,
                        creator_id: _variant.creator_id,
                        last_update: moment().tz(TIMEZONE).format(),
                        updater_id: req.user.user_id,
                        active: true,
                        slug_title: stringHandle(_variant.title, { createSlug: true }),
                    });
                }
            }
        }
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Attributes' }, { $set: { name: 'Attributes', value: attributeId } }, { upsert: true });
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Variants' }, { $set: { name: 'Variants', value: variantId } }, { upsert: true });

        await client.db(req.user.database).collection('Products').updateOne({ product_id: _product.product_id }, { $set: _product });
        if (insertAttributes.length > 0) {
            await client.db(req.user.database).collection('Attributes').insertMany(insertAttributes);
        }
        if (updateAttributes.length > 0) {
            for (let i in updateAttributes) {
                delete updateAttributes[i]._id;
                await client
                    .db(req.user.database)
                    .collection('Attributes')
                    .updateOne({ attribute_id: updateAttributes[i].attribute_id }, { $set: updateAttributes[i] });
            }
        }
        if (insertVariants.length > 0) {
            await client.db(req.user.database).collection('Variants').insertMany(insertVariants);
        }
        if (updateVariants.length > 0) {
            for (let i in updateVariants) {
                delete updateVariants[i]._id;
                await client
                    .db(req.user.database)
                    .collection('Variants')
                    .updateOne({ variant_id: updateVariants[i].variant_id }, { $set: updateVariants[i] });
            }
        }
        res.send({ success: true, data: 'Update success!' });
    } catch (err) {
        next(err);
    }
};

module.exports.deleteProductC = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection('Products')
            .deleteMany({ product_id: { $in: req.body.product_id } });
        await client
            .db(req.user.database)
            .collection('Attributes')
            .deleteMany({ product_id: { $in: req.body.product_id } });
        await client
            .db(req.user.database)
            .collection('Variants')
            .deleteMany({ product_id: { $in: req.body.product_id } });
        await client
            .db(req.user.database)
            .collection('Locations')
            .deleteMany({ product_id: { $in: req.body.product_id } });
        await client
            .db(req.user.database)
            .collection('Inventories')
            .deleteMany({ product_id: { $in: req.body.product_id } });
        await client
            .db(req.user.database)
            .collection('Feedbacks')
            .deleteMany({ product_id: { $in: req.body.product_id } });
        res.send({ success: true, message: 'Xóa sản phẩm thành công!' });
    } catch (err) {
        next(err);
    }
};

module.exports.getAllAtttributeC = async (req, res, next) => {
    try {
        await productService._getAllAttributes(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports.getAllUnitProductC = async (req, res, next) => {
    try {
        await productService.getAllUnitProductS(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports.addFeedbackC = async (req, res, next) => {
    try {
        let _feedback = new Feedback();
        let feedbackMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Feedbacks' });
        let feedback_id = (() => {
            if (feedbackMaxId) {
                if (feedbackMaxId.value) {
                    return Number(feedbackMaxId.value);
                }
            }
            return 0;
        })();
        feedback_id++;
        _feedback.create({
            ...req.body,
            feedback_id: Number(feedback_id),
            create_date: new Date(),
        });
        req['_insert'] = _feedback;
        await productService.addFeedbackS(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports.deleteFeedbackC = async (req, res, next) => {
    try {
        let feedback_ids = req.query.feedback_id.split('---').map((id) => {
            return Number(id);
        });
        await client
            .db(req.user.database)
            .collection('Feedbacks')
            .deleteMany({ feedback_id: { $in: feedback_ids } });
        res.send({ success: true, message: 'Xóa phản hồi thành công!' });
    } catch (err) {
        next(err);
    }
};

module.exports.importFileC = async (req, res, next) => {
    try {
        if (req.file == undefined) {
            throw new Error('400: Vui lòng truyền file!');
        }
        let excelData = XLSX.read(req.file.buffer, {
            type: 'buffer',
            cellDates: true,
        });
        let rows = XLSX.utils.sheet_to_json(excelData.Sheets[excelData.SheetNames[0]]);
        let productSkus = [];
        let categorySlugs = [];
        let supplierSlugs = [];
        let taxSlugs = [];
        let warrantySlugs = [];
        let brandSlugs = [];
        let originSlugs = [];
        rows = rows.map((eRow) => {
            let _row = {};
            let count = 0;
            let optionRequire = ['ma-san-pham', 'ten-san-pham', 'nha-cung-cap', 'ma-phien-ban', 'ten-phien-ban', 'gia-ban'];
            for (let i in eRow) {
                let field = stringHandle(i, { removeStringInBrackets: 'round', createSlug: true });
                if (optionRequire.includes(field)) {
                    count++;
                }
                _row[field] = eRow[i];
            }
            if (count < optionRequire.length) {
                throw new Error(`400: Các thuộc tính có dấu (*) là thuộc tính bắt buộc!`);
            }
            if (_row['ten-san-pham']) {
                _row['_ten-san-pham'] = stringHandle(_row['ten-san-pham'], { createSlug: true });
                productSkus.push(_row['ma-san-pham']);
                if (_row['ten-phien-ban']) {
                    _row['_ten-phien-ban'] = stringHandle(_row['ten-phien-ban'], { createSlug: true });
                }
            }
            if (_row['ten-danh-muc']) {
                _row['_ten-danh-muc'] = stringHandle(_row['ten-danh-muc'], { createSlug: true });
                categorySlugs.push(_row['_ten-danh-muc']);
            }
            if (_row['nha-cung-cap']) {
                _row['_nha-cung-cap'] = stringHandle(String(_row['nha-cung-cap']), { createSlug: true });
                supplierSlugs.push(_row['_nha-cung-cap']);
            }
            if (_row['thue-ap-dung']) {
                _row['_thue-ap-dung'] = _row['thue-ap-dung'].split('-').map((eTax) => {
                    let tax = stringHandle(eTax, { createSlug: true });
                    taxSlugs.push(tax);
                    return tax;
                });
            }
            if (_row['chuong-trinh-bao-hanh']) {
                _row['_chuong-trinh-bao-hanh'] = _row['chuong-trinh-bao-hanh'].split('-').map((eWaranty) => {
                    let warranty = stringHandle(eWaranty, { createSlug: true });
                    warrantySlugs.push(warranty);
                    return warranty;
                });
            }
            if (_row['ten-thuong-hieu']) {
                _row['_ten-thuong-hieu'] = stringHandle(_row['ten-thuong-hieu'], { createSlug: true });
                brandSlugs.push(_row['_ten-thuong-hieu']);
            }
            if (_row['noi-xuat-xu']) {
                _row['_noi-xuat-xu'] = stringHandle(_row['noi-xuat-xu'], { createSlug: true });
                originSlugs.push(_row['_noi-xuat-xu']);
            }
            return _row;
        });
        productSkus = [...new Set(productSkus)];
        categorySlugs = [...new Set(categorySlugs)];
        supplierSlugs = [...new Set(supplierSlugs)];
        taxSlugs = [...new Set(taxSlugs)];
        warrantySlugs = [...new Set(warrantySlugs)];
        brandSlugs = [...new Set(brandSlugs)];
        originSlugs = [...new Set(originSlugs)];
        let products = await client
            .db(req.user.database)
            .collection('Products')
            .find({
                sku: { $in: productSkus },
            })
            .toArray();
        let _products = products.reduce((pre, cur) => ({ ...pre, ...(cur && cur.sku && { [cur.sku]: cur }) }), {});
        let categories = await client
            .db(req.user.database)
            .collection('Categories')
            .find({
                slug_name: { $in: categorySlugs },
            })
            .toArray();
        let _categories = categories.reduce((pre, cur) => ({ ...pre, ...(cur && cur.slug_name && { [cur.slug_name]: cur }) }), {});
        let suppliers = await client
            .db(req.user.database)
            .collection('Suppliers')
            .find({
                slug_name: { $in: supplierSlugs },
            })
            .toArray();
        let _suppliers = suppliers.reduce((pre, cur) => ({ ...pre, ...(cur && cur.slug_name && { [cur.slug_name]: cur }) }), {});
        let taxes = await client
            .db(req.user.database)
            .collection('Taxes')
            .find({
                slug_name: { $in: taxSlugs },
            })
            .toArray();
        let _taxes = taxes.reduce((pre, cur) => ({ ...pre, ...(cur && cur.slug_name && { [cur.slug_name]: cur }) }), {});
        let warranties = await client
            .db(req.user.database)
            .collection('Warranties')
            .find({
                slug_name: { $in: warrantySlugs },
            })
            .toArray();
        let _warranties = warranties.reduce((pre, cur) => ({ ...pre, ...(cur && cur.slug_name && { [cur.slug_name]: cur }) }), {});
        let brands = await client
            .db(req.user.database)
            .collection('Brands')
            .find({
                slug_name: { $in: brandSlugs },
            })
            .toArray();
        let _brands = brands.reduce((pre, cur) => ({ ...pre, ...(cur && cur.slug_name && { [cur.slug_name]: cur }) }), {});
        let origins = await client
            .db(req.user.database)
            .collection('Origins')
            .find({
                slug_name: { $in: originSlugs },
            })
            .toArray();
        let _origins = origins.reduce((pre, cur) => ({ ...pre, ...(cur && cur.slug_name && { [cur.slug_name]: cur }) }), {});
        let productId = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Products' })
            .then((doc) => (doc && doc.value) || 0);
        let attributeId = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Attributes' })
            .then((doc) => (doc && doc.value) || 0);
        let variantId = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Variants' })
            .then((doc) => (doc && doc.value) || 0);
        let supplierId = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Suppliers' })
            .then((doc) => (doc && doc.value) || 0);
        let categoryId = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Categories' })
            .then((doc) => (doc && doc.value) || 0);
        let brandId = await client
            .db(req.user.database)
            .collection('AppSetting')
            .findOne({ name: 'Brands' })
            .then((doc) => (doc && doc.value) || 0);
        let insertSuppliers = [];
        let insertCategories = [];
        let insertBrands = [];
        let _insertProducts = {};
        let _insertAttributes = {};
        let _insertVariants = {};
        rows.map((eRow) => {
            if (eRow['ma-san-pham']) {
                if (eRow['_nha-cung-cap'] && !_suppliers[eRow['_nha-cung-cap']]) {
                    let _supplier = {
                        supplier_id: ++supplierId,
                        code: String(supplierId).padStart(6, '0'),
                        name: eRow['nha-cung-cap'],
                        logo: '',
                        phone: '',
                        email: '',
                        address: '',
                        district: '',
                        province: '',
                        create_date: moment().tz(TIMEZONE).format(),
                        creator_id: req.user.user_id,
                        last_update: moment().tz(TIMEZONE).format(),
                        updater_id: req.user.user_id,
                        active: true,
                        slug_name: eRow['_nha-cung-cap'],
                        slug_address: '',
                        slug_district: '',
                        slug_province: '',
                    };
                    insertSuppliers.push(_supplier);
                    _suppliers[eRow['_nha-cung-cap']] = _supplier;
                }
                if (eRow['_ten-danh-muc'] && !_categories[eRow['_ten-danh-muc']]) {
                    let _category = {
                        category_id: ++categoryId,
                        code: String(categoryId).padStart(6, '0'),
                        name: eRow['ten-danh-muc'],
                        parent_id: -1,
                        priority: '',
                        image: '',
                        description: '',
                        default: '',
                        create_date: moment().tz(TIMEZONE).format(),
                        creator_id: req.user.user_id,
                        last_update: moment().tz(TIMEZONE).format(),
                        updater_id: req.user.user_id,
                        active: true,
                        slug_name: eRow['_ten-danh-muc'],
                    };
                    insertCategories.push(_category);
                    _categories[eRow['_ten-danh-muc']] = _category;
                }
                if (eRow['_ten-thuong-hieu'] && !_brands[eRow['_ten-thuong-hieu']]) {
                    let _brand = {
                        brand_id: ++brandId,
                        code: String(brandId).padStart(6, '0'),
                        name: String(eRow['ten-thuong-hieu']).trim().toUpperCase(),
                        priority: 1,
                        images: [],
                        country_code: '',
                        founded_year: '',
                        content: '',
                        tags: [],
                        create_date: moment().tz(TIMEZONE).format(),
                        creator_id: req.user.user_id,
                        last_update: moment().tz(TIMEZONE).format(),
                        updater_id: req.user.user_id,
                        active: true,
                        slug_name: eRow['_ten-thuong-hieu'],
                        slug_tags: [],
                    };
                    insertBrands.push(_brand);
                    _brands[eRow['_ten-thuong-hieu']] = _brand;
                }
                if (!_products[eRow['ma-san-pham']]) {
                    if (!_insertProducts[eRow['ma-san-pham']]) {
                        _insertProducts[eRow['ma-san-pham']] = {
                            product_id: ++productId,
                            code: String(productId).padStart(6, '0'),
                            sku: eRow['ma-san-pham'],
                            name: eRow['ten-san-pham'],
                            images: (() => {
                                if (eRow['hinh-anh']) {
                                    return eRow['hinh-anh'].split(',');
                                }
                                return [];
                            })(),
                            slug: eRow['_ten-san-pham'] + `-${productId}`,
                            supplier_id: (_suppliers[eRow['_nha-cung-cap']] && _suppliers[eRow['_nha-cung-cap']].supplier_id) || 0,
                            category_id: [(_categories[eRow['_ten-danh-muc']] && _categories[eRow['_ten-danh-muc']].category_id) || 0],
                            tax_id: (() => {
                                let result = [];
                                if (eRow['_thue-ap-dung']) {
                                    eRow['_thue-ap-dung'].map((taxSlug) => {
                                        result.push((_taxes[taxSlug] && _taxes[taxSlug].tax_id) || 0);
                                    });
                                }
                                result = [...new Set(result)];
                                return result;
                            })(),
                            warranties: (() => {
                                let result = [];
                                if (eRow['_chuong-trinh-bao-hanh']) {
                                    eRow['_chuong-trinh-bao-hanh'].map((warrantySlug) => {
                                        result.push((_warranties[warrantySlug] && _warranties[warrantySlug].warranty_id) || 0);
                                    });
                                }
                                result = [...new Set(result)];
                                return [];
                            })(),
                            length:
                                (!isNaN(Number(eRow['chieu-dai'])) && Number(eRow['chieu-dai'])) ||
                                (() => {
                                    return 0;
                                    throw new Error('400: Chiều dài không hợp lệ');
                                })(),
                            width:
                                (!isNaN(Number(eRow['chieu-rong'])) && Number(eRow['chieu-rong'])) ||
                                (() => {
                                    return 0;
                                    throw new Error('400: Chiều rộng không hợp lệ');
                                })(),
                            height:
                                (!isNaN(Number(eRow['chieu-cao'])) && Number(eRow['chieu-cao'])) ||
                                (() => {
                                    return 0;
                                    throw new Error('400: Chiều cao không hợp lệ');
                                })(),
                            weight:
                                (!isNaN(Number(eRow['khoi-luong'])) && Number(eRow['khoi-luong'])) ||
                                (() => {
                                    return 0;
                                    throw new Error('400: Khối lượng không hợp lệ');
                                })(),
                            unit: eRow['don-vi'] || '',
                            brand_id: (_brands[eRow['_ten-thuong-hieu']] && _brands[eRow['_ten-thuong-hieu']].brand_id) || 0,
                            origin_code: (_origins[eRow['_noi-xuat-xu']] && _origins[eRow['_noi-xuat-xu']].origin_code) || '',
                            status: eRow['tinh-trang'] || '',
                            description: eRow['mo-ta'] || '',
                            tags: (() => {
                                if (eRow['tags']) {
                                    return eRow['tags'].split(',');
                                }
                                return [];
                            })(),
                            files: [],
                            sale_quantity: 0,
                            create_date: moment().tz(TIMEZONE).format(),
                            creator_id: Number(req.user.user_id),
                            last_update: moment().tz(TIMEZONE).format(),
                            updater_id: req.user.user_id,
                            active: true,
                            slug_name: eRow['_ten-san-pham'],
                            slug_tags: (() => {
                                if (eRow['tags']) {
                                    return eRow['tags'].split(',').map((tag) => {
                                        return stringHandle(tag, { createSlug: true });
                                    });
                                }
                            })(),
                        };
                    }
                    if (!eRow['thuoc-tinh-1']) {
                        eRow['thuoc-tinh-1'] = 'phiên bản';
                        eRow['gia-tri-1'] = 'chuẩn';
                        eRow['thuoc-tinh-2'] = undefined;
                    }
                    for (let i = 1; ; i++) {
                        if (eRow[`thuoc-tinh-${i}`] && eRow[`gia-tri-${i}`]) {
                            let key =
                                String(_insertProducts[eRow['ma-san-pham']].product_id) +
                                '-' +
                                stringHandle(eRow[`thuoc-tinh-${i}`], { createSlug: true });
                            if (!_insertAttributes[key]) {
                                _insertAttributes[key] = {
                                    attribute_id: ++attributeId,
                                    code: String(attributeId).padStart(6, '0'),
                                    product_id: _insertProducts[eRow['ma-san-pham']].product_id,
                                    option: eRow[`thuoc-tinh-${i}`],
                                    values: [eRow[`gia-tri-${i}`]],
                                    create_date: moment().tz(TIMEZONE).format(),
                                    creator_id: req.user.user_id,
                                    last_update: moment().tz(TIMEZONE).format(),
                                    updater_id: req.user.user_id,
                                    active: true,
                                    slug_option: stringHandle(eRow[`thuoc-tinh-${i}`], { createSlug: true }),
                                    slug_values: [stringHandle(eRow[`gia-tri-${i}`], { createSlug: true })],
                                };
                            } else {
                                _insertAttributes[key] = {
                                    attribute_id: _insertAttributes[key].attribute_id,
                                    code: _insertAttributes[key].code,
                                    product_id: _insertAttributes[key].product_id,
                                    option: _insertAttributes[key].option,
                                    values: [..._insertAttributes[key].values, eRow[`gia-tri-${i}`]],
                                    create_date: _insertAttributes[key].create_date,
                                    creator_id: _insertAttributes[key].creator_id,
                                    last_update: moment().tz(TIMEZONE).format(),
                                    updater_id: req.user.user_id,
                                    active: true,
                                    slug_option: _insertAttributes[key].slug_option,
                                    slug_values: [
                                        ...new Set([..._insertAttributes[key].slug_values, stringHandle(eRow[`gia-tri-${i}`], { createSlug: true })]),
                                    ],
                                };
                            }
                        } else {
                            break;
                        }
                    }
                    _insertVariants[eRow['ma-phien-ban']] = {
                        variant_id: ++variantId,
                        product_id: _insertProducts[eRow['ma-san-pham']].product_id,
                        code: String(variantId).padStart(6, '0'),
                        title: eRow['ten-phien-ban'] || '',
                        slug_title: eRow['_ten-phien-ban'],
                        sku: eRow['ma-phien-ban'],
                        image: (() => {
                            if (eRow['hinh-anh']) {
                                return eRow['hinh-anh'].split(',');
                            }
                            return [];
                        })(),
                        options: [
                            ...(() => {
                                let result = [];
                                for (let i = 1; ; i++) {
                                    if (eRow[`thuoc-tinh-${i}`] && eRow[`gia-tri-${i}`]) {
                                        result = [
                                            ...result,
                                            ...[
                                                {
                                                    option: eRow[`thuoc-tinh-${i}`],
                                                    value: eRow[`gia-tri-${i}`],
                                                },
                                            ],
                                        ];
                                    } else {
                                        break;
                                    }
                                }
                                return result;
                            })(),
                        ],
                        ...(() => {
                            let result = {};
                            for (let i = 1; ; i++) {
                                if (eRow[`thuoc-tinh-${i}`] && eRow[`gia-tri${i}`]) {
                                    result[`option${i}`] = {
                                        option: eRow[`thuoc-tinh-${i}`],
                                        value: eRow[`gia-tri-${i}`],
                                    };
                                } else {
                                    break;
                                }
                            }
                            return result;
                        })(),
                        supplier: (_suppliers[eRow['_nha-cung-cap']] && _suppliers[eRow['_nha-cung-cap']].name) || '',
                        import_price_default: eRow['gia-nhap'] || 0,
                        price:
                            (!isNaN(Number(eRow['gia-ban'])) && Number(eRow['gia-ban'])) ||
                            (() => {
                                throw new Error('400: Giá bán không hợp lệ');
                            })(),
                        enable_bulk_price: (() => {
                            if (eRow['ap-dung-gia-ban-si'] && /^(co)$/.test(stringHandle(eRow['ap-dung-gia-ban-si'], { createSlug: true }))) {
                                return true;
                            }
                            return false;
                        })(),
                        bulk_prices: (() => {
                            let result = [];
                            let i = 0;
                            do {
                                let bulkPrice = {};
                                if (i == 0) {
                                    if (eRow[`so-luong-si-ap-dung`]) {
                                        let [minQuantity, maxQuantity] = eRow[`so-luong-si-ap-dung`].split('-');
                                        bulkPrice['min_quantity_apply'] =
                                            (!isNaN(Number(minQuantity)) && Number(minQuantity)) ||
                                            (() => {
                                                throw new Error('400: Số lượng sỉ áp dụng phải là số!');
                                            })();

                                        bulkPrice['max_quantity_apply'] =
                                            (!isNaN(Number(maxQuantity)) && Number(maxQuantity)) ||
                                            (() => {
                                                throw new Error('400: Số lượng sỉ áp dụng phải là số!');
                                            })();
                                        bulkPrice['price'] =
                                            (!isNaN(Number(eRow['gia-ban-si-ap-dung'])) && Number(eRow['gia-ban-si-ap-dung'])) ||
                                            (() => {
                                                throw new Error('400: Giá bán sỉ áp dụng phải là số');
                                            })();
                                    } else {
                                        break;
                                    }
                                } else {
                                    if (eRow[`so-luong-si-ap-dung-${i}`]) {
                                        let [minQuantity, maxQuantity] = eRow[`so-luong-si-ap-dung-${i}`].split('-');
                                        bulkPrice['min_quantity_apply'] =
                                            (!isNaN(Number(minQuantity)) && Number(minQuantity)) ||
                                            (() => {
                                                throw new Error('400: Số lượng sỉ áp dụng phải là số!');
                                            })();

                                        bulkPrice['max_quantity_apply'] =
                                            (!isNaN(Number(maxQuantity)) && Number(maxQuantity)) ||
                                            (() => {
                                                throw new Error('400: Số lượng sỉ áp dụng phải là số!');
                                            })();
                                        bulkPrice['price'] =
                                            (!isNaN(Number(eRow[`gia-ban-si-ap-dung-${i}`])) && Number(eRow[`gia-ban-si-ap-dung-${i}`])) ||
                                            (() => {
                                                throw new Error('400: Giá bán sỉ áp dụng phải là số');
                                            })();
                                    } else {
                                        break;
                                    }
                                }
                                result.push(bulkPrice);
                                i++;
                            } while (true);
                            return result;
                        })(),
                        create_date: moment().tz(TIMEZONE).format(),
                        creator_id: req.user.user_id,
                        last_update: moment().tz(TIMEZONE).format(),
                        updater_id: req.user.user_id,
                        active: true,
                    };
                }
            }
        });
        if (Object.values(_insertProducts).length > 0) {
            let insert = await client.db(req.user.database).collection('Products').insertMany(Object.values(_insertProducts));
            if (!insert.insertedIds) {
                throw new Error(`500: Tạo sản phẩm thất bại!`);
            }
        }
        if (Object.values(_insertAttributes).length > 0) {
            let insert = await client.db(req.user.database).collection('Attributes').insertMany(Object.values(_insertAttributes));
            if (!insert.insertedIds) {
                throw new Error(`500: Tạo thuộc tính sản phẩm thất bại!`);
            }
        }
        if (Object.values(_insertVariants).length > 0) {
            let insert = await client.db(req.user.database).collection('Variants').insertMany(Object.values(_insertVariants));
            if (!insert.insertedIds) {
                throw new Error(`500: Tạo phiên bản sản phẩm thất bại!`);
            }
        }
        if (insertSuppliers.length > 0) {
            let insert = await client.db(req.user.database).collection('Suppliers').insertMany(insertSuppliers);
            if (!insert.insertedIds) {
                throw new Error(`500: Tạo nhà cung cấp thất bại!`);
            }
        }
        if (insertCategories.length > 0) {
            let insert = await client.db(req.user.database).collection('Categories').insertMany(insertCategories);
            if (!insert.insertedIds) {
                throw new Error(`500: Tạo nhóm sản phẩm thất bại!`);
            }
        }
        if (insertBrands.length > 0) {
            let insert = await client.db(req.user.database).collection('Brands').insertMany(insertBrands);
            if (!insert.insertedIds) {
                throw new Error(`500: Tạo thương hiệu sản phẩm thất bại!`);
            }
        }
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Products' }, { $set: { name: 'Products', value: productId } }, { upsert: true });
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Attributes' }, { $set: { name: 'Attributes', value: attributeId } }, { upsert: true });
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Variants' }, { $set: { name: 'Variants', value: variantId } }, { upsert: true });
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Suppliers' }, { $set: { name: 'Suppliers', value: supplierId } }, { upsert: true });
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Categories' }, { $set: { name: 'Categories', value: categoryId } }, { upsert: true });
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Brands' }, { $set: { name: 'Brands', value: brandId } }, { upsert: true });
        res.send({ success: true, message: 'Tạo sản phẩm thành công!' });
    } catch (err) {
        next(err);
    }
};

module.exports.AddUnitProductC = async (req, res, next) => {
    try {
        if (req.body.pcs == undefined || req.body.name == undefined || req.body.price == undefined) {
            return res.send({ success: false, mess: 'pcs or name invalid !!!' });
        }

        req.body.creator_id = req.user.user_id;
        req.body.created_date = moment().tz(timezone).format();
        req.body.updated_date = moment().tz(timezone).format();

        let app = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Unit' });

        req.body.unit_product_id = parseInt(app.value) + 1;
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne(
                { name: 'Unit' },
                {
                    $set: {
                        value: req.body.unit_product_id,
                    },
                }
            );

        await productService.AddUnitProductS(req, res, next);
    } catch (err) {
        next(err);
    }
};
