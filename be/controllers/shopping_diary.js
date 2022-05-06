const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const DB = process.env.DATABASE;
const client = require(`../config/mongodb`);

const ShoppingDairyService = require(`../services/shopping_dairy`);

var CryptoJS = require('crypto-js');

module.exports._get = async (req, res, next) => {
    try {
        await ShoppingDairyService._get(req, res, next);
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
            shipping_info: ((data) => {
                if (!data) {
                    return {};
                }
                return {
                    tracking_number: data.tracking_number,
                    to_name: data.to_name,
                    to_phone: data.to_phone,
                    to_address: data.to_address,
                    to_ward: data.to_ward,
                    to_district: data.to_district,
                    to_province: data.to_province,
                    to_province_code: data.to_province_code,
                    to_postcode: data.to_postcode,
                    to_country_code: data.to_country_code,
                    return_name: data.return_name,
                    return_phone: data.return_phone,
                    return_address: data.return_address,
                    return_ward: data.return_ward,
                    return_district: data.return_district,
                    return_province: data.return_province,
                    return_province_code: data.return_province_code,
                    return_postcode: data.return_postcode,
                    return_country_code: data.return_country_code,
                    fee_shipping: data.fee_shipping,
                    cod: data.cod,
                    delivery_time: data.delivery_time,
                    complete_time: data.complete_time,
                };
            })(_order.shipping_info),
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
                    return client
                        .db(req.user.database)
                        .collection('Locations')
                        .updateOne({ location_id: eUpdate.location_id }, { $set: eUpdate });
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

            let importOrderMaxId = await client
                .db(req.user.database)
                .collection('AppSetting')
                .findOne({ name: 'ImportOrders' });
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
