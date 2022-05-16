const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const DB = process.env.DATABASE;
const client = require(`../config/mongodb`);

const workServce = require('../services/Works')


module.exports._get = async (req, res, next) => {
    try {
        await workServce._get(req, res, next);
    } catch (err) {
        next(err);
    }
};