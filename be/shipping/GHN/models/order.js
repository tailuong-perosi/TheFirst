const { hardValidate } = require('../../../utils/validate');

class OrderDetail {
    /**
     *
     * @param {OrderDetail} data
     */
    constructor(data) {
        this.name = data.name;
        this.code = data.code;
        this.quantity = data.quantity;
        this.price = data.price;
        this.length = data.length;
        this.width = data.width;
        this.height = data.height;
        this.category = {
            level1: 'Product',
        };
        hardValidate(this, this.dataForm());
    }
}
OrderDetail.prototype.dataForm = function () {
    return {
        name: { types: ['string'], require: true },
        code: { types: ['string'], require: true },
        quantity: { types: ['number'], require: true },
        price: { types: ['number'], require: true },
        length: { types: ['number'], require: true },
        width: { types: ['number'], require: true },
        height: { types: ['number'], require: true },
        category: { types: ['object'], require: true },
    };
};

class CreateOrderData {
    /**
     *
     * @param {CreateOrderData} data
     * @returns
     */
    constructor(data) {
        this.payment_type_id = data.payment_type_id || 2;
        this.note = data.note || '';
        this.required_note = data.required_note || 'KHONGCHOXEMHANG';
        this.return_phone = data.return_phone;
        this.return_address = data.return_address;
        this.return_ward_code = data.return_ward_code;
        this.return_district_id = data.return_district_id;
        this.client_order_code = data.client_order_code;
        this.to_name = data.to_name;
        this.to_phone = data.to_phone;
        this.to_address = data.to_address;
        this.to_ward_code = data.to_ward_code;
        this.to_district_id = data.to_district_id;
        this.cod_amount = data.cod_amount || 0;
        this.content = data.content || '';
        this.length = data.length || 10;
        this.width = data.width || 10;
        this.height = data.height || 10;
        this.weight = data.weight || 10;
        this.pick_station_id = data.pick_station_id || null;
        this.deliver_station_id = data.deliver_station_id || null;
        this.insurance_value = data.insurance_value || 0;
        this.service_id = data.this.service_id || 0;
        this.service_type_id = data.service_type_id || 2;
        this.coupon = data.coupon || null;
        this.pick_shift = data.pick_shift || [2];
        this.items = [];
        if (data.items) {
            for (let i in data.items) {
                this.items.push(new OrderDetail(data.items[i]));
            }
        }
        hardValidate(this, this.dataForm());
    }
}
CreateOrderData.prototype.dataForm = function () {
    return {
        name: { types: ['string'], require: true },
        code: { types: ['string'], require: true },
        quantity: { types: ['number'], require: true },
        price: { types: ['number'], require: true },
        length: { types: ['number'], require: true },
        width: { types: ['number'], require: true },
        height: { types: ['number'], require: true },
        category: { types: ['object'], require: true },
    };
};

module.exports = { CreateOrderData };
