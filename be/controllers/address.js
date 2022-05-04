const moment = require(`moment-timezone`);
const TIMEZONE = process.env.TIMEZONE;
const client = require(`../config/mongodb`);
const { stringHandle } = require('../utils/string-handle');
const SDB = process.env.DATABASE;

module.exports._getWard = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        if (req.query.ward_code) {
            aggregateQuery.push({ $match: { ward_code: String(req.query.ward_code) } });
        }
        if (req.query.district_id) {
            aggregateQuery.push({ $match: { district_id: Number(req.query.district_id) } });
        }
        if (req.query.province_id) {
            aggregateQuery.push({ $match: { province_id: Number(req.query.province_id) } });
        }
        if (req.query.ward_name) {
            aggregateQuery.push({
                $match: {
                    slug_ward_name: new RegExp(stringHandle(req.query.ward_name, { createRegexQuery: true }), 'gi'),
                },
            });
        }
        if (req.query.district_name) {
            aggregateQuery.push({
                $match: {
                    slug_district_name: new RegExp(
                        stringHandle(req.query.district_name, { createRegexQuery: true }),
                        'gi'
                    ),
                },
            });
        }
        if (req.query.province_name) {
            aggregateQuery.push({
                $match: {
                    slug_province_name: new RegExp(
                        stringHandle(req.query.province_name, { createRegexQuery: true }),
                        'gi'
                    ),
                },
            });
        }
        aggregateQuery.push({
            $project: {
                slug_ward_name: 0,
                slug_district_name: 0,
                slug_province_name: 0,
            },
        });
        let wards = await client.db(SDB).collection(`Wards`).aggregate(aggregateQuery).toArray();
        res.send({ success: true, data: wards });
    } catch (err) {
        next(err);
    }
};

module.exports._getDistrict = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        if (req.query.district_id) {
            aggregateQuery.push({ $match: { district_id: Number(req.query.district_id) } });
        }
        if (req.query.province_id) {
            aggregateQuery.push({ $match: { province_id: Number(req.query.province_id) } });
        }
        if (req.query.district_name) {
            aggregateQuery.push({
                $match: {
                    slug_district_name: new RegExp(
                        stringHandle(req.query.district_name, { createRegexQuery: true }),
                        'gi'
                    ),
                },
            });
        }
        if (req.query.province_name) {
            aggregateQuery.push({
                $match: {
                    slug_province_name: new RegExp(
                        stringHandle(req.query.province_name, { createRegexQuery: true }),
                        'gi'
                    ),
                },
            });
        }
        aggregateQuery.push({
            $project: {
                slug_district_name: 0,
                slug_province_name: 0,
            },
        });
        let districts = await client.db(SDB).collection(`Districts`).aggregate(aggregateQuery).toArray();
        res.send({ success: true, data: districts });
    } catch (err) {
        next(err);
    }
};

module.exports._getProvince = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        if (req.query.province_id) {
            aggregateQuery.push({ $match: { province_id: Number(req.query.province_id) } });
        }
        if (req.query.province_name) {
            aggregateQuery.push({
                $match: {
                    slug_province_name: new RegExp(
                        stringHandle(req.query.province_name, { createRegexQuery: true }),
                        'gi'
                    ),
                },
            });
        }
        aggregateQuery.push({
            $project: {
                slug_province_name: 0,
            },
        });
        let provinces = await client.db(SDB).collection(`Provinces`).aggregate(aggregateQuery).toArray();
        res.send({ success: true, data: provinces });
    } catch (err) {
        next(err);
    }
};

module.exports._getCountry = async (req, res, next) => {
    try {
        let aggregateQuery = [];
        if (req.query.code) {
            aggregateQuery.push({ $match: { code: String(req.query.code) } });
        }
        if (req.query.name) {
            aggregateQuery.push({
                $match: { slug_name: new RegExp(stringHandle(req.query.name, { createRegexQuery: true }), 'gi') },
            });
        }
        aggregateQuery.push({
            $project: {
                slug_name: 0,
            },
        });
        let countries = await client.db(SDB).collection(`Countries`).aggregate(aggregateQuery).toArray();
        res.send({ success: true, data: countries });
    } catch (err) {
        next(err);
    }
};
