const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const XLSX = require('xlsx');
const { stringHandle } = require('../utils/string-handle');
const { createTimeline } = require('../utils/date-handle');

module.exports._getImportOrder = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        if (req.query.order_id) {
            aggregateQuery.push({ $match: { order_id: Number(req.query.order_id) } });
        }
        if (req.query.code) {
            aggregateQuery.push({
                $match: {
                    code: new RegExp(new String(req.query.code).replace('#', '')),
                },
            });
        }
        if (req.query.creator_id) {
            aggregateQuery.push({
                $match: { creator_id: Number(req.query.creator_id) },
            });
        }
        if (req.query.verifier_id) {
            aggregateQuery.push({
                $match: { verifier_id: Number(req.query.verifier_id) },
            });
        }
        if (req.query.import_location_id) {
            aggregateQuery.push({
                $match: { 'import_location.branch_id': Number(req.query.import_location_id) },
            });
        }
        if (req.query.status) {
            aggregateQuery.push({ $match: { status: String(req.query.status) } });
        }
        req.query = createTimeline(req.query);
        if (req.query.from_date) {
            aggregateQuery.push({
                $match: { create_date: { $gte: req.query.from_date } },
            });
        }
        if (req.query.to_date) {
            aggregateQuery.push({
                $match: { create_date: { $lte: req.query.to_date } },
            });
        }
        let countQuery = [...aggregateQuery];
        aggregateQuery.push({ $sort: { create_date: -1 } });
        let page = Number(req.query.page) || 1;
        let page_size = Number(req.query.page_size) || 50;
        aggregateQuery.push({ $skip: (page - 1) * page_size }, { $limit: page_size });
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Users',
                    localField: 'completer_id',
                    foreignField: 'user_id',
                    as: '_completer',
                },
            },
            { $unwind: { path: '$_completer', preserveNullAndEmptyArrays: true } }
        );
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Branchs',
                    localField: 'import_location.branch_id',
                    foreignField: 'branch_id',
                    as: 'import_location_info',
                },
            },
            { $unwind: { path: '$import_location_info', preserveNullAndEmptyArrays: true } }
        );
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Users',
                    localField: 'order_creator_id',
                    foreignField: 'user_id',
                    as: '_order_creator',
                },
            },
            { $unwind: { path: '$_order_creator', preserveNullAndEmptyArrays: true } }
        );

        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Users',
                    localField: 'receiver_id',
                    foreignField: 'user_id',
                    as: '_receiver',
                },
            },
            { $unwind: { path: '$_receiver', preserveNullAndEmptyArrays: true } }
        );

        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Users',
                    localField: 'verifier_id',
                    foreignField: 'user_id',
                    as: '_verifier',
                },
            },
            { $unwind: { path: '$_verifier', preserveNullAndEmptyArrays: true } }
        );
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Users',
                    localField: 'creator_id',
                    foreignField: 'user_id',
                    as: '_creator',
                },
            },
            { $unwind: { path: '$_creator', preserveNullAndEmptyArrays: true } }
        );
        aggregateQuery.push({
            $project: {
                sub_name: 0,
                '_verifier.password': 0,
                '_creator.password': 0,
            },
        });

        // lấy data từ database
        let [orders, counts] = await Promise.all([
            client.db(req.user.database).collection(`ImportOrders`).aggregate(aggregateQuery).toArray(),
            client
                .db(req.user.database)
                .collection(`ImportOrders`)
                .aggregate([...countQuery, { $count: 'counts' }])
                .toArray(),
        ]);
        res.send({
            success: true,
            count: counts[0] ? counts[0].counts : 0,
            data: orders,
        });
    } catch (err) {
        next(err);
    }
};

module.exports._createImportOrder = async (req, res, next) => {
    try {
        if (req.body.code == undefined) throw new Error('400: Vui lòng truyền số hoá đơn');

        var orderImport = await client.db(req.user.database).collection('ImportOrders').findOne({ code: req.body.code });

        if (orderImport != undefined) throw new Error('400: Số hoá đơn đã tồn tại');

        if (req.body.status == 'COMPLETE') {
            req.body.products.map((item) => {
                if (item.quantity <= 0 || item.quantity == undefined) throw new Error('400: Số lượng sản phẩm phải lớn hơn 0');
            });
        }
        let orderMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'ImportOrders' });
        let orderId = (orderMaxId && orderMaxId.value) || 0;
        const importAt = (() => {
            if (req.body.import_location && req.body.import_location.branch_id) {
                return 'Branchs';
            }
            return 'Stores';
        })();
        let importLocation = await client.db(req.user.database).collection(importAt).findOne();
        if (!importLocation) {
            throw new Error('400: Địa điểm nhập hàng không chính xác!');
        }
        let productIds = [];
        let variantIds = [];
        req.body.products.map((product) => {
            productIds.push(product.product_id);
            variantIds.push(product.variant_id);
        });
        productIds = [...new Set(productIds)];
        variantIds = [...new Set(variantIds)];
        let products = await client
            .db(req.user.database)
            .collection('Products')
            .find({ product_id: { $in: productIds } })
            .toArray();
        let variants = await client
            .db(req.user.database)
            .collection('Variants')
            .find({ variant_id: { $in: variantIds } })
            .toArray();
        let _products = {};
        products.map((product) => {
            _products[product.product_id] = product;
        });
        let _variants = {};
        variants.map((variant) => {
            _variants[variant.variant_id] = variant;
        });
        let total_cost = 0;
        let total_discount = 0;
        let final_cost = 0;
        let total_quantity = 0;
        req.body.products = req.body.products.map((product) => {
            total_cost += product.quantity * product.import_price;
            total_discount += product.discount || 0;
            final_cost += product.quantity * product.import_price - product.discount || 0;
            total_quantity += product.quantity;
            return {
                ...product,
                product_info: _products[product.product_id],
                variant_info: _variants[product.variant_id],
            };
        });
        let payment_amount = (() => {
            let result = 0;
            if (Array.isArray(req.body.payment_info) && req.body.payment_info.length > 0) {
                req.body.payment_info = req.body.payment_info.map((payment) => {
                    result += payment.paid_amount || 0;
                    payment['payment_date'] = moment().tz(TIMEZONE).format();
                    return payment;
                });
            }
            return result;
        })();
        let order = {
            order_id: ++orderId,
            code: req.body.code || String(orderId).padStart(6, '0'),
            import_location: req.body.import_location,
            import_location_info: importLocation,
            products: req.body.products || [],
            total_quantity: req.body.total_quantity || total_quantity,
            total_cost: req.body.total_cost || total_cost,
            total_tax: req.body.total_tax || 0,
            total_discount: req.body.total_discount || total_discount,
            service_fee: req.body.service_fee || 0,
            fee_shipping: req.body.fee_shipping || 0,
            final_cost: req.body.final_cost || final_cost,
            note: req.body.note || '',
            files: req.body.files,
            tags: req.body.tags || [],
            slug_tags: [],
            // DRAFT - VERIFY - SHIPPING - COMPLETE - CANCEL
            status: req.body.status || 'DRAFT',
            payment_info: req.body.payment_info || [],
            payment_amount: req.body.payment_amount || payment_amount,
            // UNPAID - PAYING - PAID - REFUND
            payment_status: req.body.payment_status || 'PAID',
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            verify_date: '',
            verifier_id: '',
            delivery_date: '',
            deliverer_id: '',
            complete_date: '',
            completer_id: '',
            cancel_date: '',
            canceler_id: '',
            order_creator_id: req.body.order_creator_id,
            receiver_id: req.body.receiver_id,
            last_update: moment().tz(TIMEZONE).format(),
            active: true,
        };
        if (order.status == 'COMPLETE') {
            order['verifier_id'] = Number(req.user.user_id);
            order['verify_date'] = moment().tz(TIMEZONE).format();
            order['completer_id'] = Number(req.user.user_id);
            order['complete_date'] = moment().tz(TIMEZONE).format();
            let locationMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Locations' });
            let locationId = (locationMaxId && locationMaxId.value) || 0;
            let inventoryMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Inventories' });
            let inventoryId = (inventoryMaxId && inventoryMaxId.value) || 0;
            let insertLocations = [];
            let insertInventories = [];
            order.products.map((eProduct) => {
                insertLocations.push({
                    location_id: ++locationId,
                    code: String(locationId).padStart(6, '0'),
                    product_id: eProduct.product_id,
                    variant_id: eProduct.variant_id,
                    branch_id: (order.import_location && order.import_location.branch_id) || 0,
                    name: importLocation.name,
                    import_price: eProduct.import_price,
                    quantity: eProduct.quantity,
                    create_date: moment().tz(TIMEZONE).format(),
                    creator_id: Number(req.user.user_id),
                    last_update: moment().tz(TIMEZONE).format(),
                    updater_id: req.user.user_id,
                });
                insertInventories.push({
                    inventory_id: ++inventoryId,
                    code: String(inventoryId).padStart(6, '0'),
                    order_id: orderId,
                    product_id: eProduct.product_id,
                    variant_id: eProduct.variant_id,
                    branch_id: (order.import_location && order.import_location.branch_id) || 0,
                    type: 'import-product',
                    import_quantity: eProduct.quantity,
                    import_price: eProduct.import_price,
                    export_quantity: 0,
                    export_price: 0,
                    create_date: moment().tz(TIMEZONE).format(),
                    creator_id: Number(req.user.user_id),
                    last_update: moment().tz(TIMEZONE).format(),
                    updater_id: req.user.user_id,
                });
            });
            await client
                .db(req.user.database)
                .collection('AppSetting')
                .updateOne({ name: 'Locations' }, { $set: { name: 'Locations', value: locationId } }, { upsert: true });
            await client
                .db(req.user.database)
                .collection('AppSetting')
                .updateOne({ name: 'Inventories' }, { $set: { name: 'Inventories', value: inventoryId } }, { upsert: true });
            if (insertLocations.length > 0) {
                await client.db(req.user.database).collection('Locations').insertMany(insertLocations);
            }
            if (insertInventories.length > 0) {
                await client.db(req.user.database).collection('Inventories').insertMany(insertInventories);
            }
        }
        for (let i in order.products) {
            let _variant = order.products[i];
            client
                .db(req.user.database)
                .collection('Variants')
                .updateOne({ variant_id: _variant.variant_id }, { $set: { import_price_default: _variant.import_price } });
        }
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'ImportOrders' }, { $set: { name: 'ImportOrders', value: orderId } }, { upsert: true });
        await client.db(req.user.database).collection('ImportOrders').insertOne(order);
        res.send({
            success: true,
            data: order,
        });
    } catch (err) {
        next(err);
    }
};

