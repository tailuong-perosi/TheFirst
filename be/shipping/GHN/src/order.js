require('dotenv').config();
const axios = require('axios');
const { CreateOrderData } = require('../models/order');

/**
 *
 * @param {String} orderCode
 * @returns
 */
module.exports._get = async (orderCode, token) => {
    try {
        let config = {
            method: 'post',
            url: `${process.env.GHN_URL}/v2/shipping-order/detail`,
            headers: {
                'Content-Type': 'application/json',
                Token: token,
            },
            data: JSON.stringify({ order_code: orderCode }),
        };
        let result = await axios(config);
        if (result && result.status == 200) {
            return result.data.data.shops;
        }
        throw new Error('Get order fail!');
    } catch (err) {
        throw new Error(err.message);
    }
};

/**
 *
 * @param {CreateOrderData} orderData
 * @param {String} shopId
 * @returns
 */
module.exports._create = async (orderData, shopId, token) => {
    try {
        let config = {
            method: 'post',
            url: `${process.env.GHN_URL}/v2/shipping-order/create`,
            headers: {
                'Content-Type': 'application/json',
                ShopId: shopId,
                Token: token,
            },
            data: JSON.stringify(new CreateOrderData(orderData)),
        };
        let result = await axios(config);
        if (result && result.status == 200) {
            return result.data.data;
        }
        throw new Error('Create order fail!');
    } catch (err) {
        if (err.response && err.response.data && err.response.data.code_message_value) {
            console.log(err.response.data);
            throw new Error(err.response.data.code_message_value);
        }
        throw new Error(err.message);
    }
};
