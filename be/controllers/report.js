const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const { createTimeline } = require('../utils/date-handle');
const DB = process.env.DATABASE;

module.exports._getIOIReport = async (req, res, next) => {
    try {
        let beginPeriodQuery = [];
        let inPeriodQuery = [];
        let endPeriodQuery = [];
        req.query = createTimeline(req.query);
        if (!req.query.from_date || !req.query.to_date) {
            throw new Error('400: Thiếu mốc thời gian cần báo cáo!');
        }
        if (req.query.from_date) {
            beginPeriodQuery.push({ $match: { create_date: { $lte: req.query.from_date } } });
            inPeriodQuery.push({ $match: { create_date: { $gte: req.query.from_date } } });
        }
        if (req.query.to_date) {
            inPeriodQuery.push({ $match: { create_date: { $lte: req.query.to_date } } });
            endPeriodQuery.push({ $match: { create_date: { $lte: req.query.to_date } } });
        }
        if (req.query.product_id) {
            beginPeriodQuery.push({ $match: { product_id: Number(req.query.product_id) } });
            inPeriodQuery.push({ $match: { product_id: Number(req.query.product_id) } });
            endPeriodQuery.push({ $match: { product_id: Number(req.query.product_id) } });
        }
        if (req.query.variant_id) {
            beginPeriodQuery.push({ $match: { variant_id: Number(req.query.variant_id) } });
            inPeriodQuery.push({ $match: { variant_id: Number(req.query.variant_id) } });
            endPeriodQuery.push({ $match: { variant_id: Number(req.query.variant_id) } });
        }
        if (req.query.branch_id) {
            beginPeriodQuery.push({ $match: { branch_id: Number(req.query.branch_id) } });
            inPeriodQuery.push({ $match: { branch_id: Number(req.query.branch_id) } });
            endPeriodQuery.push({ $match: { branch_id: Number(req.query.branch_id) } });
        }
        beginPeriodQuery.push({
            $group: {
                ...(() => {
                    if (/^(product)$/g.test(req.query.type)) {
                        return { _id: { product_id: '$product_id' }, product_id: { $first: '$product_id' } };
                    }
                    if (/^(variant)$/g.test(req.query.type)) {
                        return {
                            _id: { variant_id: '$variant_id', product_id: '$product_id' },
                            variant_id: { $first: '$variant_id' },
                            product_id: { $first: '$product_id' },
                        };
                    }
                    throw new Error('400: Missing query type!');
                })(),
                begin_quantity: { $sum: { $subtract: ['$import_quantity', '$export_quantity'] } },
                begin_price: {
                    $sum: {
                        $subtract: [
                            { $multiply: ['$import_price', '$import_quantity'] },
                            { $multiply: ['$export_price', '$export_quantity'] },
                        ],
                    },
                },
            },
        });
        inPeriodQuery.push({
            $group: {
                ...(() => {
                    if (/^(product)$/g.test(req.query.type)) {
                        return { _id: { product_id: '$product_id' }, product_id: { $first: '$product_id' } };
                    }
                    if (/^(variant)$/g.test(req.query.type)) {
                        return {
                            _id: { variant_id: '$variant_id', product_id: '$product_id' },
                            variant_id: { $first: '$variant_id' },
                            product_id: { $first: '$product_id' },
                        };
                    }
                    throw new Error('400: Missing query type!');
                })(),
                import_quantity: { $sum: '$import_quantity' },
                import_price: { $sum: { $multiply: ['$import_price', '$import_quantity'] } },
                export_quantity: { $sum: '$export_quantity' },
                export_price: { $sum: { $multiply: ['$export_price', '$export_quantity'] } },
            },
        });
        endPeriodQuery.push({
            $group: {
                ...(() => {
                    if (/^(product)$/g.test(req.query.type)) {
                        return { _id: { product_id: '$product_id' }, product_id: { $first: '$product_id' } };
                    }
                    if (/^(variant)$/g.test(req.query.type)) {
                        return {
                            _id: { variant_id: '$variant_id', product_id: '$product_id' },
                            variant_id: { $first: '$variant_id' },
                            product_id: { $first: '$product_id' },
                        };
                    }
                    throw new Error('400: Missing query type!');
                })(),
                end_quantity: { $sum: { $subtract: ['$import_quantity', '$export_quantity'] } },
                end_price: {
                    $sum: {
                        $subtract: [
                            { $multiply: ['$import_price', '$import_quantity'] },
                            { $multiply: ['$export_price', '$export_quantity'] },
                        ],
                    },
                },
            },
        });
        countQuery = [...endPeriodQuery];
        let page = Number(req.query.page || 1);
        let page_size = Number(req.query.page_size || 50);
        beginPeriodQuery.push({ $skip: (page - 1) * page_size }, { $limit: page_size });
        inPeriodQuery.push({ $skip: (page - 1) * page_size }, { $limit: page_size });
        endPeriodQuery.push({ $skip: (page - 1) * page_size }, { $limit: page_size });
        endPeriodQuery.push(
            {
                $lookup: {
                    from: 'Products',
                    let: { productId: '$_id.product_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$product_id', '$$productId'] } } },
                        {
                            $lookup: {
                                from: 'Categories',
                                let: { categoryId: '$category_id' },
                                pipeline: [{ $match: { $expr: { $in: ['$category_id', '$$categoryId'] } } }],
                                as: '_categories',
                            },
                        },
                    ],
                    as: 'product',
                },
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } }
        );
        if (/^(variant)$/g.test(req.query.type)) {
            endPeriodQuery.push(
                {
                    $lookup: {
                        from: 'Variants',
                        let: { variantId: '$_id.variant_id' },
                        pipeline: [{ $match: { $expr: { $eq: ['$variant_id', '$$variantId'] } } }],
                        as: 'variant',
                    },
                },
                { $unwind: { path: '$variant', preserveNullAndEmptyArrays: true } }
            );
        }
        let beginPeriods = await client
            .db(req.user.database)
            .collection('Inventories')
            .aggregate(beginPeriodQuery)
            .toArray();
        let inPeriods = await client.db(req.user.database).collection('Inventories').aggregate(inPeriodQuery).toArray();
        let endPeriods = await client
            .db(req.user.database)
            .collection('Inventories')
            .aggregate(endPeriodQuery)
            .toArray();
        let counts = await client
            .db(DB)
            .collection(`Inventories`)
            .aggregate([...countQuery, { $count: 'counts' }])
            .toArray();

        if (/^(product)$/g.test(req.query.type)) {
            let _beginPeriods = {};
            beginPeriods.map((eBegin) => {
                _beginPeriods[eBegin.product_id] = eBegin;
            });
            let _inPeriods = {};
            inPeriods.map((eIn) => {
                _inPeriods[eIn.product_id] = eIn;
            });
            let _endPeriods = {};
            endPeriods.map((eEnd) => {
                _endPeriods[eEnd.product_id] = eEnd;
            });
            let result = [];
            for (let i in _endPeriods) {
                result.push({
                    product_id: (_endPeriods[i] && _endPeriods[i].product_id) || 0,
                    begin_quantity: (_beginPeriods[i] && _beginPeriods[i].begin_quantity) || 0,
                    begin_price: (_beginPeriods[i] && _beginPeriods[i].begin_price) || 0,
                    import_quantity: (_inPeriods[i] && _inPeriods[i].import_quantity) || 0,
                    import_price: (_inPeriods[i] && _inPeriods[i].import_price) || 0,
                    export_quantity: (_inPeriods[i] && _inPeriods[i].export_quantity) || 0,
                    export_price: (_inPeriods[i] && _inPeriods[i].export_price) || 0,
                    end_quantity: (_endPeriods[i] && _endPeriods[i].end_quantity) || 0,
                    end_price: (_endPeriods[i] && _endPeriods[i].end_price) || 0,
                    product: (_endPeriods[i] && _endPeriods[i].product) || {},
                });
            }
            res.send({ success: true, count: counts[0] ? counts[0].counts : 0, data: result });
        }
        if (/^(variant)$/g.test(req.query.type)) {
            let _beginPeriods = {};
            beginPeriods.map((eBegin) => {
                _beginPeriods[eBegin.variant_id] = eBegin;
            });
            let _inPeriods = {};
            inPeriods.map((eIn) => {
                _inPeriods[eIn.variant_id] = eIn;
            });
            let _endPeriods = {};
            endPeriods.map((eEnd) => {
                _endPeriods[eEnd.variant_id] = eEnd;
            });
            let result = [];
            for (let i in _endPeriods) {
                result.push({
                    product_id: (_endPeriods[i] && _endPeriods[i].product_id) || 0,
                    variant_id: (_endPeriods[i] && _endPeriods[i].variant_id) || 0,
                    begin_quantity: (_beginPeriods[i] && _beginPeriods[i].begin_quantity) || 0,
                    begin_price: (_beginPeriods[i] && _beginPeriods[i].begin_price) || 0,
                    import_quantity: (_inPeriods[i] && _inPeriods[i].import_quantity) || 0,
                    import_price: (_inPeriods[i] && _inPeriods[i].import_price) || 0,
                    export_quantity: (_inPeriods[i] && _inPeriods[i].export_quantity) || 0,
                    export_price: (_inPeriods[i] && _inPeriods[i].export_price) || 0,
                    end_quantity: (_endPeriods[i] && _endPeriods[i].end_quantity) || 0,
                    end_price: (_endPeriods[i] && _endPeriods[i].end_price) || 0,
                    product: (_endPeriods[i] && _endPeriods[i].product) || {},
                    variant: (_endPeriods[i] && _endPeriods[i].variant) || {},
                });
            }
            res.send({ success: true, count: counts[0] ? counts[0].counts : 0, data: result });
        }
    } catch (err) {
        next(err);
    }
};