module.exports._createImportOrderFile = async (req, res, next) => {
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
        let variantSkus = [];
        rows = (() => {
            let result = [];
            for (let i = 0, len = rows.length; i < len; i++) {
                let _row = {};
                let _optionRequires = {
                    'ma-san-pham': 'string',
                    'ma-phien-ban': 'string',
                    'gia-nhap': 'number',
                    'so-luong-nhap': 'number',
                };
                let errorColumns = [];
                let eRow = { ...rows[i] };
                for (let j in eRow) {
                    let field = stringHandle(j, { removeStringInBrackets: 'round', createSlug: true });
                    _row[field] = eRow[j];
                    if (_optionRequires[field]) {
                        if (_optionRequires[field] == 'string' && typeof _row[field] == 'string') {
                            continue;
                        }
                        if (_optionRequires[field] == 'number' && !isNaN(Number(_row[field]))) {
                            continue;
                        }
                        errorColumns.push(j);
                    }
                }
                if (errorColumns.length > 0) {
                    // errorRows.push(_row);
                    throw new Error(`400: Giá trị các cột ${errorColumns.join(', ')} tại dòng thứ ${i + 2} không hợp lệ!`);
                } else {
                    productSkus.push(_row['ma-san-pham']);
                    variantSkus.push(_row['ma-phien-ban']);
                    result.push(_row);
                }
            }
            return result;
        })();
        productSkus = [...new Set(productSkus)];
        variantSkus = [...new Set(variantSkus)];
        let products = await client
            .db(req.user.database)
            .collection('Products')
            .find({ sku: { $in: productSkus } })
            .toArray();
        let _products = {};
        products.map((eProduct) => {
            _products[eProduct.sku] = eProduct;
        });
        let variants = await client
            .db(req.user.database)
            .collection('Variants')
            .find({ sku: { $in: variantSkus } })
            .toArray();
        let _variants = {};
        variants.map((eVariant) => {
            _variants[eVariant.sku] = eVariant;
        });
        let branch = await client
            .db(req.user.database)
            .collection('Branchs')
            .findOne({ branch_id: Number(req.body.branch_id) });
        if (!branch) {
            throw new Error(`400: chi nhánh không tồn tại!`);
        }
        let orderMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'ImportOrders' });
        let orderId = (orderMaxId && orderMaxId.value) || 0;
        let _orders = {};
        rows.map((eRow, index) => {
            if (!_orders[eRow['ma-phieu-nhap']]) {
                _orders[eRow['ma-phieu-nhap']] = {
                    order_id: ++orderId,
                    code: String(orderId).padStart(6, '0'),
                    import_order_id: orderId,
                    import_code: eRow['ma-phieu-nhap'] || '',
                    import_location: { branch_id: branch.branch_id },
                    products: req.body.products || [],
                    total_quantity: 0,
                    total_cost: 0,
                    total_tax: 0,
                    total_discount: 0,
                    service_fee: 0,
                    fee_shipping: 0,
                    final_cost: 0,
                    note: '',
                    files: [],
                    tags: [],
                    // DRAFT - VERIFY - SHIPPING - COMPLETE - CANCEL
                    status: 'DRAFT',
                    payment_info: [],
                    payment_amount: '',
                    // UNPAID - PAYING - PAID - REFUND
                    payment_status: 'UNPAID',
                    create_date: moment().tz(TIMEZONE).format(),
                    creator_id: req.user.user_id,
                    verify_date: moment().tz(TIMEZONE).format(),
                    verifier_id: req.user.user_id,
                    delivery_date: '',
                    deliverer_id: '',
                    complete_date: '',
                    completer_id: '',
                    cancel_date: '',
                    canceler_id: '',
                    order_creator_id: req.user.user_id,
                    receiver_id: '',
                    last_update: moment().tz(TIMEZONE).format(),
                    active: true,
                    slug_tags: [],
                };
            }
            if (_orders[eRow['ma-phieu-nhap']]) {
                if (eRow['ma-san-pham'] && eRow['ma-phien-ban']) {
                    _orders[eRow['ma-phieu-nhap']].products.push({
                        product_id: (() => {
                            if (_products[eRow['ma-san-pham']] && _products[eRow['ma-san-pham']].product_id) {
                                return _products[eRow['ma-san-pham']].product_id;
                            }
                            throw new Error(`400: Sản phẩm ${eRow['ma-san-pham']} không tồn tại!`);
                        })(),
                        variant_id: (() => {
                            if (_variants[eRow['ma-phien-ban']] && _variants[eRow['ma-phien-ban']].variant_id) {
                                return _variants[eRow['ma-phien-ban']].variant_id;
                            }
                            throw new Error(`400: Phiên bản ${eRow['ma-phien-ban']} không tồn tại!`);
                        })(),
                        import_price: (() => {
                            if (eRow['gia-nhap']) {
                                return eRow['gia-nhap'];
                            }
                            throw new Error(`400: Sản phẩm ${eRow['ma-san-pham']} chưa có giá nhập hàng!`);
                        })(),
                        quantity: (() => {
                            if (eRow['so-luong-nhap']) {
                                return eRow['so-luong-nhap'];
                            }
                            throw new Error(`400: Sản phẩm ${eRow['ma-san-pham']} chưa có số lượng nhập!`);
                        })(),
                        product_info: _products[eRow['ma-san-pham']],
                        variant_info: _variants[eRow['ma-phien-ban']],
                    });
                    _orders[eRow['ma-phieu-nhap']].total_quantity += eRow['so-luong-nhap'];
                    _orders[eRow['ma-phieu-nhap']].total_cost += eRow['gia-nhap'] * eRow['so-luong-nhap'];
                    _orders[eRow['ma-phieu-nhap']].total_tax = _orders[eRow['thue)']] || 0;
                    _orders[eRow['ma-phieu-nhap']].total_discount = eRow['chiet-khau'] || 0;
                    _orders[eRow['ma-phieu-nhap']].service_fee = eRow['chi-phi-dich-vu'] || 0;
                    _orders[eRow['ma-phieu-nhap']].fee_shipping = eRow['phi-van-chuyen'] || 0;
                    _orders[eRow['ma-phieu-nhap']].final_cost = eRow['tong-cong'] || 0;
                    _orders[eRow['ma-phieu-nhap']].payment_amount = eRow['tong-cong'] || 0;
                    _orders[eRow['ma-phieu-nhap']].note = eRow['ghi-chu'] || '';
                }
            }
        });
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'ImportOrders' }, { $set: { name: 'ImportOrders', value: orderId } }, { upsert: true });
        let orders = Object.values(_orders);
        if (Array.isArray(orders) && orders.length > 0) {
            let insert = await client.db(req.user.database).collection('ImportOrders').insertMany(orders);
            if (!insert.insertedIds) {
                throw new Error(`500: Tạo phiếu nhập kho thất bại!`);
            }
        } else {
            throw new Error(`400: Không tạo được phiếu nhập kho!`);
        }
        res.send({ success: true, data: orders });
    } catch (err) {
        next(err);
    }
};

