require('dotenv').config();
const { stringHandle } = require('../utils/string-handle');
const { hardValidate } = require('../utils/validate');
const moment = require('moment-timezone');
const TIMEZONE = process.env.TIMEZONE;

class Promotion {
    constructor(data, performer) {
        try {
            this.promotion_id = Number(data.promotion_id);
            this.code = String(this.promotion_id).padStart(6, '0');
            this.name = String(data.name);
            this.promotion_code = stringHandle(this.name + '-' + this.promotion_id, { removeUnicode: true, getFirstLetter: true });
            if (data.promotion_code) {
                this.promotion_code = String(data.promotion_code);
            }
            this.type = String(data.type || 'PERCENT');
            this.value = Number(data.value || 0);
            this.max_discount_value = Number(data.max_discount_value || 0);
            this.gift_product_ids = [];
            this.order_value_require = Number(data.order_value_require || 0);
            this.limit_quantity = Number(data.limit_quantity || 0);
            this.voucher_quantity = Number(this.limit_quantity || 1);
            this.is_apply_all_branch = data.apply_all_branch || false;
            this.apply_branch_ids = [];
            if (this.is_apply_all_branch == false) {
                if (Array.isArray(data.apply_branch_ids)) {
                    for (let i in data.apply_branch_ids) {
                        if (typeof data.apply_branch_ids[i] == 'number' && !isNaN(data.apply_branch_ids[i])) {
                            this.apply_branch_ids.push(data.apply_branch_ids[i]);
                        }
                    }
                } else {
                    if (typeof data.apply_branch_ids == 'number' && !isNaN(data.apply_branch_ids)) {
                        this.apply_branch_ids.push(data.apply_branch_ids);
                    }
                }
            }
            this.is_apply_all_customer_type = data.apply_all_customer_type || false;
            this.apply_customer_type_ids = [];
            if (this.is_apply_all_customer_type == false) {
                if (Array.isArray(data.apply_customer_type_ids)) {
                    for (let i in data.apply_customer_type_ids) {
                        if (typeof data.apply_customer_type_ids[i] == 'number' && !isNaN(data.apply_customer_type_ids[i])) {
                            this.apply_customer_type_ids.push(data.apply_customer_type_ids[i]);
                        }
                    }
                } else {
                    if (typeof data.apply_customer_type_ids == 'number' && !isNaN(data.apply_customer_type_ids)) {
                        this.apply_customer_type_ids.push(data.apply_customer_type_ids);
                    }
                }
            }
            this.is_apply_all_customer = data.apply_all_customer || false;
            this.apply_customer_ids = [];
            if (this.is_apply_all_customer == false) {
                if (Array.isArray(data.apply_customer_ids)) {
                    for (let i in data.apply_customer_ids) {
                        if (typeof data.apply_customer_ids[i] == 'number' && !isNaN(data.apply_customer_ids[i])) {
                            this.apply_customer_ids.push(data.apply_customer_ids[i]);
                        }
                    }
                } else {
                    if (typeof data.apply_customer_ids == 'number' && !isNaN(data.apply_customer_ids)) {
                        this.apply_customer_ids.push(data.apply_customer_ids);
                    }
                }
            }
            this.is_apply_all_product = data.apply_all_product || false;
            this.apply_product_ids = [];
            if (this.is_apply_all_product == false) {
                if (Array.isArray(data.apply_product_ids)) {
                    for (let i in data.apply_product_ids) {
                        if (typeof data.apply_product_ids[i] == 'number' && !isNaN(data.apply_product_ids[i])) {
                            this.apply_product_ids.push(data.apply_product_ids[i]);
                        }
                    }
                } else {
                    if (typeof data.apply_product_ids == 'number' && !isNaN(data.apply_product_ids)) {
                        this.apply_product_ids.push(data.apply_product_ids);
                    }
                }
            }
            this.start_date = '';
            if (data.start_date && /\d{4}-\d{2}-\d{2}/.test(data.start_date)) {
                this.start_date = moment(data.start_date).tz(TIMEZONE).format('YYYY-MM-DD');
            }
            this.end_date = '';
            if (data.end_date && /\d{4}-\d{2}-\d{2}/.test(data.end_date)) {
                this.end_date = moment(data.end_date).tz(TIMEZONE).format('YYYY-MM-DD');
            }
            this.description = String(data.description) || '';
            this.create_date = String(data.create_date || moment().tz(TIMEZONE).format());
            this.creator_id = data.creator_id || (performer && performer.user_id) || undefined;
            this.last_update = String(data.last_update);
            this.updater_id = Number(data.updater_id);
            this.is_active = data.is_active || false;
            this.slug_name = stringHandle(this.name, { createSlug: true });
        } catch (err) {
            throw err;
        }
    }
}

Promotion.prototype.dataForm = function () {
    return {
        promotion_id: { types: ['number'], require: true },
        code: { types: ['string'], require: true },
        name: { types: ['string'], require: true },
        promotion_code: { types: ['string'], require: true },
        type: { types: ['string'], require: true, enums: ['PERCENT', 'VALUE', 'PRODUCT'] },
        value: { types: ['number'], require: true },
        max_discount_value: { types: ['number'], require: true },
        order_value_require: { types: ['number'], require: true },
        has_voucher: { types: ['number'], require: true },
        voucher_quantity: { types: ['number'], require: true },
        is_apply_all_branch: { types: ['number'], require: true },
        branch_apply_ids: { types: ['array'], require: true },
        is_apply_all_customer: { types: ['number'], require: true },
        customer_apply_ids: { types: ['array'], require: true },
        start_date: { types: ['date-time'], require: true },
        end_date: { types: ['date-time'], require: true },
        description: { types: ['number'], require: true },
        create_date: { types: ['date-time'], require: true },
        creator_id: { types: ['number'], require: true },
        last_update: { types: ['date-time'], require: true },
        updater_id: { types: ['number'], require: true },
        is_active: { types: ['boolean'], require: true },
    };
};

Promotion.prototype.update = function (data, performer) {
    try {
        delete data._id;
        delete data.promotion_id;
        delete data.code;
        delete data.create_date;
        delete data.creator_id;
        return new Promotion({ ...this, ...data }, performer);
    } catch (err) {
        throw err;
    }
};

class Voucher {
    /**
     *
     * @param {Voucher} data
     * @returns
     */
    constructor(data, performer) {
        try {
            this.voucher_id = Number(data.voucher_id);
            this.code = String(this.voucher_id).padStart(6, '0');
            this.voucher = String(data.voucher);
            this.promotion_id = Number(data.promotion_id);
            this.promotion_value = Number(data.promotion_value || 0);
            this.is_used = data.is_used || false;
            this.use_date = String(data.use_date || '');
            this.accepter_id = Number(data.accepter_id || 0);
            this.create_date = String(data.create_date || '');
            this.creator_id = Number(data.creator_id || 0);
            this.last_update = String(data.last_update || '');
            this.updater_id = Number(data.updater_id || 0);
        } catch (err) {
            throw err;
        }
    }
}

Voucher.prototype.dataForm = function (data, performer) {
    return {};
};

Voucher.prototype.update = function (data, performer) {
    try {
        delete data._id;
        return new Voucher({ ...this, ...data }, performer);
    } catch (err) {
        throw err;
    }
};

module.exports = { Promotion, Voucher };