module.exports._getInventoryReport = async (req, res, next) => {
    try {
        let page = Number(req.query.page || 1);
        let page_size = Number(req.query.page_size || 50);
        let aggregateQuery = [];
        if (req.query.branch_id) {
            let ids = req.query.branch_id.split('---').map((id) => {
                return Number(id);
            });
            aggregateQuery.push({ $match: { branch_id: { $in: ids } } });
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
        if (req.query.category_id) {
            let ids = req.query.category_id.split('-').map((id) => {
                return Number(id);
            });
            let products = await client
                .db(req.user.database)
                .collection('Products')
                .find({ category_id: { $in: ids } })
                .limit(page_size)
                .toArray();
            let productIds = products.map((eProduct) => {
                return Number(eProduct.product_id);
            });
            aggregateQuery.push({ $match: { product_id: { $in: productIds } } });
        }
        aggregateQuery.push({ $sort: { create_date: 1 } });
        aggregateQuery.push({
            $group: {
                ...(() => {
                    if (/^(product)$/gi.test(req.query.type)) {
                        return {
                            _id: { branch_id: '$branch_id', product_id: '$product_id' },
                            product_id: { $first: '$product_id' },
                        };
                    }
                    if (/^(variant)$/gi.test(req.query.type)) {
                        return {
                            _id: { branch_id: '$branch_id', product_id: '$product_id', variant_id: '$variant_id' },
                            product_id: { $first: '$product_id' },
                            variant_id: { $first: '$variant_id' },
                        };
                    }
                    throw new Error(`400: Missing field type`);
                })(),
                branch_id: { $first: '$branch_id' },
                quantity: { $sum: '$quantity' },
                price: { $sum: { $multiply: ['$quantity', '$import_price'] } },
            },
        });
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Branchs',
                    let: { branchId: '$branch_id' },
                    pipeline: [{ $match: { $expr: { $eq: ['$branch_id', '$$branchId'] } } }],
                    as: 'branch',
                },
            },
            { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } }
        );
        aggregateQuery.push({
            $group: {
                ...(() => {
                    if (/^(product)$/gi.test(req.query.type)) {
                        return { _id: { product_id: '$product_id' }, product_id: { $first: '$product_id' } };
                    }
                    if (/^(variant)$/gi.test(req.query.type)) {
                        return {
                            _id: { product_id: '$product_id', variant_id: '$variant_id' },
                            product_id: { $first: '$product_id' },
                            variant_id: { $first: '$variant_id' },
                        };
                    }
                })(),
                warehouse: {
                    $push: {
                        branch_id: '$branch_id',
                        branch: '$branch',
                        quantity: '$quantity',
                        price: '$price',
                    },
                },
            },
        });
        let countQuery = [...aggregateQuery];
        aggregateQuery.push({ $skip: (page - 1) * page_size }, { $limit: page_size });
        aggregateQuery.push({ $addFields: { note: '' } });
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Products',
                    let: { productId: '$product_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$product_id', '$$productId'] } } },
                        {
                            $lookup: {
                                from: 'Categories',
                                let: { categoryId: '$category_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $in: ['$category_id', '$$categoryId'] },
                                        },
                                    },
                                ],
                                as: '_categories',
                            },
                        },
                        {
                            $lookup: {
                                from: 'Suppliers',
                                let: { supplierId: '$supplier_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ['$supplier_id', '$$supplierId'] },
                                        },
                                    },
                                ],
                                as: '_suppliers',
                            },
                        },
                        {
                            $unwind: {
                                path: '$_suppliers',
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                    ],
                    as: 'product',
                },
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } }
        );
        if (/^(variant)$/gi.test(req.query.type)) {
            aggregateQuery.push(
                {
                    $lookup: {
                        from: 'Variants',
                        let: { variantId: '$variant_id' },
                        pipeline: [{ $match: { $expr: { $eq: ['$variant_id', '$$variantId'] } } }],
                        as: 'variant',
                    },
                },
                { $unwind: { path: '$variant', preserveNullAndEmptyArrays: true } }
            );
        }
        // lấy data từ database
        let [result, counts] = await Promise.all([
            client.db(req.user.database).collection(`Locations`).aggregate(aggregateQuery).toArray(),
            client
                .db(req.user.database)
                .collection(`Locations`)
                .aggregate([...countQuery, { $count: 'counts' }])
                .toArray(),
        ]);
        res.send({
            success: true,
            count: counts[0] ? counts[0].counts : 0,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

module.exports._getOrderReport = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        req.query = createTimeline(req.query);
        if (!req.query.from_date || !req.query.to_date) {
            throw new Error('400: Thiếu mốc thời gian cần báo cáo!');
        }
        if (req.query.from_date) {
            aggregateQuery.push({ $match: { create_date: { $gte: req.query.from_date } } });
        }
        if (req.query.to_date) {
            aggregateQuery.push({ $match: { create_date: { $lte: req.query.to_date } } });
        }
        if (/product/.test(req.query.type)) {
            aggregateQuery.push();
        }
        let orders = await client.db(req.user.database).collection('Orders').aggregate(aggregateQuery).toArray();
        let _products = {};
        let productIds = [];
        orders.map((order) => {
            order.order_details.map((detail) => {
                productIds.push(detail.product_id);
                if (!_products[`${detail.product_id}`]) {
                    _products[`${detail.product_id}`] = {
                        product_id: detail.product_id,
                        product: {},
                        sale_quantity: 0,
                        total_revenue: 0,
                        base_price: 0,
                        gross_profit: 0,
                        profit_rate: 0,
                    };
                }
                if (_products[`${detail.product_id}`]) {
                    _products[`${detail.product_id}`].sale_quantity += detail.quantity;
                    _products[`${detail.product_id}`].total_revenue += detail.quantity * detail.price;
                    _products[`${detail.product_id}`].base_price += detail.total_base_price;
                    _products[`${detail.product_id}`].gross_profit +=
                        detail.quantity * detail.price - detail.total_base_price;
                }
            });
        });
        productIds = [...new Set(productIds)];
        let productInDBs = await client
            .db(req.user.database)
            .collection('Products')
            .find({ product_id: { $in: productIds } })
            .toArray();
        let _productInDBs = {};
        productInDBs.map((eProduct) => {
            _productInDBs[`${eProduct.product_id}`] = eProduct;
        });
        for (let i in _products) {
            _products[i].product = { ..._products[i].product, ..._productInDBs[i] };
            _products[i].profit_rate = Number(
                ((_products[i].total_revenue / _products[i].base_price) * 100).toFixed(2)
            );
        }
        _products = Object.values(_products);
        let counts = _products.length;

        let page = Number(req.query.page) || 1;
        let page_size = Number(req.query.page_size) || 50;
        _products = _products.slice((page - 1) * page_size, (page - 1) * page_size + page_size);

        res.send({ success: true, count: counts, data: _products });
    } catch (err) {
        next(err);
    }
};