module.exports._updateImportOrder = async (req, res, next) => {
    try {
        req.params.order_id = Number(req.params.order_id);
        let order = await client.db(req.user.database).collection('ImportOrders').findOne(req.params);
        delete req.body._id;
        delete req.body.order_id;
        let _order = { ...order, ...req.body };
        let importLocation = await client.db(req.user.database).collection('Branchs').findOne(_order.import_location);
        if (!importLocation) {
            throw new Error('400: Địa điểm nhập hàng không chính xác!');
        }
        if (req.body.products) {
            let productIds = [];
            let variantIds = [];
            req.body.products.map((product) => {
                productIds.push(product.product_id);
                variantIds.push(product.variant_id);
            });
            productIds = [...new Set(productIds)];
            variantIds = [...new Set(variantIds)];
            let products = await client
                .db(req.user.database)
                .collection('Products')
                .find({ product_id: { $in: productIds } })
                .toArray();
            let variants = await client
                .db(req.user.database)
                .collection('Variants')
                .find({ variant_id: { $in: variantIds } })
                .toArray();
            let _products = {};
            products.map((product) => {
                _products[product.product_id] = product;
            });
            let _variants = {};
            variants.map((variant) => {
                _variants[variant.variant_id] = variant;
            });
            _order.products = _order.products.map((eProduct) => {
                eProduct['product_info'] = _products[`${eProduct.product_id}`];
                eProduct['variant_info'] = _variants[`${eProduct.variant_id}`];
                return eProduct;
            });
        }
        let payment_amount = (() => {
            let result = 0;
            if (_order.payment_info && Array.isArray(_order.payment_info) && _order.payment_info.length > 0) {
                _order.payment_info = _order.payment_info.map((payment) => {
                    result += payment.paid_amount || 0;
                    if (!payment['payment_date']) {
                        payment['payment_date'] = moment().tz(TIMEZONE).format();
                    }
                    return payment;
                });
            }
            return result;
        })();
        _order = {
            order_id: _order.order_id,
            code: _order.code,
            import_order_id: _order.import_order_id,
            import_code: _order.import_code,
            import_location: _order.import_location,
            import_location_info: importLocation,
            products: _order.products,
            total_quantity: _order.total_quantity,
            total_cost: _order.total_cost,
            total_tax: _order.total_tax,
            total_discount: _order.total_discount,
            service_fee: _order.service_fee,
            fee_shipping: _order.fee_shipping,
            final_cost: _order.final_cost,
            note: _order.note,
            files: _order.files,
            tags: _order.tags,
            slug_tags: _order.slug_tags,
            // DRAFT - VERIFY - SHIPPING - COMPLETE - CANCEL
            status: _order.status,
            payment_info: _order.payment_info,
            payment_amount: payment_amount,
            // UNPAID - PAYING - PAID - REFUND
            payment_status: _order.payment_status,
            create_date: _order.create_date,
            creator_id: _order.creator_id,
            verify_date: _order.verify_date,
            verifier_id: _order.verifier_id,
            delivery_date: _order.delivery_date,
            deliverer_id: _order.deliverer_id,
            complete_date: _order.complete_date,
            completer_id: _order.completer_id,
            cancel_date: _order.cancel_date,
            canceler_id: _order.canceler_id,
            order_creator_id: _order.order_creator_id,
            receiver_id: _order.receiver_id,
            last_update: moment().tz(TIMEZONE).format(),
            active: _order.active,
        };
        if (_order.status == 'VERIFY' && order.status != 'VERIFY') {
            _order['verifier_id'] = Number(req.user.user_id);
            _order['verify_date'] = moment().tz(TIMEZONE).format();
        }
        if (_order.status == 'COMPLETE' && order.status != 'COMPLETE') {
            _order['verifier_id'] = _order['verifier_id'] || Number(req.user.user_id);
            _order['verify_date'] = _order['verify_date'] || moment().tz(TIMEZONE).format();
            _order['completer_id'] = Number(req.user.user_id);
            _order['complete_date'] = moment().tz(TIMEZONE).format();
            let locationMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Locations' });
            let locationId = (locationMaxId && locationMaxId.value) || 0;
            let inventoryMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Inventories' });
            let inventoryId = (inventoryMaxId && inventoryMaxId.value) || 0;
            let insertLocations = [];
            let insertInventories = [];
            _order.products.map((eProduct) => {
                insertLocations.push({
                    location_id: ++locationId,
                    code: String(locationId).padStart(6, '0'),
                    product_id: eProduct.product_id,
                    variant_id: eProduct.variant_id,
                    branch_id: (_order.import_location && _order.import_location.branch_id) || 0,
                    name: importLocation.name,
                    import_price: eProduct.import_price,
                    quantity: eProduct.quantity,
                    create_date: moment().tz(TIMEZONE).format(),
                    creator_id: Number(req.user.user_id),
                    last_update: moment().tz(TIMEZONE).format(),
                    updater_id: req.user.user_id,
                });
                insertInventories.push({
                    inventory_id: ++inventoryId,
                    code: String(inventoryId).padStart(6, '0'),
                    product_id: eProduct.product_id,
                    variant_id: eProduct.variant_id,
                    branch_id: (_order.import_location && _order.import_location.branch_id) || 0,
                    import_quantity: eProduct.quantity,
                    import_price: eProduct.import_price,
                    export_quantity: 0,
                    export_price: 0,
                    create_date: moment().tz(TIMEZONE).format(),
                    creator_id: Number(req.user.user_id),
                    last_update: moment().tz(TIMEZONE).format(),
                    updater_id: req.user.user_id,
                });
            });
            console.log(insertLocations);
            await client
                .db(req.user.database)
                .collection('AppSetting')
                .updateOne({ name: 'Locations' }, { $set: { name: 'Locations', value: locationId } }, { upsert: true });
            await client
                .db(req.user.database)
                .collection('AppSetting')
                .updateOne({ name: 'Inventories' }, { $set: { name: 'Inventories', value: inventoryId } }, { upsert: true });
            if (insertLocations.length > 0) {
                await client.db(req.user.database).collection('Locations').insertMany(insertLocations);
            }
            if (insertInventories.length > 0) {
                await client.db(req.user.database).collection('Inventories').insertMany(insertInventories);
            }
        }
        await client.db(req.user.database).collection('ImportOrders').updateOne(req.params, { $set: _order });
        res.send({ success: true, data: _order });
    } catch (err) {
        next(err);
    }
};

module.exports._deleteImportOrder = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection('ImportOrders')
            .deleteMany({ order_id: { $in: req.body.order_id } });
        res.send({ success: true, message: 'Xóa phiếu nhập hàng thành công!' });
    } catch (err) {
        next(err);
    }
};

module.exports._getTransportOrder = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        if (req.query.order_id) {
            aggregateQuery.push({ $match: { order_id: Number(req.query.order_id) } });
        }
        if (req.query.code) {
            aggregateQuery.push({ $match: { code: new RegExp(stringHandle(req.query.code, { createRegexQuery: true }), 'gi') } });
        }
        if (req.query.export_location_id) {
            aggregateQuery.push({ $match: { 'export_location.branch_id': Number(req.query.export_location_id) } });
        }
        if (req.query.import_location_id) {
            aggregateQuery.push({ $match: { 'import_location.branch_id': Number(req.query.import_location_id) } });
        }
        if (req.query.status) {
            aggregateQuery.push({ $match: { status: String(req.query.status) } });
        }
        req.query = createTimeline(req.query);
        if (req.query.from_date) {
            aggregateQuery.push({ $match: { create_date: { $gte: req.query.from_date } } });
        }
        if (req.query.to_date) {
            aggregateQuery.push({
                $match: { create_date: { $lte: req.query.to_date } },
            });
        }
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Branchs',
                    localField: 'export_location.branch_id',
                    foreignField: 'branch_id',
                    as: 'export_location_info',
                },
            },
            {
                $unwind: {
                    path: '$export_location_info',
                    preserveNullAndEmptyArrays: true,
                },
            }
        );
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Branchs',
                    localField: 'import_location.branch_id',
                    foreignField: 'branch_id',
                    as: 'import_location_info',
                },
            },
            {
                $unwind: {
                    path: '$import_location_info',
                    preserveNullAndEmptyArrays: true,
                },
            }
        );
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Users',
                    localField: 'completer_id',
                    foreignField: 'user_id',
                    as: '_completer',
                },
            },
            { $unwind: { path: '$_completer', preserveNullAndEmptyArrays: true } }
        );
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Users',
                    localField: 'verifier_id',
                    foreignField: 'user_id',
                    as: '_verifier',
                },
            },
            { $unwind: { path: '$_verifier', preserveNullAndEmptyArrays: true } }
        );
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Users',
                    localField: 'creator_id',
                    foreignField: 'user_id',
                    as: '_creator',
                },
            },
            { $unwind: { path: '$_creator', preserveNullAndEmptyArrays: true } }
        );
        aggregateQuery.push({
            $project: {
                sub_name: 0,
                '_verifier.password': 0,
                '_creator.password': 0,
            },
        });
        let countQuery = [...aggregateQuery];
        aggregateQuery.push({ $sort: { create_date: -1 } });
        let page = Number(req.query.page || 1);
        let page_size = Number(req.query.page_size || 50);
        aggregateQuery.push({ $skip: (page - 1) * page_size }, { $limit: page_size });
        // lấy data từ database
        let [orders, counts] = await Promise.all([
            client.db(req.user.database).collection(`TransportOrders`).aggregate(aggregateQuery).toArray(),
            client
                .db(req.user.database)
                .collection(`TransportOrders`)
                .aggregate([...countQuery, { $count: 'counts' }])
                .toArray(),
        ]);
        res.send({
            success: true,
            count: counts[0] ? counts[0].counts : 0,
            data: orders,
        });
    } catch (err) {
        next(err);
    }
};

