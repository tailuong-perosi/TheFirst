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
module.exports._getOne = async(req,res,next) =>{
    try {
        await ShoppingDairyService._getOne(req,res,next);
    } catch (err) {
        next(err);
    }
}