module.exports._getFinanceReport = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        if (req.query.receipt_id) {
            aggregateQuery.push({
                $match: { receipt_id: Number(req.query.receipt_id) },
            });
        }
        if (req.query.creator_id) {
            aggregateQuery.push({
                $match: { creator_id: Number(req.query.creator_id) },
            });
        }
        req.query = createTimeline(req.query);
        if (req.query.from_date) {
            aggregateQuery.push({ $match: { create_date: { $gte: req.query.from_date } } });
        }
        if (req.query.to_date) {
            aggregateQuery.push({ $match: { create_date: { $lte: req.query.to_date } } });
        }
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Users',
                    localField: 'payer',
                    foreignField: 'user_id',
                    as: 'payer_info',
                },
            },
            { $unwind: { path: '$payer_info', preserveNullAndEmptyArrays: true } }
        );
        aggregateQuery.push(
            {
                $lookup: {
                    from: 'Users',
                    localField: 'receiver',
                    foreignField: 'user_id',
                    as: 'receiver_info',
                },
            },
            { $unwind: { path: '$receiver_info', preserveNullAndEmptyArrays: true } }
        );
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
        aggregateQuery.push({ $sort: { create_date: 1 } });
        let page = Number(req.query.page) || 1;
        let page_size = Number(req.query.page_size) || 50;
        aggregateQuery.push({ $skip: (page - 1) * page_size }, { $limit: page_size });
        let [result, counts, total] = await Promise.all([
            client.db(req.user.database).collection(`Finances`).aggregate(aggregateQuery).toArray(),
            client
                .db(req.user.database)
                .collection(`Finances`)
                .aggregate([...countQuery, { $count: 'counts' }])
                .toArray(),
            client
                .db(req.user.database)
                .collection(`Finances`)
                .aggregate([...countQuery, { $group: { _id: { type: '$type' }, total: { $sum: '$value' } } }])
                .toArray(),
        ]);
        let [totalRevenue, totalExpenditure] = total;
        res.send({
            success: true,
            count: counts[0] ? counts[0].counts : 0,
            total_revenue: totalRevenue ? totalRevenue.total : 0,
            total_expenditure: totalExpenditure ? totalExpenditure.total : 0,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

module.exports._createFinanceReport = async (req, res, next) => {
    try {
        [].map((e) => {
            if (req.body[e] == undefined) {
                throw new Error(`400: Thiếu thuộc tính ${e}!`);
            }
        });
        let receiptMaxId = await client.db(req.user.database).collection('AppSetting').findOne({ name: 'Finances' });
        let receipt_id = (() => {
            if (receiptMaxId && receiptMaxId.value) {
                return receiptMaxId.value;
            }
            return 0;
        })();
        receipt_id++;
        let _finance = {
            receipt_id: receipt_id,
            code: String(receipt_id).padStart(6, '0'),
            source: req.body.source || 'AUTO',
            //REVENUE - EXPENDITURE
            type: req.body.type || 'REVENUE',
            payments: req.body.payments || [],
            value: req.body.value || 0,
            payer_id: req.body.payer || req.user.user_id,
            receiver_id: req.body.receiver || req.user.user_id,
            status: req.body.status || 'DRAFT',
            note: req.body.note || '',
            create_date: moment().tz(TIMEZONE).format(),
            creator_id: req.user.user_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
        };
        await client
            .db(req.user.database)
            .collection('AppSetting')
            .updateOne({ name: 'Finances' }, { $set: { name: 'Finances', value: receipt_id } }, { $upsert: true });
        let insert = await client.db(req.user.database).collection('Finances').insertOne(_finance);
        if (!insert.insertedId) {
            throw new Error(`500: Tạo phiếu thu chi thất bại!`);
        }
        res.send({ success: true, data: req.body });
    } catch (err) {
        next(err);
    }
};

module.exports._updateFinanceReport = async (req, res, next) => {
    try {
        req.params.receipt_id = Number(req.params.receipt_id);
        let finance = await client.db(req.user.database).collection('Finances').findOne(req.params);
        if (!finance) {
            throw new Error(`400: Phiếu thu/chi không tồn tại!`);
        }
        delete req.body._id;
        delete req.body.receipt_id;
        delete req.body.create_date;
        delete req.body.creator_id;
        let _finance = { ...finance, ...req.body };
        _finance = {
            receipt_id: _finance.receipt_id,
            //REVENUE - EXPENDITURE
            type: _finance.type || 'REVENUE',
            payments: _finance.payments || [],
            status: _finance.status || 'DRAFT',
            value: _finance.value || 0,
            payer: _finance.payer || req.user.user_id,
            receiver: _finance.receiver || req.user.user_id,
            note: _finance.note || '',
            create_date: _finance.create_date,
            creator_id: _finance.creator_id,
            last_update: moment().tz(TIMEZONE).format(),
            updater_id: req.user.user_id,
        };
    } catch (err) {
        next(err);
    }
};
