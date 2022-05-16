const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const DB = process.env.DATABASE;
const client = require(`../config/mongodb`);
const orderService = require(`../services/order`);
var CryptoJS = require('crypto-js');
const { validateEmail } = require('../utils/regex');
const { sendMailThanksOrder } = require('../libs/nodemailer');
const { _changePoint } = require('./customer');
const shippingService = require(`../services/shopping_dairy`)

module.exports.enumStatusOrder = async (req, res, next) => {
    try {
        var enums = await client.db(DB).collection('EnumStatusOrder').find({}).toArray();
        return res.send({ success: true, data: enums });
    } catch (err) {
        next(err);
    }
};

module.exports.enumStatusShipping = async (req, res, next) => {
    try {
        var enums = await client.db(DB).collection('EnumStatusShipping').find({}).toArray();
        return res.send({ success: true, data: enums });
    } catch (err) {
        next(err);
    }
};

module.exports._get = async (req, res, next) => {
    try {
        console.log("vuot qua auth");
        await orderService._get(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._create = async (req, res, next) => {
    try {
        let hmac = req.body.order;
        try {
            let bytes = CryptoJS.AES.decrypt(hmac, 'vierthanhcong');
            let decryptedData = bytes.toString(CryptoJS.enc.Utf8);
            req.body = JSON.parse(decryptedData);
            // console.log(req.body);
        } catch (err) {
            console.log(err);
            throw new Error('400: Đơn hàng không chính xác!');
        }
        if (!req.body.order_details || req.body.order_details.length == 0) {
            throw new Error('400: Không thể tạo đơn hàng không có sản phẩm!');
        }

        if (req.body.channel == undefined) throw new Error('400: Không lòng truyền thuộc tính channel!');

        let customer = await client.db(req.user.database).collection('Customers').findOne({ customer_id: req.body.customer_id });
        if (!customer) {
            throw new Error('400: Khách hàng không khả dụng!');
        }
        let employee = await client.db(req.user.database).collection('Users').findOne({ user_id: req.user.user_id });
        if (!employee) {
            throw new Error(`400: Nhân viên không khả dụng!`);
        }
        let orderMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Orders' });
        let orderId = (orderMaxId && orderMaxId.value) || 0;
        let productIds = [];
        let variantIds = [];
        let categoryIds = [];
        req.body.order_details.map((detail) => {
            productIds.push(detail.product_id);
            variantIds.push(detail.variant_id);
        });

        let products = await client
            .db(req.user.database)
            .collection('Products')
            .aggregate([
                { $match: { product_id: { $in: productIds } } },
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
        let variants = await client
            .db(req.user.database)
            .collection('Variants')
            .aggregate([{ $match: { variant_id: { $in: variantIds } } }])
            .toArray();
        let _products = {};
        products.map((eProduct) => {
            _products[eProduct.product_id] = eProduct;
            categoryIds = [...categoryIds, ...eProduct.category_id];
        });
        let _variants = {};
        variants.map((eVariant) => {
            _variants[eVariant.variant_id] = eVariant;
        });
        let totalCost = 0;
        var totalQuantity = 0;
        req.body.order_details = req.body.order_details.map((eDetail) => {
            let _detail = {
                ..._products[eDetail.product_id],
                ..._variants[eDetail.variant_id],
                ...eDetail,
                product_info: _products[eDetail.product_id],
                variant_info: _variants[eDetail.variant_id],
            };
            totalCost += eDetail.price * eDetail.quantity;
            totalQuantity += eDetail.quantity;
            _detail = {
                product_id: _detail.product_id,
                variant_id: _detail.variant_id,
                sku: _detail.sku,
                name: _detail.name,
                title: _detail.title,
                length: _detail.length,
                width: _detail.width,
                height: _detail.height,
                weight: _detail.weight,
                price: _detail.price,
                base_prices: _detail.base_prices || [],
                quantity: _detail.quantity,
                total_base_price: _detail.total_base_price || 0,
                total_cost: _detail.price * _detail.quantity,
                total_tax: _detail.total_tax || 0,
                total_discount: _detail.total_discount || 0,
                final_cost: _detail.price * _detail.quantity - _detail.total_tax || 0 - _detail.total_discount || 0,
                product_info: _detail.product_info,
                variant_info: _detail.variant_info,
            };
            return _detail;
        });
        if (totalCost != req.body.total_cost) {
            throw new Error('400: Tổng giá trị đơn hàng không chính xác!');
        }
        let _order = {
            order_id: ++orderId,
            code: String(orderId).padStart(6, '0'),
            platform_id: req.body.platform_id || 1,
            channel: req.body.channel || 'POS',
            sale_location: req.body.sale_location,
            customer_id: customer.customer_id,
            employee_id: employee.user_id,
            order_details: req.body.order_details,
            shipping_company_id: req.body.shipping_company_id,
            shipping_info: ((data) => {
                if (!data) {
                    data = {};
                }
                return {
                    tracking_number: data.tracking_number || '',
                    to_name: data.to_name || '',
                    to_phone: data.to_phone || '',
                    to_address: data.to_address || '',
                    to_ward: data.to_ward || '',
                    to_district: data.to_district || '',
                    to_province: data.to_province || '',
                    to_province_code: data.to_province_code || '',
                    to_postcode: data.to_postcode || '',
                    to_country_code: data.to_country_code || '',
                    return_name: data.return_name || '',
                    return_phone: data.return_phone || '',
                    return_address: data.return_address || '',
                    return_ward: data.return_ward || '',
                    return_district: data.return_district || '',
                    return_province: data.return_province || '',
                    return_province_code: data.return_province_code || '',
                    return_postcode: data.return_postcode || '',
                    return_country_code: data.return_country_code || '',
                    fee_shipping: data.fee_shipping || '',
                    cod: data.cod || '',
                    delivery_time: data.delivery_time || '',
                    complete_time: data.complete_time || '',
                };
            })(req.body.shipping_info),
            voucher: req.body.voucher,
            promotion: req.body.promotion,
            total_quantity: totalQuantity,
            total_cost: req.body.total_cost,
            total_tax: req.body.total_tax,
            total_discount: req.body.total_discount,
            final_cost: req.body.final_cost,
            // UNPAID - PAID - REFUND
            payments: req.body.payments || [],
            payment_status: req.body.payment_status,
            customer_paid: req.body.customer_paid,
            customer_debt: req.body.customer_debt,
            // DRAFT  - PROCESSING - COMPLETE - CANCEL - REFUND
            bill_status: req.body.bill_status,
            // DRAFT - WAITING_FOR_SHIPPING - SHIPPING - COMPLETE - CANCEL
            ship_status: req.body.ship_status,
            note: req.body.note,
            tags: req.body.tags,
            create_day: moment().tz(TIMEZONE).format('YYYY-MM-DD'),
            create_month: moment().tz(TIMEZONE).format('YYYY-MM'),
            create_year: moment().tz(TIMEZONE).format('YYYY'),
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            verify_date: '',
            verifier_id: '',
            is_delivery: req.body.is_delivery || false,
            delivery_date: '',
            deliverer_id: '',
            complete_date: '',
            completer_id: '',
            cancel_date: '',
            canceler_id: '',
            refund_date: '',
            refunder_id: '',
            product_handle: '',
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
            total_cod: 0,
            // hmac: hmac,
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Orders' }, { $set: { name: 'Orders', value: orderId } }, { upsert: true });
        if (!/^(draft)|(pre-order)$/gi.test(_order.bill_status)) {
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
                    branch_id: req.body.sale_location.branch_id,
                    quantity: { $gte: 0 },
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
            let inventoryMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Inventories' });
            let inventoryId = (inventoryMaxId && inventoryMaxId.value) || 0;
            let pointSetting = await client
                .db(req.user.database)
                .collection('PointSettings')
                .findOne({
                    $or: [{ all_branch: true }, { branch_id: { $in: [_order.sale_location.branch_id] } }],
                    $or: [{ all_customer_type: true }, { customer_type_id: { $in: [customer.type_id] } }],
                    $or: [{ all_category: true }, { category_id: { $in: productIds } }],
                    $or: [{ all_product: true }, { product_id: { $in: categoryIds } }],
                });
            let updateLocations = [];
            let insertInventories = [];
            let increasePoint = 0;
            var total_base_price = 0;
            var total_profit = 0;
            _order.order_details = _order.order_details.map((eDetail) => {
                if (!_locations[eDetail.variant_id]) {
                    throw new Error('400: Sản phẩm không được cung cấp tại địa điểm bán!');
                }
                if (pointSetting) {
                    if (pointSetting.all_category || pointSetting.all_product) {
                        increasePoint += eDetail.total_cost / pointSetting.exchange_point_rate;
                    } else {
                        if (
                            pointSetting.product_id.includes(eDetail.product_id) ||
                            [...new Set([...pointSetting.category_id, ...((eDetail.product_info && eDetail.product_info.category_id) || [''])])]
                                .length != [...pointSetting.category_id, ...((eDetail.product_info && eDetail.product_info.category_id) || [''])]
                        ) {
                            increasePoint += eDetail.total_cost / pointSetting.exchange_point_rate;
                        }
                    }
                }
                let detailQuantity = eDetail.quantity;
                for (let i in _locations[eDetail.variant_id]) {
                    let _location = _locations[eDetail.variant_id][i];
                    if (detailQuantity == 0) {
                        break;
                    }
                    let _basePrice = {
                        location_id: _location.location_id,
                        branch_id: _location.branch_id,
                        product_id: _location.product_id,
                        variant_id: _location.variant_id,
                        base_price: _location.import_price,
                        quantity: 0,
                    };
                    if (detailQuantity <= _location.quantity) {
                        _basePrice.quantity = detailQuantity;
                        eDetail.total_base_price += detailQuantity * _location.import_price;
                        _location.quantity -= detailQuantity;
                        detailQuantity = 0;
                    }
                    if (detailQuantity > _location.quantity) {
                        _basePrice.quantity = _location.quantity;
                        eDetail.total_base_price += _location.quantity * _location.import_price;
                        detailQuantity -= _location.quantity;
                        _location.quantity = 0;
                    }
                    total_base_price += eDetail.total_base_price;
                    total_profit += parseFloat(eDetail.total_cost) - parseFloat(eDetail.total_base_price);
                    eDetail.base_prices.push(_basePrice);
                    updateLocations.push({
                        ..._location,
                        last_update: moment().tz(TIMEZONE).format(),
                        updater_id: req.user.user_id,
                    });
                    insertInventories.push({
                        inventory_id: ++inventoryId,
                        code: String(inventoryId).padStart(6, '0'),
                        product_id: eDetail.product_id,
                        variant_id: eDetail.variant_id,
                        branch_id: (_order.sale_location && _order.sale_location.branch_id) || 0,
                        type: 'sale-order-export',
                        import_quantity: 0,
                        import_price: 0,
                        export_quantity: _basePrice.quantity,
                        export_price: _location.import_price,
                        create_date: moment().tz(TIMEZONE).format(),
                        creator_id: req.user.user_id,
                        last_update: moment().tz(TIMEZONE).format(),
                        updater_id: req.user.user_id,
                    });
                }
                if (detailQuantity > 0) {
                    throw new Error('400: Sản phẩm tại địa điểm bán không đủ số lượng cung cấp!');
                }
                return eDetail;
            });
            if (pointSetting) {
                let decreasePoint = 0;
                for (let i in _order.payments) {
                    if (_order.payments[i].method == 'POINT') {
                        decreasePoint = _order.payments[i].value / pointSetting.exchange_money_rate;
                    }
                }
                await _changePoint({
                    database: req.user.database,
                    customer: customer,
                    order: _order,
                    increasePoint: increasePoint,
                    decreasePoint: decreasePoint,
                    isExists: true,
                    writeLog: true,
                });
            }
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
                // console.log(inventoryId);
                await client
                    .db(req.user.database)
                    .collection('AppSetting')
                    .updateOne({ name: 'Inventories' }, { $set: { name: 'Inventories', value: inventoryId } }, { upsert: true });
                await client.db(req.user.database).collection('Inventories').insertMany(insertInventories);
            }
            let receiptMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Finances' });
            let receiptId = (receiptMaxId && receiptMaxId.value) || 0;
            let _finance = {
                receipt_id: ++receiptId,
                source: req.body.source || 'AUTO',
                //REVENUE - EXPENDITURE
                type: req.body.type || 'REVENUE',
                payments: req.body.payments || [],
                value: req.body.final_cost || 0,
                payer: _order.customer_id,
                receiver: _order.employee_id,
                status: 'COMPLETE',
                note: req.body.note || '',
                create_date: moment().tz(TIMEZONE).format(),
                creator_id: req.user.user_id,
                last_update: moment().tz(TIMEZONE).format(),
                updater_id: req.user.user_id,
            };

            await client
                .db(req.user.database)
                .collection('AppSetting')
                .updateOne({ name: 'Finances' }, { $set: { name: 'Finances', value: receiptId } }, { upsert: true });
            let insertFinance = await client.db(req.user.database).collection('Finances').insertOne(_finance);
        }
        _order.total_base_price = total_base_price;
        _order.total_profit = total_profit;
        if (_order.is_delivery) {
            _order.total_cod = _order.final_cost;
        } else {
            _order.total_cod = 0;
        }

        // Xử lí thêm thuộc tính 'trackings' để truy vết tiến độ Vận chuyển
        var enumTrackings = await client.db(req.user.database).collection('EnumStatusShipping').find({}).toArray();
        for (var i = 0; i < enumTrackings.length; i++) {
            enumTrackings[i].time_update = 'Chưa cập nhật';
        }
        _order.trackings = enumTrackings;
        _order.customer_info = customer;
        req['body'] = _order;
        if (req.body.customer_info.email != undefined && validateEmail(req.body.customer_info.email)) {
            await sendMailThanksOrder(req.body.customer_info.email, 'Cám ơn bạn đã mua hàng', req.body);
        }
        await orderService._create(req, res, next);

        /**
         * create by: tailuong
         * create date:
         * des:
         * */

        // Tạo thêm bảng mua của userEKT
        let _oderEKT = {
            business_id: req.user._business.business_name,
            business_prefix: req.user._business.prefix,
            branch_id: _order.sale_location.branch_id,
            orderId: orderId,
            user_phone: customer.phone,
            user_name: customer.slug_name,

        }
        // // req[`body`] = _oderEKT;
        // // await shippingService._create(req,res,next);
        await client.db(DB).collection('Shopping').insertOne(_oderEKT)
    } catch (err) {
        next(err);
    }
};

module.exports._importFile = async (req, res, next) => {
    try {
    } catch (err) {
        next(err);
    }
};

module.exports._update = async (req, res, next) => {
    try {
        
        req.params.order_id = Number(req.params.order_id);
        let order = await client.db(req.user.database).collection(`Orders`).findOne(req.params);
        if (!order) {
            throw new Error(`400: Đơn hàng không tồn tại!`);
        }
        delete req.body._id;
        delete req.body.order_id;
        delete req.body.code;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _order = { ...order, ...req.body };
        _order = {
            order_id: _order.order_id,
            code: _order.code,
            channel: _order.channel,
            sale_location: _order.sale_location,
            customer_id: _order.customer_id,
            employee_id: _order.employee_id,
            order_details: _order.order_details,
            shipping_company_id: _order.shipping_company_id,
            shipping_info: _order.shipping_info,
            voucher: _order.voucher,
            promotion: _order.promotion,
            total_cost: _order.total_cost,
            total_tax: _order.total_tax,
            total_discount: _order.total_discount,
            final_cost: _order.final_cost,
            // UNPAID - PAID - REFUND
            payment_info: _order.payment_info,
            customer_paid: _order.customer_paid,
            customer_debt: _order.customer_debt,
            // DRAFT  - PROCESSING - COMPLETE - CANCEL - REFUND
            payment_status: _order.payment_status,
            // DRAFT - WATTING_FOR_SHIPPING - SHIPPING - COMPLETE - CANCEL
            bill_status: _order.bill_status,
            ship_status: _order.ship_status,
            note: _order.note,
            tags: _order.tags,
            create_date: _order.create_date,
            creator_id: _order.creator_id,
            verify_date: _order.verify_date,
            verifier_id: _order.verifier_id,
            is_delivery: _order.is_delivery,
            delivery_date: _order.delivery_date,
            deliverer_id: _order.deliverer_id,
            complete_date: _order.complete_date,
            completer_id: _order.completer_id,
            cancel_date: _order.cancel_date,
            canceler_id: _order.canceler_id,
            refund_date: _order.refund_date,
            refunder_id: _order.refunder_id,
            product_handle: _order.product_handle,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
        };

        // Cập nhật tracking_number
        if (req.body.shipping_info.tracking_number) _order.shipping_info.tracking_number = req.body.shipping_info.tracking_number;

        // Cập nhật shipping_name
        if (req.body.shipping_info.shipping_name) {
            _order.shipping_info.shipping_name = req.body.shipping_info.shipping_name;
        }

        if (_order.payments) {
            await Promise.all(
                _order.payments.map((payment, index) => {
                    if (payment.name == 'POINT' && !is_used) {
                        _order.payments[index].is_used = true;
                        return changePoint(req.user.database, { customer_id: req.body.customer_id }, 10);
                    }
                })
            );
        }
        let totalCost = 0;
        let productIds = [];
        let variantIds = [];
        _order.order_details.map((eDetail) => {
            totalCost += eDetail.price * eDetail.quantity;
            productIds.push(eDetail.product_id);
            variantIds.push(eDetail.variant_id);
        });
        if (totalCost != _order.total_cost) {
            throw new Error('400: Tổng giá trị đơn hàng không chính xác!');
        }
        let [products, variants] = await Promise.all([
            client
                .db(req.user.database)
                .collection('Products')
                .aggregate([
                    { $match: { product_id: { $in: productIds } } },
                    {
                        $lookup: {
                            from: 'Variants',
                            let: { productId: '$product_id' },
                            pipeline: [{ $match: { $expr: { $eq: ['$product_id', '$$productId'] } } }],
                            as: 'variants',
                        },
                    },
                ])
                .toArray(),
            client
                .db(req.user.database)
                .collection('Variants')
                .aggregate([{ $match: { variant_id: { $in: variantIds } } }])
                .toArray(),
        ]);
        let _products = {};
        products.map((eProduct) => {
            _products[String(eProduct.product_id)] = eProduct;
        });
        let _variants = {};
        variants.map((eVariant) => {
            _variants[String(eVariant.variant_id)] = eVariant;
        });
        if (/^(draft)$/gi.test(order.bill_status) && !/^((draft)|(cancel)|(refund))$/gi.test(_order.bill_status)) {
            let sortQuery = (() => {
                if (req.user.price_recipe == 'FIFO') {
                    return { create_date: 1 };
                }
                return { create_date: -1 };
            })();
            let locations = await client
                .db(req.user.database)
                .collection('Locations')
                .find({
                    variant_id: { $in: variantIds },
                    branch_id: _order.sale_location.branch_id,
                    quantity: { $gte: 0 },
                })
                .sort(sortQuery)
                .toArray();
            let _locations = {};
            locations.map((location) => {
                if (!_locations[String(location.variant_id)]) {
                    _locations[String(location.variant_id)] = [];
                }
                if (_locations[String(location.variant_id)]) {
                    _locations[String(location.variant_id)].push(location);
                }
            });
            let prices = await client
                .db(req.user.database)
                .collection('Prices')
                .find({ variant_id: { $in: variantIds } })
                .toArray();
            let _prices = {};
            prices.map((price) => {
                _prices[String(price.price_id)] = price;
            });
            let _updates = [];
            var total_base_price = 0;
            var total_profit = 0;
            _order.order_details = _order.order_details.map((eDetail) => {
                if (!_locations[`${eDetail.variant_id}`]) {
                    throw new Error('400: Sản phẩm không được cung cấp tại địa điểm bán!');
                }
                let detailQuantity = eDetail.quantity;
                for (let i in _locations[`${eDetail.variant_id}`]) {
                    location = _locations[`${eDetail.variant_id}`][i];
                    if (detailQuantity == 0) {
                        break;
                    }
                    let _basePrice = {
                        location_id: location.location_id,
                        branch_id: location.branch_id,
                        product_id: location.product_id,
                        variant_id: location.variant_id,
                        price_id: location.price_id,
                        quantity: 0,
                        base_price: location.import_price,
                    };
                    if (detailQuantity <= location.quantity) {
                        _basePrice.quantity = detailQuantity;
                        location.quantity -= detailQuantity;
                        detailQuantity = 0;
                    }
                    if (detailQuantity > location.quantity) {
                        _basePrice.quantity = location.quantity;
                        detailQuantity -= location.quantity;
                        location.quantity = 0;
                    }
                    eDetail.base_prices.push(_basePrice);
                    eDetail.total_base_price += location.quantity * location.import_price;
                    total_base_price += parseFloat(eDetail.total_base_price);
                    total_profit += parseFloat(eDetail.total_cost) - parseFloat(eDetail.total_base_price);

                    _updates.push(location);
                }
                if (detailQuantity > 0) {
                    throw new Error('400: Sản phẩm tại địa điểm bán không đủ số lượng cung cấp!');
                }
                return eDetail;
            });
            await Promise.all(
                _updates.map((eUpdate) => {
                    return client.db(req.user.database).collection('Locations').updateOne({ location_id: eUpdate.location_id }, { $set: eUpdate });
                })
            );
        }
        if (
            !/^(draft)$/gi.test(order.bill_status) &&
            !/^((cancel)|(refund))$/gi.test(order.bill_status) &&
            /^((cancel)|(refund))$/gi.test(_order.bill_status)
        ) {
            let _updates = [];
            _order.order_details.map((eDetail) => {
                if (eDetail.base_prices) {
                    eDetail.base_prices.map((eBasePrice) => {
                        _updates.push(eBasePrice);
                    });
                }
            });
            _order.total_base_price = total_base_price;
            _order.total_profit = total_profit;

            let importOrderMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'ImportOrders' });
            let importOrderId = (() => {
                if (importOrderMaxId && importOrderMaxId.value) {
                    return importOrderMaxId.value;
                }
                return 0;
            })();
            importOrderId++;
            let importOrder = {
                order_id: importOrderId,
                code: String(importOrderId).padStart(6, '0'),
                import_location: _order.sale_location.store_id,
                import_location_info: _order.sale_location,
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
                order_creator_id: req.user.user_id,
                receiver_id: '',
                last_update: moment().tz(TIMEZONE).format(),
                active: true,
            };
            await client
                .db(req.user.database)
                .collection('AppSetting')
                .updateOne({ name: 'ImportOrders' }, { $set: { name: 'ImportOrders', value: importOrderId } });
            await client.db(req.user.database).collection('ImportOrders').insertOne(importOrder);
        }
        req['body'] = _order;
        await orderService._update(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports._delete = async (req, res, next) => {
    try {
        await client
            .db(req.user.database)
            .collection('Orders')
            .deleteMany({ order_id: { $in: req.body.order_id } });
        res.send({ success: true, message: 'Xóa đơn hàng thành công!' });
    } catch (err) {
        next(err);
    }
};
