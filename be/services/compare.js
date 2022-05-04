const moment = require(`moment-timezone`);
const client = require(`../config/mongodb`);
const DB = process.env.DATABASE;
const { createTimeline } = require('../utils/date-handle');
const { removeUnicode } = require('../utils/string-handle');

let getSessionS = async (req, res, next) => {
    try {
        let token = req.tokenData.data;
        let mongoQuery = {};
        let filterQuery = {};
        // lấy các thuộc tính tìm kiếm cần độ chính xác cao ('1' == '1', '1' != '12',...)
        mongoQuery['delete'] = false;
        if (req.query.session_id) mongoQuery = { ...mongoQuery, session_id: req.query.session_id };
        if (token) mongoQuery = { ...mongoQuery, business_id: token.business_id };
        if (req.query.business_id) mongoQuery = { ...mongoQuery, business_id: req.query.business_id };
        if (req.query.creator) mongoQuery = { ...mongoQuery, creator: req.query.creator };
        req.query = createTimeline(req.query);
        if (req.query.from_date) {
            mongoQuery[`create_date`] = {
                ...mongoQuery[`create_date`],
                $gte: req.query.from_date,
            };
        }
        if (req.query.to_date) {
            mongoQuery[`create_date`] = {
                ...mongoQuery[`create_date`],
                $lte: req.query.to_date,
            };
        }
        // lấy các thuộc tính tìm kiếm với độ chính xác tương đối ('1' == '1', '1' == '12',...)
        if (req.query.code) filterQuery = { ...filterQuery, code: req.query.code };
        if (req.query._bussiness) filterQuery = { ...filterQuery, _bussiness: req.query._bussiness };
        if (req.query._creator) filterQuery = { ...filterQuery, _creator: req.query._creator };
        // lấy các thuộc tính tùy chọn khác
        let [page, page_size] = [req.query.page || 1, req.query.page_size || 50];
        // lấy data từ database
        let _sessions = await client.db(DB).collection(`CompareSessions`).find(mongoQuery).toArray();
        // đảo ngược data sau đó gắn data liên quan vào khóa định danh
        _sessions.reverse();
        let [__users] = await Promise.all([
            client.db(DB).collection(`Users`).find({ business_id: mongoQuery.business_id }).toArray(),
        ]);
        let _bussiness = {};
        let _creator = {};
        __users.map((item) => {
            delete item.password;
            _bussiness[item.user_id] = item;
            _creator[item.user_id] = item;
        });
        _sessions.map((item) => {
            let _session = item;
            _session.bussiness = { ..._bussiness[_session.bussiness] };
            _session.creator = { ..._creator[_session.creator] };
            // Tạo properties đặc trưng của khóa định danh để lọc với độ chính xác tương đối
            _session[`_bussiness`] = ``;
            if (_session.bussiness) {
                _session[`_bussiness`] = `${_session.bussiness.first_name || ``} ${
                    _session.bussiness.last_name || ``
                }`;
            }
            _session[`_creator`] = ``;
            if (_session.creator) {
                _session[`_creator`] = `${_session.creator.first_name || ``} ${
                    _session.creator.last_name || ``
                }`;
            }
            return _session;
        });
        // lọc theo keyword
        if (req.query.keyword) {
            _sessions = _sessions.filter((_session) => {
                let check = false;
                [`code`, `name`, `phone`].map((key) => {
                    {
                        let value = new String(_session[key])
                            .normalize(`NFD`)
                            .replace(/[\u0300-\u036f]|\s/g, ``)
                            .replace(/đ/g, 'd')
                            .replace(/Đ/g, 'D')
                            .toLocaleLowerCase();
                        let compare = new String(req.query.keyword)
                            .normalize(`NFD`)
                            .replace(/[\u0300-\u036f]|\s/g, ``)
                            .replace(/đ/g, 'd')
                            .replace(/Đ/g, 'D')
                            .toLocaleLowerCase();
                        if (value.includes(compare)) {
                            check = true;
                        }
                    }
                });
                return check;
            });
        }
        // lọc theo query
        if (filterQuery) {
            filterQuery = Object.entries(filterQuery);
            filterQuery.forEach(([filterKey, filterValue]) => {
                _sessions = _sessions.filter((_session) => {
                    let value = new String(_session[filterKey])
                        .normalize(`NFD`)
                        .replace(/[\u0300-\u036f]|\s/g, ``)
                        .replace(/đ/g, 'd')
                        .replace(/Đ/g, 'D')
                        .toLocaleLowerCase();
                    let compare = new String(filterValue)
                        .normalize(`NFD`)
                        .replace(/[\u0300-\u036f]|\s/g, ``)
                        .replace(/đ/g, 'd')
                        .replace(/Đ/g, 'D')
                        .toLocaleLowerCase();
                    return value.includes(compare);
                });
            });
        }
        // đếm số phần tử
        let _counts = _sessions.length;
        // phân trang
        if (page && page_size)
            _sessions = _sessions.slice(
                Number((page - 1) * page_size),
                Number((page - 1) * page_size) + Number(page_size)
            );
        res.send({
            success: true,
            data: _sessions,
            count: _counts,
        });
    } catch (err) {
        next(err);
    }
};