module.exports._createTransportOrder = async (req, res, next) => {
    try {
        let maxOrderId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'TransportOrders' });
        let orderId = (maxOrderId && maxOrderId.value) || 0;
        const exportAt = (() => {
            if (req.body.export_location && req.body.export_location.branch_id) {
                return 'Branchs';
            }
            return 'Stores';
        })();
        const importAt = (() => {
            if (req.body.import_location && req.body.import_location.branch_id) {
                return 'Branchs';
            }
            return 'Stores';
        })();
        let exportLocation = await client.db(req.user.database).collection(exportAt).findOne(req.body.export_location);
        let importLocation = await client.db(req.user.database).collection(importAt).findOne(req.body.import_location);
        if (!exportLocation) {
            throw new Error('400: Địa điểm xuất hàng không chính xác!');
        }
        if (!importLocation) {
            throw new Error('400: Địa điểm nhập hàng không chính xác!');
        }
        let productIds = [];
        let variantIds = [];
        req.body.products.map((product) => {
            productIds.push(product.product_id);
            variantIds.push(product.variant_id);
        });
        productIds = [...new Set(productIds)];
        variantIds = [...new Set(variantIds)];
        let products = await client
            .db(req.user.database)
            .collection('Products')
            .find({ product_id: { $in: productIds } })
            .toArray();
        let _products = {};
        products.map((product) => {
            _products[product.product_id] = product;
        });
        let variants = await client
            .db(req.user.database)
            .collection('Variants')
            .find({ variant_id: { $in: variantIds } })
            .toArray();
        let _variants = {};
        variants.map((variant) => {
            _variants[variant.variant_id] = variant;
        });
        let total_cost = 0;
        let total_discount = 0;
        let final_cost = 0;
        let total_quantity = 0;
        req.body.products = req.body.products.map((product) => {
            total_cost += product.quantity * product.import_price;
            total_discount += product.discount || 0;
            final_cost += product.quantity * product.import_price - product.discount || 0;
            total_quantity += product.quantity;
            return {
                ...product,
                product_info: _products[product.product_id],
                variant_info: _variants[product.variant_id],
            };
        });
        let order = {
            order_id: ++orderId,
            code: req.body.code || String(orderId).padStart(6, '0'),
            export_location: req.body.export_location,
            import_location: req.body.import_location,
            products: req.body.products || [],
            total_quantity: req.body.total_quantity || total_quantity,
            total_cost: total_cost,
            total_discount: total_discount,
            service_fee: req.body.service_fee,
            fee_shipping: req.body.fee_shipping,
            final_cost: req.body.final_cost || final_cost,
            note: req.body.note || '',
            files: req.body.files,
            tags: req.body.tags || [],
            slug_tags: [],
            // DRAFT - VERIFY - SHIPPING - COMPLETE - CANCEL
            status: req.body.status || 'DRAFT',
            payment_info: req.body.payment_info || [],
            // UNPAID - PAYING - PAID
            payment_status: req.body.payment_status || 'PAID',
            delivery_time: req.body.delivery_time || '',
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            verify_date: '',
            verifier_id: '',
            delivery_date: '',
            deliverer_id: '',
            complete_date: '',
            completer_id: '',
            cancel_date: '',
            canceler_id: '',
            last_update: moment().tz(TIMEZONE).format(),
            active: true,
        };
        if (order.status == 'COMPLETE') {
            order['verifier_id'] = Number(req.user.user_id);
            order['verify_date'] = moment().tz(TIMEZONE).format();
            order['completer_id'] = Number(req.user.user_id);
            order['complete_date'] = moment().tz(TIMEZONE).format();
            let locationMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Locations' });
            let locationId = (locationMaxId && locationMaxId.value) || 0;
            let inventoryMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Inventories' });
            let inventoryId = (inventoryMaxId && inventoryMaxId.value) || 0;
            let sortQuery = (() => {
                if (req.user._business.price_recipe == 'LIFO') {
                    return { create_date: -1 };
                }
                return { create_date: 1 };
            })();
            let locations = await client
                .db(req.user.database)
                .collection('Locations')
                .find({
                    variant_id: { $in: variantIds },
                    branch_id: (order.export_location && order.export_location.branch_id) || 0,
                    quantity: { $gt: 0 },
                })
                .sort(sortQuery)
                .toArray();
            let _locations = {};
            locations.map((eLocation) => {
                if (!_locations[eLocation.variant_id]) {
                    _locations[eLocation.variant_id] = [];
                }
                if (_locations[eLocation.variant_id]) {
                    _locations[eLocation.variant_id].push(eLocation);
                }
            });
            let _insertLocations = {};
            let updateLocations = [];
            let insertInventories = [];
            order.products.map((eProduct) => {
                let quantity = eProduct.quantity;
                if (Array.isArray(_locations[eProduct.variant_id])) {
                    for (let i in _locations[eProduct.variant_id]) {
                        if (quantity == 0) {
                            break;
                        }
                        let eLocation = _locations[eProduct.variant_id][i];
                        if (quantity > eLocation.quantity) {
                            if (!_insertLocations[`${eProduct.variant_id}-${eLocation.import_price}`]) {
                                _insertLocations[`${eProduct.variant_id}-${eLocation.import_price}`] = {
                                    location_id: ++locationId,
                                    code: String(locationId).padStart(6, '0'),
                                    product_id: eProduct.product_id,
                                    variant_id: eProduct.variant_id,
                                    branch_id: (order.import_location && order.import_location.branch_id) || 0,
                                    name: importLocation.name,
                                    import_price: eLocation.import_price,
                                    quantity: eLocation.quantity,
                                    create_date: moment().tz(TIMEZONE).format(),
                                    creator_id: Number(req.user.user_id),
                                    last_update: moment().tz(TIMEZONE).format(),
                                    updater_id: req.user.user_id,
                                };
                            } else {
                                _insertLocations[`${eProduct.variant_id}-${eLocation.import_price}`].quantity += eLocation.quantity;
                            }
                            quantity -= eLocation.quantity;
                            eLocation.quantity = 0;
                            updateLocations.push(eLocation);
                            continue;
                        }
                        if (quantity < eLocation.quantity) {
                            if (!_insertLocations[`${eProduct.variant_id}-${eLocation.import_price}`]) {
                                _insertLocations[`${eProduct.variant_id}-${eLocation.import_price}`] = {
                                    location_id: ++locationId,
                                    code: String(locationId).padStart(6, '0'),
                                    product_id: eProduct.product_id,
                                    variant_id: eProduct.variant_id,
                                    branch_id: (order.import_location && order.import_location.branch_id) || 0,
                                    name: importLocation.name,
                                    import_price: eLocation.import_price,
                                    quantity: quantity,
                                    create_date: moment().tz(TIMEZONE).format(),
                                    creator_id: Number(req.user.user_id),
                                    last_update: moment().tz(TIMEZONE).format(),
                                    updater_id: req.user.user_id,
                                };
                            } else {
                                _insertLocations[`${eProduct.variant_id}-${eLocation.import_price}`].quantity += quantity;
                            }
                            eLocation.quantity -= quantity;
                            quantity = 0;
                            updateLocations.push(eLocation);
                            continue;
                        }
                    }
                }
                if (quantity > 0) {
                    throw new Error(`400: Sản phẩm ${eProduct.product_info && eProduct.product_info.sku} không đủ số lượng tồn kho!`);
                }
            });
            let insertLocations = Object.values(_insertLocations);
            insertLocations.map((eLocation) => {
                insertInventories.push({
                    inventory_id: ++inventoryId,
                    code: String(inventoryId).padStart(6, '0'),
                    order_id: orderId,
                    product_id: eLocation.product_id,
                    variant_id: eLocation.variant_id,
                    branch_id: (order.export_location && order.export_location.branch_id) || 0,
                    type: 'transport-export-product',
                    import_quantity: 0,
                    import_price: 0,
                    export_quantity: eLocation.quantity,
                    export_price: eLocation.import_price,
                    create_date: moment().tz(TIMEZONE).format(),
                    creator_id: Number(req.user.user_id),
                    last_update: moment().tz(TIMEZONE).format(),
                    updater_id: req.user.user_id,
                });
                insertInventories.push({
                    inventory_id: ++inventoryId,
                    code: String(inventoryId).padStart(6, '0'),
                    order_id: orderId,
                    product_id: eLocation.product_id,
                    variant_id: eLocation.variant_id,
                    branch_id: (order.import_location && order.import_location.branch_id) || 0,
                    type: 'transport-import-product',
                    import_quantity: eLocation.quantity,
                    import_price: eLocation.import_price,
                    export_quantity: 0,
                    export_price: 0,
                    create_date: moment().tz(TIMEZONE).format(),
                    creator_id: Number(req.user.user_id),
                    last_update: moment().tz(TIMEZONE).format(),
                    updater_id: req.user.user_id,
                });
            });
            await client
                .db(req.user.database)
                .collection('AppSetting')
                .updateOne({ name: 'Locations' }, { $set: { name: 'Locations', value: locationId } }, { upsert: true });
            await client
                .db(req.user.database)
                .collection('AppSetting')
                .updateOne({ name: 'Inventories' }, { $set: { name: 'Inventories', value: inventoryId } }, { upsert: true });
            await client.db(req.user.database).collection('Locations').insertMany(insertLocations);
            for (let i in updateLocations) {
                delete updateLocations[i]._id;
                await client
                    .db(req.user.database)
                    .collection('Locations')
                    .updateOne({ location_id: updateLocations[i].location_id }, { $set: updateLocations[i] });
            }
            await client.db(req.user.database).collection('Inventories').insertMany(insertInventories);
        }
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'TransportOrders' }, { $set: { name: 'TransportOrders', value: orderId } }, { upsert: true });
        await client.db(req.user.database).collection('TransportOrders').insertOne(order);
        res.send({ success: true, data: order });
    } catch (err) {
        next(err);
    }
};

