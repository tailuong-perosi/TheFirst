const moment = require(`moment-timezone`);
const { ObjectId } = require('mongodb');
const crypto = require(`crypto`);
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;

const compareServices = require(`../services/compare`);
const { Compare, Session } = require('../models/compare');

let getSessionC = async (req, res, next) => {
    try {
        await compareServices.getSessionS(req, res, next);
    } catch (err) {
        next(err);
    }
};

let getCompareC = async (req, res, next) => {
    try {
        await compareServices.getCompareS(req, res, next);
    } catch (err) {
        next(err);
    }
};

let addCompareC = async (req, res, next) => {
    try {
        let _session = new Session();
        let [counts, session_counts, business, orders, customers] = await Promise.all([
            client.db(DB).collection(`Compares`).countDocuments(),
            client.db(DB).collection(`CompareSessions`).countDocuments(),
            client.db(DB).collection(`Users`).findOne({ user_id: token.business_id }),
            client.db(DB).collection(`Orders`).find({ business_id: token.business_id }).toArray(),
            client.db(DB).collection(`Customers`).find({ business_id: token.business_id }).toArray(),
        ]);
        let _orders = {};
        orders.map((order) => {
            _orders[order.order_id] = order;
        });
        let _customers = {};
        customers.map((customer) => {
            _customers[customer.customer_id] = customer;
        });
        req.body = {
            ...req.body,
            ...{
                session_id: String(session_counts + 1),
                business_id: business.user_id,
                code: String(1000000 + session_counts + 1),
                create_date: moment.tz(`Asia/Ho_Chi_Minh`).format(),
                creator_id: token.user_id,
                active: true,
            },
        };
        _session.create(req.body);
        req[`_session`] = _session;
        req[`_compares`] = [];
        for (let i in req.body.compares) {
            let _compare = new Compare();
            let compareData = {
                ...req.body.compares[i],
                ...{
                    session_id: _session.session_id,
                    compare_id: String(counts + 1 + Number(i)),
                    code: String(1000000 + counts + 1 + Number(i)),
                },
            };
            _compare.create(compareData);
            req[`_compares`].push(_compare);
        }
        await compareServices.addCompareS(req, res, next);
    } catch (err) {
        next(err);
    }
};

let updateCompareC = async (req, res, next) => {
    try {
        await compareServices.updateCompareS(req, res, next);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getSessionC,
    getCompareC,
    addCompareC,
    updateCompareC,
};