let getCompareS = async (req, res, next) => {
    try {
        let token = req.tokenData.data;
        let mongoQuery = {};
        let filterQuery = {};
        // lấy các thuộc tính tìm kiếm cần độ chính xác cao ('1' == '1', '1' != '12',...)
        if (req.query.compare_id) mongoQuery = { ...mongoQuery, compare_id: req.query.compare_id };
        if (token) mongoQuery = { ...mongoQuery, business_id: token.business_id };
        if (req.query.business_id) mongoQuery = { ...mongoQuery, business_id: req.query.business_id };
        if (req.query.session) mongoQuery = { ...mongoQuery, session: req.query.session };
        if (req.query.creator) mongoQuery = { ...mongoQuery, creator: req.query.creator };
        if (req.query.from_date)
            mongoQuery[`create_date`] = {
                ...mongoQuery[`create_date`],
                $gte: req.query.from_date,
            };
        if (req.query.to_date)
            mongoQuery[`create_date`] = {
                ...mongoQuery[`create_date`],
                $lte: moment(req.query.to_date).add(1, `days`).format(),
            };
        // lấy các thuộc tính tìm kiếm với độ chính xác tương đối ('1' == '1', '1' == '12',...)
        if (req.query.code) filterQuery = { ...filterQuery, code: req.query.code };
        if (req.query._bussiness) filterQuery = { ...filterQuery, _bussiness: req.query._bussiness };
        if (req.query._creator) filterQuery = { ...filterQuery, _creator: req.query._creator };
        // lấy các thuộc tính tùy chọn khác
        let [page, page_size] = [req.query.page || 1, req.query.page_size || 50];
        // lấy data từ database
        let _compares = await client.db(DB).collection(`Compares`).find(mongoQuery).toArray();
        // đảo ngược data sau đó gắn data liên quan vào khóa định danh
        _compares.reverse();
        let [__users] = await Promise.all([client.db(DB).collection(`Users`).find({}).toArray()]);
        let _bussiness = {};
        let _creator = {};
        __users.map((item) => {
            delete item.password;
            _bussiness[item.user_id] = item;
            _creator[item.user_id] = item;
        });
        _compares.map((item) => {
            let _compare = item;
            _compare.bussiness = { ..._bussiness[_compare.bussiness] };
            _compare.creator = { ..._creator[_compare.creator] };
            // Tạo properties đặc trưng của khóa định danh để lọc với độ chính xác tương đối
            _compare[`_bussiness`] = ``;
            if (_compare.bussiness) {
                _compare[`_bussiness`] = `${_compare.bussiness.first_name || ``} ${
                    _compare.bussiness.last_name || ``
                }`;
            }
            _compare[`_creator`] = ``;
            if (_compare.creator) {
                _compare[`_creator`] = `${_compare.creator.first_name || ``} ${
                    _compare.creator.last_name || ``
                }`;
            }
            return _compare;
        });
        // lọc theo keyword
        if (req.query.keyword) {
            _compares = _compares.filter((_compare) => {
                let check = false;
                [`code`, `name`, `phone`].map((key) => {
                    {
                        let value = new String(_compare[key])
                            .normalize(`NFD`)
                            .replace(/[\u0300-\u036f]|\s/g, ``)
                            .replace(/đ/g, 'd')
                            .replace(/Đ/g, 'D')
                            .toLocaleLowerCase();
                        let compare = new String(req.query.keyword)
                            .normalize(`NFD`)
                            .replace(/[\u0300-\u036f]|\s/g, ``)
                            .replace(/đ/g, 'd')
                            .replace(/Đ/g, 'D')
                            .toLocaleLowerCase();
                        if (value.includes(compare)) {
                            check = true;
                        }
                    }
                });
                return check;
            });
        }
        // lọc theo query
        if (filterQuery) {
            filterQuery = Object.entries(filterQuery);
            filterQuery.forEach(([filterKey, filterValue]) => {
                _compares = _compares.filter((_compare) => {
                    let value = new String(_compare[filterKey])
                        .normalize(`NFD`)
                        .replace(/[\u0300-\u036f]|\s/g, ``)
                        .replace(/đ/g, 'd')
                        .replace(/Đ/g, 'D')
                        .toLocaleLowerCase();
                    let compare = new String(filterValue)
                        .normalize(`NFD`)
                        .replace(/[\u0300-\u036f]|\s/g, ``)
                        .replace(/đ/g, 'd')
                        .replace(/Đ/g, 'D')
                        .toLocaleLowerCase();
                    return value.includes(compare);
                });
            });
        }
        // đếm số phần tử
        let _counts = _compares.length;
        // phân trang
        if (page && page_size)
            _compares = _compares.slice(
                Number((page - 1) * page_size),
                Number((page - 1) * page_size) + Number(page_size)
            );
        res.send({
            success: true,
            data: _compares,
            count: _counts,
        });
    } catch (err) {
        next(err);
    }
};