module.exports._createTransportOrderFile = async (req, res, next) => {
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
        let variantSkus = [];
        rows = (() => {
            let result = [];
            for (let i = 0, len = rows.length; i < len; i++) {
                let _row = {};
                let _optionRequires = {
                    'ma-san-pham': 'string',
                    'ma-phien-ban': 'string',
                    'so-luong': 'number',
                };
                let eRow = { ...rows[i] };
                let errorColumns = [];
                for (let j in eRow) {
                    let field = stringHandle(j, { removeStringInBrackets: 'round', createSlug: true });
                    _row[field] = eRow[j];
                    if (_optionRequires[field]) {
                        if (_optionRequires[field] == 'string' && typeof _row[field] == 'string') {
                            continue;
                        }
                        if (_optionRequires[field] == 'number' && !isNaN(Number(_row[field]))) {
                            continue;
                        }
                        errorColumns.push(j);
                    }
                }
                if (errorColumns.length > 0) {
                    // errorRows.push(_row);
                    throw new Error(`400: Giá trị các cột ${errorColumns.join(', ')} tại dòng thứ ${i + 2} không hợp lệ!`);
                } else {
                    productSkus.push(_row['ma-san-pham']);
                    variantSkus.push(_row['ma-phien-ban']);
                    result.push(_row);
                }
            }
            return result;
        })();
        productSkus = [...new Set(productSkus)];
        variantSkus = [...new Set(variantSkus)];
        let products = await client
            .db(req.user.database)
            .collection('Products')
            .find({ sku: { $in: productSkus } })
            .toArray();
        let variants = await client
            .db(req.user.database)
            .collection('Variants')
            .find({ sku: { $in: variantSkus } })
            .toArray();
        let importLocation = await client
            .db(req.user.database)
            .collection('Branchs')
            .findOne({ branch_id: Number(req.body.import_location_id) });
        console.log({ branch_id: Number(req.body.import_location_id) });
        if (!importLocation) {
            throw new Error(`400: Địa điểm nhập hàng không chính xác!`);
        }
        let exportLocation = await client
            .db(req.user.database)
            .collection('Branchs')
            .findOne({ branch_id: Number(req.body.export_location_id) });
        if (!exportLocation) {
            throw new Error(`400: Địa điểm xuất hàng không chính xác!`);
        }
        let _products = {};
        let _productIds = [];
        products.map((eProduct) => {
            _products[eProduct.sku] = eProduct;
            _productIds.push(eProduct.product_id);
        });
        let _variants = {};
        let _variantIds = [];
        variants.map((eVariant) => {
            _variants[eVariant.sku] = eVariant;
            _variantIds.push(eVariant.variant_id);
        });
        let orderMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'TransportOrders' });
        let orderId = (orderMaxId && orderMaxId.value) || 0;
        let _orders = {};
        rows.map((eRow) => {
            if (!_orders[eRow['ma-phieu-chuyen']]) {
                _orders[eRow['ma-phieu-chuyen']] = {
                    order_id: ++orderId,
                    code: String(orderId).padStart(6, '0'),
                    export_location: { branch_id: exportLocation.branch_id },
                    import_location: { branch_id: importLocation.branch_id },
                    products: [],
                    total_quantity: 0,
                    total_cost: 0,
                    total_discount: 0,
                    service_fee: 0,
                    fee_shipping: 0,
                    final_cost: 0,
                    note: '',
                    files: [],
                    tags: [],
                    slug_tags: [],
                    // DRAFT - VERIFY - SHIPPING - COMPLETE - CANCEL
                    status: 'DRAFT',
                    payment_info: [],
                    // UNPAID - PAYING - PAID
                    payment_status: 'PAID',
                    delivery_time: moment(eRow['ngay-xuat-hang']).tz(TIMEZONE).format(),
                    create_date: moment().tz(TIMEZONE).format(),
                    creator_id: req.user.user_id,
                    verify_date: '',
                    verifier_id: '',
                    delivery_date: '',
                    deliverer_id: '',
                    complete_date: '',
                    completer_id: '',
                    cancel_date: '',
                    canceler_id: '',
                    last_update: moment().tz(TIMEZONE).format(),
                    active: true,
                };
            }
            if (_orders[eRow['ma-phieu-chuyen']]) {
                if (eRow['ma-san-pham'] && eRow['ma-phien-ban']) {
                    _orders[eRow['ma-phieu-chuyen']].products.push({
                        product_id: (() => {
                            if (_products[eRow['ma-san-pham']]) {
                                return _products[eRow['ma-san-pham']].product_id;
                            }
                            throw new Error(`400: Sản phẩm ${eRow['ma-san-pham']} không tồn tại!`);
                        })(),
                        variant_id: (() => {
                            if (_variants[eRow['ma-phien-ban']]) {
                                return _variants[eRow['ma-phien-ban']].variant_id;
                            }
                            throw new Error(`400: Phiên bản ${eRow['ma-phien-ban']} không tồn tại!`);
                        })(),
                        quantity: (() => {
                            if (eRow['so-luong']) {
                                return eRow['so-luong'];
                            }
                            throw new Error(`400: Sản phẩm ${eRow['ma-san-pham']} chưa có số lượng nhập!`);
                        })(),
                        product_info: _products[eRow['ma-san-pham']],
                        variant_info: _variants[eRow['ma-phien-ban']],
                    });
                    _orders[eRow['ma-phieu-chuyen']].total_quantity += eRow['so-luong'];
                    _orders[eRow['ma-phieu-chuyen']].service_fee = eRow['chi-phi-dich-vu'] || 0;
                    _orders[eRow['ma-phieu-chuyen']].fee_shipping = eRow['phi-van-chuyen'] || 0;
                    _orders[eRow['ma-phieu-chuyen']].final_cost = eRow['tong-cong'] || 0;
                    _orders[eRow['ma-phieu-chuyen']].note = eRow['ghi-chu'] || '';
                }
            }
        });
        let orders = Object.values(_orders);
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'TransportOrders' }, { $set: { name: 'TransportOrders', value: orderId } }, { upsert: true });
        let insert = await client.db(req.user.database).collection('TransportOrders').insertMany(orders);
        if (!insert.insertedIds) {
            throw new Error(`500: Tạo phiếu chuyển thất bại!`);
        }
        res.send({ success: true, data: orders });
    } catch (err) {
        next(err);
    }
};

module.exports._updateTransportOrder = async (req, res, next) => {
    try {
        req.params.order_id = Number(req.params.order_id);
        let order = await client.db(req.user.database).collection('TransportOrders').findOne(req.params);
        delete req.body._id;
        delete req.body.order_id;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _order = { ...order, ...req.body };
        let productIds = [];
        let variantIds = [];
        _order.products.map((product) => {
            productIds.push(product.product_id);
            variantIds.push(product.variant_id);
        });
        productIds = [...new Set(productIds)];
        variantIds = [...new Set(variantIds)];
        let products = await client
            .db(req.user.database)
            .collection('Products')
            .find({ product_id: { $in: productIds } })
            .toArray();
        let variants = await client
            .db(req.user.database)
            .collection('Variants')
            .find({ product_id: { $in: productIds } })
            .toArray();

        let _products = {};
        products.map((product) => {
            _products[product.product_id] = product;
        });
        let _variants = {};
        variants.map((variant) => {
            _variants[variant.variant_id] = variant;
        });
        let total_cost = 0;
        let total_discount = 0;
        let final_cost = 0;
        let total_quantity = 0;
        _order.products = _order.products.map((eProduct) => {
            total_cost += eProduct.quantity * eProduct.import_price;
            total_discount += eProduct.discount || 0;
            final_cost += eProduct.quantity * eProduct.import_price - eProduct.discount || 0;
            total_quantity += eProduct.quantity;
            return {
                ...eProduct,
                product_info: _products[eProduct.product_id],
                variant_info: _variants[eProduct.variant_id],
            };
        });
        _order = {
            order_id: _order.order_id,
            code: _order.code,
            export_location: _order.export_location,
            export_location_info: _order.export_location_info,
            import_location: _order.import_location,
            import_location_info: _order.import_location_info,
            products: _order.products,
            total_cost: _order.total_cost,
            total_discount: _order.total_discount,
            cod: _order.cod,
            final_cost: _order.final_cost,
            total_quantity: _order.total_quantity,
            files: _order.files,
            // DRAFT - VERIFY - SHIPPING - COMPLETE - CANCEL
            status: String(_order.status).toUpperCase(),
            note: _order.note,
            verify_date: _order.verify_date,
            verifier_id: _order.verifier_id,
            complete_date: _order.complete_date,
            completer_id: _order.completer_id,
            create_date: _order.create_date,
            creator_id: _order.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            active: _order.active,
        };
        let importLocation = await client.db(req.user.database).collection('Branchs').findOne(_order.import_location);
        if (_order.status == 'VERIFY' && order.status != 'VERIFY') {
            _order['verifier_id'] = Number(req.user.user_id);
            _order['verify_date'] = moment().tz(TIMEZONE).format();
            let sortQuery = (() => {
                if (req.user.price_recipe == 'FIFO') {
                    return { create_date: 1 };
                }
                return { create_date: -1 };
            })();
            let locationMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Locations' });
            let locationId = (locationMaxId && locationMaxId.value) || 0;
            let inventoryMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Inventories' });
            let inventoryId = (inventoryMaxId && inventoryMaxId.value) || 0;
            let locations = await client
                .db(req.user.database)
                .collection('Locations')
                .find({
                    variant_id: { $in: variantIds },
                    branch_id: _order.export_location.branch_id,
                    quantity: { $gte: 0 },
                })
                .sort(sortQuery)
                .toArray();
            let _locations = {};
            locations.map((location) => {
                if (!_locations[location.variant_id]) {
                    _locations[location.variant_id] = [];
                }
                if (_locations[location.variant_id]) {
                    _locations[location.variant_id].push(location);
                }
            });
            let updateLocations = [];
            let _insertInventories = {};
            _order.products = _order.products.map((eProduct) => {
                if (!_locations[`${eProduct.variant_id}`]) {
                    throw new Error('400: Sản phẩm trong kho không đủ số lượng!');
                }
                let detailQuantity = eProduct.quantity;
                for (let i in _locations[`${eProduct.variant_id}`]) {
                    location = _locations[`${eProduct.variant_id}`][i];
                    if (detailQuantity == 0) {
                        break;
                    }
                    if (detailQuantity <= location.quantity) {
                        if (!_insertInventories[`${eProduct.variant_id}-${eProduct.import_price}`]) {
                            _insertInventories[`${eProduct.variant_id}-${eProduct.import_price}`] = {
                                inventory_id: ++inventoryId,
                                code: String(inventoryId).padStart(6, '0'),
                                order_id: _order.order_id,
                                product_id: eProduct.product_id,
                                variant_id: eProduct.variant_id,
                                branch_id: (_order.import_location && _order.import_location.branch_id) || 0,
                                type: 'transport-export-product',
                                import_quantity: 0,
                                import_price: 0,
                                export_quantity: detailQuantity,
                                export_price: location.import_price,
                                create_date: moment().tz(TIMEZONE).format(),
                                creator_id: Number(req.user.user_id),
                                last_update: moment().tz(TIMEZONE).format(),
                                updater_id: req.user.user_id,
                            };
                        } else {
                            _insertInventories[`${eProduct.variant_id}-${eProduct.import_price}`].export_quantity += detailQuantity;
                        }
                        location.quantity -= detailQuantity;
                        detailQuantity = 0;
                    } else {
                        if (!_insertInventories[`${eProduct.variant_id}-${eProduct.import_price}`]) {
                            _insertInventories[`${eProduct.variant_id}-${eProduct.import_price}`] = {
                                inventory_id: ++inventoryId,
                                code: String(inventoryId).padStart(6, '0'),
                                order_id: _order.order_id,
                                product_id: eProduct.product_id,
                                variant_id: eProduct.variant_id,
                                branch_id: (_order.import_location && _order.import_location.branch_id) || 0,
                                type: 'transport-export-product',
                                import_quantity: 0,
                                import_price: 0,
                                export_quantity: location.quantity,
                                export_price: location.import_price,
                                create_date: moment().tz(TIMEZONE).format(),
                                creator_id: Number(req.user.user_id),
                                last_update: moment().tz(TIMEZONE).format(),
                                updater_id: req.user.user_id,
                            };
                        } else {
                            _insertInventories[`${eProduct.variant_id}-${eProduct.import_price}`].export_quantity += location.quantity;
                        }
                        detailQuantity -= location.quantity;
                        location.quantity = 0;
                    }
                    updateLocations.push(location);
                }
                if (detailQuantity > 0) {
                    throw new Error('400: Sản phẩm trong kho không đủ số lượng!');
                }
                return eProduct;
            });
            let insertInventories = Object.values(_insertInventories);
            await client
                .db(req.user.database)
                .collection('AppSetting')
                .updateOne({ name: 'Locations' }, { $set: { name: 'Locations', value: locationId } }, { upsert: true });
            await client
                .db(req.user.database)
                .collection('AppSetting')
                .updateOne({ name: 'Inventories' }, { $set: { name: 'Inventories', value: inventoryId } }, { upsert: true });
            if (updateLocations.length > 0) {
                for (let i in updateLocations) {
                    delete updateLocations[i]._id;
                    await client
                        .db(req.user.database)
                        .collection('Locations')
                        .updateOne({ location_id: updateLocations[i].location_id }, { $set: updateLocations[i] });
                }
            }
            if (insertInventories.length > 0) {
                await client.db(req.user.database).collection('Inventories').insertMany(insertInventories);
            }
        }
        if (_order.status == 'COMPLETE' && order.status == 'VERIFY') {
            _order['completer_id'] = Number(req.user.user_id);
            _order['complete_date'] = moment().tz(TIMEZONE).format();
            let locationMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Locations' });
            let locationId = (locationMaxId && locationMaxId.value) || 0;
            let inventoryMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Inventories' });
            let inventoryId = (inventoryMaxId && inventoryMaxId.value) || 0;
            let inventories = await client
                .db(req.user.database)
                .collection('Inventories')
                .find({ order_id: _order.order_id, type: 'transport-export-product' })
                .toArray();
            let insertLocations = [];
            let insertInventories = [];
            inventories.map((eInventory) => {
                insertLocations.push({
                    location_id: ++locationId,
                    code: String(locationId).padStart(6, '0'),
                    product_id: eInventory.product_id,
                    variant_id: eInventory.variant_id,
                    branch_id: (_order.import_location && _order.import_location.branch_id) || 0,
                    name: importLocation.name,
                    import_price: eInventory.export_price,
                    quantity: eInventory.export_quantity,
                    create_date: moment().tz(TIMEZONE).format(),
                    creator_id: Number(req.user.user_id),
                    last_update: moment().tz(TIMEZONE).format(),
                    updater_id: req.user.user_id,
                });
                insertInventories.push({
                    inventory_id: ++inventoryId,
                    code: String(inventoryId).padStart(6, '0'),
                    order_id: eInventory.order_id,
                    product_id: eInventory.product_id,
                    variant_id: eInventory.variant_id,
                    branch_id: (_order.import_location && _order.import_location.branch_id) || 0,
                    type: 'transport-import-product',
                    import_quantity: eInventory.export_quantity,
                    import_price: eInventory.export_price,
                    export_quantity: 0,
                    export_price: 0,
                    create_date: moment().tz(TIMEZONE).format(),
                    creator_id: Number(req.user.user_id),
                    last_update: moment().tz(TIMEZONE).format(),
                    updater_id: req.user.user_id,
                });
            });
            await client
                .db(req.user.database)
                .collection('AppSetting')
                .updateOne({ name: 'Locations' }, { $set: { name: 'Locations', value: locationId } }, { upsert: true });
            await client
                .db(req.user.database)
                .collection('AppSetting')
                .updateOne({ name: 'Inventories' }, { $set: { name: 'Inventories', value: inventoryId } }, { upsert: true });
            if (insertLocations.length > 0) {
                await client.db(req.user.database).collection('Locations').insertMany(insertLocations);
            }
            if (insertInventories.length > 0) {
                await client.db(req.user.database).collection('Inventories').insertMany(insertInventories);
            }
        } else {
            if (_order.status == 'COMPLETE' && order.status != 'VERIFY') {
                throw new Error(`400: Phiếu chuyển hàng chưa được xác nhận!`);
            }
        }
        if (_order.status == 'CANCEL' && order.status != 'CANCEL') {
            _order['canceler_id'] = Number(req.user.user_id);
            _order['cancel_date'] = moment().tz(TIMEZONE).format();
            if (order.status != 'DRAFT') {
                let importOrderMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'ImportOrders' });
                let importOrderId = (importOrderMaxId && importOrderMaxId.value) || 0;
                let importOrder = {
                    order_id: importOrderId,
                    code: String(importOrderId).padStart(6, '0'),
                    import_location: _order.export_location.branch_id,
                    products: _order.products || [],
                    total_quantity: 0,
                    total_cost: 0,
                    total_tax: 0,
                    total_discount: 0,
                    fee_shipping: 0,
                    final_cost: 0,
                    note: 'Phiêu nhập hàng của đơn hàng bị hoàn trả',
                    files: [],
                    tags: [],
                    slug_tags: [],
                    // DRAFT - VERIFY - SHIPPING - COMPLETE - CANCEL
                    status: 'DRAFT',
                    payment_info: [],
                    payment_amount: 0,
                    // UNPAID - PAYING - PAID - REFUND
                    payment_status: 'PAID',
                    create_date: moment().tz(TIMEZONE).format(),
                    creator_id: req.user.user_id,
                    verify_date: '',
                    verifier_id: '',
                    delivery_date: '',
                    deliverer_id: '',
                    complete_date: '',
                    completer_id: '',
                    cancel_date: '',
                    canceler_id: '',
                    order_creator_id: req.body.order_creator_id,
                    receiver_id: req.body.receiver_id,
                    last_update: moment().tz(TIMEZONE).format(),
                    active: true,
                };
                await client
                    .db(req.user.database)
                    .collection('AppSetting')
                    .updateOne({ name: 'ImportOrders' }, { $set: { name: 'ImportOrders', value: importOrderId } });
                await client.db(req.user.database).collection('ImportOrders').insertOne(importOrder);
            }
        }
        await client.db(req.user.database).collection('TransportOrders').updateOne(req.params, { $set: _order });
        res.send({ success: true, data: _order });
    } catch (err) {
        next(err);
    }
};

module.exports._deleteTransportOrder = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection('TransportOrders')
            .deleteMany({ order_id: { $in: req.body.order_id } });
        res.send({ success: true, message: 'Xóa phiếu chuyển hàng thành công!' });
    } catch (err) {
        next(err);
    }
};