let addCompareS = async (req, res, next) => {
    try {
        let token = req.tokenData.data;
        let _session = await client.db(DB).collection(`CompareSessions`).insertOne(req._session);
        if (!_session.insertedId) throw new Error(`500: Create session fail!`);
        let _compares = await client.db(DB).collection(`Compares`).insertMany(req._compares);
        if (!_compares.insertedIds) throw new Error(`500: Create compare fail!`);
        if (token)
            await client.db(DB).collection(`Actions`).insertOne({
                business_id: token.business_id,
                type: `Add`,
                properties: `Compare`,
                name: `Thêm đối soát vận chuyển mới`,
                data: _compares.ops[0],
                performer: token.user_id,
                date: moment().format(),
            });
        res.send({
            success: true,
            data: { session: _session.ops[0], compares: _compares.ops },
        });
    } catch (err) {
        next(err);
    }
};

let updateCompareS = async (req, res, next) => {
    try {
        let token = req.tokenData.data;
        await client.db(DB).collection(`Compares`).findOneAndUpdate(req.params, { $set: req.body });
        if (req.body.status == `COMPLETE`) {
        }
        if (token)
            await client.db(DB).collection(`Actions`).insertOne({
                bussiness: token.bussiness.user_id,
                type: `Update`,
                properties: `Compare`,
                name: `Cập nhật thông tin đối soát`,
                data: req.body,
                performer: token.user_id,
                date: moment().format(),
            });
        res.send({ success: true, data: req.body });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getSessionS,
    getCompareS,
    addCompareS,
    updateCompareS,
};