module.exports._getInventoryNote = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        if (req.query.inventory_note_id) {
            aggregateQuery.push({
                $match: { inventory_note_id: Number(req.query.inventory_note_id) },
            });
        }
        if (req.query.code) {
            aggregateQuery.push({ $match: { code: String(req.query.code) } });
        }
        if (req.query.status) {
            aggregateQuery.push({ $match: { status: String(req.query.status) } });
        }
        if (req.query['today'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).startOf('days').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).endOf('days').format();
            delete req.query.today;
        }
        if (req.query['yesterday'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).add(-1, `days`).startOf('days').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).add(-1, `days`).endOf('days').format();
            delete req.query.yesterday;
        }
        if (req.query['this_week'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).startOf('weeks').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).endOf('weeks').format();
            delete req.query.this_week;
        }
        if (req.query['last_week'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).add(-1, 'weeks').startOf('weeks').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).add(-1, 'weeks').endOf('weeks').format();
            delete req.query.last_week;
        }
        if (req.query['this_month'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).startOf('months').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).endOf('months').format();
            delete req.query.this_month;
        }
        if (req.query['last_month'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).add(-1, 'months').startOf('months').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).add(-1, 'months').endOf('months').format();
            delete req.query.last_month;
        }
        if (req.query['this_year'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).startOf('years').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).endOf('years').format();
            delete req.query.this_year;
        }
        if (req.query['last_year'] != undefined) {
            req.query[`from_date`] = moment().tz(TIMEZONE).add(-1, 'years').startOf('years').format();
            req.query[`to_date`] = moment().tz(TIMEZONE).add(-1, 'years').endOf('years').format();
            delete req.query.last_year;
        }
        if (req.query['from_date'] != undefined) {
            req.query[`from_date`] = moment(req.query[`from_date`]).tz(TIMEZONE).startOf('days').format();
        }
        if (req.query['to_date'] != undefined) {
            req.query[`to_date`] = moment(req.query[`to_date`]).tz(TIMEZONE).endOf('days').format();
        }
        if (req.query.from_date) {
            aggregateQuery.push({
                $match: { create_date: { $gte: req.query.from_date } },
            });
        }
        if (req.query.to_date) {
            aggregateQuery.push({
                $match: { create_date: { $lte: req.query.to_date } },
            });
        }

        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Branchs',
                    localField: 'branch_id',
                    foreignField: 'branch_id',
                    as: 'branch',
                },
            },
            { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } }
        );

        aggregateQuery.push({
            $lookup: {
                from: 'Users',
                localField: 'inventorier_id',
                foreignField: 'user_id',
                as: 'inventorier_info',
            },
        });
        aggregateQuery.push({
            $lookup: {
                from: 'Users',
                localField: 'balancer_id',
                foreignField: 'user_id',
                as: 'balancer_info',
            },
        });
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Users',
                    localField: 'creator_id',
                    foreignField: 'user_id',
                    as: 'creator_info',
                },
            },
            { $unwind: { path: '$creator_info', preserveNullAndEmptyArrays: true } }
        );
        let countQuery = [...aggregateQuery];
        aggregateQuery.push({ $sort: { create_date: -1 } });
        if (req.query.page && req.query.page_size) {
            let page = Number(req.query.page) || 1;
            let page_size = Number(req.query.page_size) || 50;
            aggregateQuery.push({ $skip: (page - 1) * page_size }, { $limit: page_size });
        }

        // lấy data từ database
        let [orders, counts] = await Promise.all([
            client.db(req.user.database).collection(`InventoryNotes`).aggregate(aggregateQuery).toArray(),
            client
                .db(req.user.database)
                .collection(`InventoryNotes`)
                .aggregate([...countQuery, { $count: 'counts' }])
                .toArray(),
        ]);
        res.send({
            success: true,
            count: counts[0] ? counts[0].counts : 0,
            data: orders,
        });
    } catch (err) {
        next(err);
    }
};

module.exports._createInventoryNote = async (req, res, next) => {
    try {
        let inventoryNoteMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'InventoryNotes' });
        let inventoryNoteId = (inventoryNoteMaxId && inventoryNoteMaxId.value) || 0;
        let branch = await client.db(req.user.database).collection('Branchs').findOne({ branch_id: req.body.branch_id });
        if (!branch) {
            throw new Error('400: Chi nhánh không tồn tại!');
        }
        let productIds = [];
        let variantIds = [];
        req.body.products.map((eProduct) => {
            productIds.push(eProduct.product_id);
            variantIds.push(eProduct.variant_id);
        });
        productIds = [...new Set(productIds)];
        variantIds = [...new Set(variantIds)];
        let _products = await client
            .db(req.user.database)
            .collection('Products')
            .aggregate([{ $match: { product_id: { $in: productIds } } }])
            .toArray((docs) => docs.reduce((pre, cur) => ({ ...pre, ...(cur && cur.product_id && { [cur.product_id]: cur }) }), {}));
        let _variants = await client
            .db(req.user.database)
            .collection('Variants')
            .aggregate([{ $match: { variant_id: { $in: variantIds } } }])
            .toArray((docs) => docs.reduce((pre, cur) => ({ ...pre, ...(cur && cur.variant_id && { [cur.variant_id]: cur }) }), {}));
        for (let i in req.body.products) {
            let eProduct = { ...req.body.products[i] };
            eProduct = {
                product_id:
                    (!isNaN(eProduct.product_id) && eProduct.product_id) ||
                    (() => {
                        throw new Error(`400: product_id ${eProduct.product_id} is not valid!`);
                    }),
                variant_id:
                    (!isNaN(eProduct.variant_id) && eProduct.variant_id) ||
                    (() => {
                        throw new Error(`400: variant_id ${eProduct.variant_id} is not valid!`);
                    }),
                system_quantity:
                    (!isNaN(eProduct.system_quantity) && eProduct.system_quantity) ||
                    (() => {
                        throw new Error(`400: system_quantity of ${eProduct.variant_id} is not valid!`);
                    }),
                real_quantity:
                    (!isNaN(eProduct.real_quantity) && eProduct.real_quantity) ||
                    (() => {
                        throw new Error(`400: real_quantity of ${eProduct.variant_id} is not valid!`);
                    }),
                diff_reason: eProduct.diff_reason || '',
                product_info:
                    _products[eProduct.product_id] ||
                    (() => {
                        throw new Error(`400: product_id ${eProduct.product_id} is not exists!`);
                    }),
                variant_info:
                    _variants[eProduct.variant_id] ||
                    (() => {
                        throw new Error(`400: variant_id ${eProduct.variant_id} is not exists!`);
                    }),
            };
            req.body.products[i] = eProduct;
        }
        let _inventoryNote = {
            inventory_note_id: ++inventoryNoteId,
            code: String(inventoryNoteId).padStart(6, '0'),
            branch_id: req.body.branch_id,
            products: req.body.products,
            note: req.body.note || '',
            status: req.body.status || 'DRAFT',
            balance: false,
            inventory_date: req.body.inventory_date || '',
            inventorier_id: req.body.inventorier_id || '',
            balance_date: '',
            balancer_id: '',
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
        };
        if (_inventoryNote.balance == true) {
            _inventoryNote.balance_date = moment().tz(TIMEZONE).format();
            _inventoryNote.balancer_id = moment().tz(TIMEZONE).format();
            let sortQuery = (() => {
                if (req.user._business.price_recipe == 'LIFO') {
                    return { create_date: -1 };
                }
                return { create_date: 1 };
            })();
            let locations = await client
                .db(req.user.database)
                .collection('Locations')
                .find({
                    variant_id: { $in: variantIds },
                    branch_id: _inventoryNote.branch_id,
                    quantity: { $gte: 0 },
                })
                .sort(sortQuery)
                .toArray();
            let _locations = {};
            locations.map((eLocation) => {
                if (eLocation && eLocation.variant_id) {
                    if (!_locations[eLocation.variant_id]) {
                        _locations[eLocation.variant_id] = [];
                    }
                    if (_locations[eLocation.variant_id]) {
                        _locations[eLocation.variant_id].push(eLocation);
                    }
                }
            });
            let inventoryMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Inventories' });
            let inventoryId = (inventoryMaxId && inventoryMaxId.value) || 0;
            let updateLocations = [];
            let insertInventories = [];
            for (let i in _inventoryNote.products) {
                let eProduct = { ..._inventoryNote.products[i] };
                for (let j in _locations[eProduct.variant_id]) {
                    let eLocation = _locations[eProduct.variant_id][j];
                    delete eLocation._id;
                    if (eProduct.system_quantity == eProduct.real_quantity) {
                        break;
                    }
                    if (eProduct.system_quantity > eProduct.real_quantity) {
                        if (eProduct.real_quantity + eLocation.quantity > eProduct.system_quantity) {
                            insertInventories.push({
                                inventory_id: ++inventoryId,
                                code: String(inventoryId).padStart(6, '0'),
                                order_id: orderId,
                                product_id: eProduct.product_id,
                                variant_id: eProduct.variant_id,
                                branch_id: _inventoryNote.branch_id,
                                type: 'balance-export-product',
                                import_quantity: 0,
                                import_price: 0,
                                export_quantity: eProduct.system_quantity - eProduct.real_quantity,
                                export_price: eLocation.import_price,
                                create_date: moment().tz(TIMEZONE).format(),
                                creator_id: req.user.user_id,
                                last_update: moment().tz(TIMEZONE).format(),
                                updater_id: req.user.user_id,
                            });
                            eLocation.quantity = eProduct.system_quantity - eProduct.real_quantity;
                            eProduct.real_quantity = eProduct.system_quantity;
                        } else {
                            insertInventories.push({
                                inventory_id: ++inventoryId,
                                code: String(inventoryId).padStart(6, '0'),
                                order_id: orderId,
                                product_id: eProduct.product_id,
                                variant_id: eProduct.variant_id,
                                branch_id: _inventoryNote.branch_id,
                                type: 'balance-export-product',
                                import_quantity: 0,
                                import_price: 0,
                                export_quantity: eLocation.quantity,
                                export_price: eLocation.import_price,
                                create_date: moment().tz(TIMEZONE).format(),
                                creator_id: req.user.user_id,
                                last_update: moment().tz(TIMEZONE).format(),
                                updater_id: req.user.user_id,
                            });
                            eProduct.real_quantity += eLocation.quantity;
                            eLocation.quantity = 0;
                        }
                    } else {
                        insertInventories.push({
                            inventory_id: ++inventoryId,
                            code: String(inventoryId).padStart(6, '0'),
                            order_id: orderId,
                            product_id: eProduct.product_id,
                            variant_id: eProduct.variant_id,
                            branch_id: _inventoryNote.branch_id,
                            type: 'balance-import-product',
                            import_quantity: eProduct.real_quantity - eProduct.system_quantity,
                            import_price: eLocation.import_price,
                            export_quantity: 0,
                            export_price: 0,
                            create_date: moment().tz(TIMEZONE).format(),
                            creator_id: req.user.user_id,
                            last_update: moment().tz(TIMEZONE).format(),
                            updater_id: req.user.user_id,
                        });
                        eLocation.quantity += eProduct.real_quantity - eProduct.system_quantity;
                    }
                    updateLocations.push(eLocation);
                }
            }
            if (updateLocations.length > 0) {
                for (let i in updateLocations) {
                    await client
                        .db(req.user.database)
                        .collection('Locations')
                        .updateOne({ location_id: updateLocations[i].location_id }, { $set: updateLocations[i] });
                }
            }
            if (insertInventories.length > 0) {
                await client.db(req.user.database).collection('Inventories').insertMany(insertInventories);
            }
        }
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'InventoryNotes' }, { $set: { name: 'InventoryNotes', value: inventoryNoteId } }, { upsert: true });
        await client.db(req.user.database).collection('InventoryNotes').insertOne(_inventoryNote);
        res.send({ success: true, data: _inventoryNote });
    } catch (err) {
        next(err);
    }
};

module.exports._createInventoryNoteFile = async (req, res, next) => {
    try {
    } catch (err) {
        next(err);
    }
};

module.exports._updateInventoryNote = async (req, res, next) => {
    try {
        req.params.inventory_note_id = Number(req.params.inventory_note_id);
        console.log(req.user.database);
        let inventoryNote = await client
            .db(req.user.database)
            .collection('InventoryNotes')
            .findOne({ inventory_note_id: req.params.inventory_note_id });
        if (!inventoryNote) {
            throw new Error(`400: Phiếu kiểm hàng không tồn tại!`);
        }
        delete req.body._id;
        delete req.body.inventory_note_id;
        delete req.body.code;
        delete req.body.branch_id;
        delete req.body.inventory_date;
        delete req.body.inventorier_id;
        delete req.body.balance_date;
        delete req.body.balancer_id;
        delete req.body.inventory_date;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _inventoryNote = { ...inventoryNote, ...req.body };
        _inventoryNote = {
            inventory_note_id: _inventoryNote.inventory_note_id,
            code: _inventoryNote.code,
            branch_id: _inventoryNote.branch_id,
            products: _inventoryNote.products,
            note: _inventoryNote.note,
            status: _inventoryNote.status,
            balance: _inventoryNote.balance,
            inventory_date: _inventoryNote.inventory_date,
            inventorier_id: _inventoryNote.inventorier_id,
            balance_date: _inventoryNote.balance_date,
            balancer_id: _inventoryNote.balancer_id,
            create_date: _inventoryNote.create_date,
            creator_id: _inventoryNote.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
        };
        let productIds = [];
        let variantIds = [];
        _inventoryNote.products.map((eProduct) => {
            productIds.push(eProduct.product_id);
            variantIds.push(eProduct.variant_id);
        });
        productIds = [...new Set(productIds)];
        variantIds = [...new Set(variantIds)];
        let _products = await client
            .db(req.user.database)
            .collection('Products')
            .aggregate([{ $match: { product_id: { $in: productIds } } }])
            .toArray((docs) => docs.reduce((pre, cur) => ({ ...pre, ...(cur && cur.product_id && { [cur.product_id]: cur }) }), {}));
        let _variants = await client
            .db(req.user.database)
            .collection('Variants')
            .aggregate([{ $match: { variant_id: { $in: variantIds } } }])
            .toArray((docs) => docs.reduce((pre, cur) => ({ ...pre, ...(cur && cur.variant_id && { [cur.variant_id]: cur }) }), {}));
        for (let i in _inventoryNote.products) {
            let eProduct = { ..._inventoryNote.products[i] };
            eProduct = {
                product_id:
                    (!isNaN(eProduct.product_id) && eProduct.product_id) ||
                    (() => {
                        throw new Error(`400: product_id ${eProduct.product_id} is not valid!`);
                    }),
                variant_id:
                    (!isNaN(eProduct.variant_id) && eProduct.variant_id) ||
                    (() => {
                        throw new Error(`400: variant_id ${eProduct.variant_id} is not valid!`);
                    }),
                system_quantity:
                    (!isNaN(eProduct.system_quantity) && eProduct.system_quantity) ||
                    (() => {
                        throw new Error(`400: system_quantity of ${eProduct.variant_id} is not valid!`);
                    }),
                real_quantity:
                    (!isNaN(eProduct.real_quantity) && eProduct.real_quantity) ||
                    (() => {
                        throw new Error(`400: real_quantity of ${eProduct.variant_id} is not valid!`);
                    }),
                diff_reason: eProduct.diff_reason || '',
                product_info:
                    _products[eProduct.product_id] ||
                    (() => {
                        throw new Error(`400: product_id ${eProduct.product_id} is not exists!`);
                    }),
                variant_info:
                    _variants[eProduct.variant_id] ||
                    (() => {
                        throw new Error(`400: variant_id ${eProduct.variant_id} is not exists!`);
                    }),
            };
            _inventoryNote.products[i] = eProduct;
        }
        if (inventoryNote.balance == true) {
            throw new Error('400: Phiếu kiểm hàng sau khi cân bằng không thể cập nhật!');
        }
        if (inventoryNote.balance == false && _inventoryNote.balance == true) {
            _inventoryNote.balance_date = moment().tz(TIMEZONE).format();
            _inventoryNote.balancer_id = moment().tz(TIMEZONE).format();
            let sortQuery = (() => {
                if (req.user._business.price_recipe == 'LIFO') {
                    return { create_date: -1 };
                }
                return { create_date: 1 };
            })();
            let locations = await client
                .db(req.user.database)
                .collection('Locations')
                .find({
                    variant_id: { $in: variantIds },
                    branch_id: _inventoryNote.branch_id,
                    quantity: { $gte: 0 },
                })
                .sort(sortQuery)
                .toArray();
            let _locations = {};
            locations.map((eLocation) => {
                if (eLocation && eLocation.variant_id) {
                    if (!_locations[eLocation.variant_id]) {
                        _locations[eLocation.variant_id] = [];
                    }
                    if (_locations[eLocation.variant_id]) {
                        _locations[eLocation.variant_id].push(eLocation);
                    }
                }
            });
            let inventoryMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Inventories' });
            let inventoryId = (inventoryMaxId && inventoryMaxId.value) || 0;
            let updateLocations = [];
            let insertInventories = [];
            for (let i in _inventoryNote.products) {
                let eProduct = { ..._inventoryNote.products[i] };
                for (let j in _locations[eProduct.variant_id]) {
                    let eLocation = _locations[eProduct.variant_id][j];
                    delete eLocation._id;
                    if (eProduct.system_quantity == eProduct.real_quantity) {
                        break;
                    }
                    if (eProduct.system_quantity > eProduct.real_quantity) {
                        if (eProduct.real_quantity + eLocation.quantity > eProduct.system_quantity) {
                            insertInventories.push({
                                inventory_id: ++inventoryId,
                                code: String(inventoryId).padStart(6, '0'),
                                order_id: orderId,
                                product_id: eProduct.product_id,
                                variant_id: eProduct.variant_id,
                                branch_id: _inventoryNote.branch_id,
                                type: 'balance-export-product',
                                import_quantity: 0,
                                import_price: 0,
                                export_quantity: eProduct.system_quantity - eProduct.real_quantity,
                                export_price: eLocation.import_price,
                                create_date: moment().tz(TIMEZONE).format(),
                                creator_id: req.user.user_id,
                                last_update: moment().tz(TIMEZONE).format(),
                                updater_id: req.user.user_id,
                            });
                            eLocation.quantity = eProduct.system_quantity - eProduct.real_quantity;
                            eProduct.real_quantity = eProduct.system_quantity;
                        } else {
                            insertInventories.push({
                                inventory_id: ++inventoryId,
                                code: String(inventoryId).padStart(6, '0'),
                                order_id: orderId,
                                product_id: eProduct.product_id,
                                variant_id: eProduct.variant_id,
                                branch_id: _inventoryNote.branch_id,
                                type: 'balance-export-product',
                                import_quantity: 0,
                                import_price: 0,
                                export_quantity: eLocation.quantity,
                                export_price: eLocation.import_price,
                                create_date: moment().tz(TIMEZONE).format(),
                                creator_id: req.user.user_id,
                                last_update: moment().tz(TIMEZONE).format(),
                                updater_id: req.user.user_id,
                            });
                            eProduct.real_quantity += eLocation.quantity;
                            eLocation.quantity = 0;
                        }
                    } else {
                        insertInventories.push({
                            inventory_id: ++inventoryId,
                            code: String(inventoryId).padStart(6, '0'),
                            order_id: orderId,
                            product_id: eProduct.product_id,
                            variant_id: eProduct.variant_id,
                            branch_id: _inventoryNote.branch_id,
                            type: 'balance-import-product',
                            import_quantity: eProduct.real_quantity - eProduct.system_quantity,
                            import_price: eLocation.import_price,
                            export_quantity: 0,
                            export_price: 0,
                            create_date: moment().tz(TIMEZONE).format(),
                            creator_id: req.user.user_id,
                            last_update: moment().tz(TIMEZONE).format(),
                            updater_id: req.user.user_id,
                        });
                        eLocation.quantity += eProduct.real_quantity - eProduct.system_quantity;
                    }
                    updateLocations.push(eLocation);
                }
            }
            if (updateLocations.length > 0) {
                for (let i in updateLocations) {
                    await client
                        .db(req.user.database)
                        .collection('Locations')
                        .updateOne({ location_id: updateLocations[i].location_id }, { $set: updateLocations[i] });
                }
            }
            if (insertInventories.length > 0) {
                await client.db(req.user.database).collection('Inventories').insertMany(insertInventories);
            }
        }
        await client
            .db(req.user.database)
            .collection('InventoryNotes')
            .updateOne({ inventory_note_id: _inventoryNote.inventory_note_id }, { $set: _inventoryNote });
        res.send({ success: true, message: 'Cập nhật phiếu kiểm hàng thành công!' });
    } catch (err) {
        next(err);
    }
};

module.exports._deleteInventoryNote = async (req, res, next) => {
    try {
    } catch (err) {
        next(err);
    }
};
