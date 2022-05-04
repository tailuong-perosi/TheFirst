const order = require('./src/order');
const { CreateOrderData } = require('./models/order');
const warehouse = require('./src/warehouse');
const { CreateWarehouseData } = require('./models/warehouse');

/**
 *
 * @param {string} token
 * @returns
 */
module.exports._getWarehouse = async (token) => {
    try {
        return warehouse._get(token);
    } catch (err) {
        throw err;
    }
};

/**
 *
 * @param {CreateWarehouseData} createWarehouseData
 * @returns
 */
module.exports._createWarehouse = async (createWarehouseData, token) => {
    try {
        return warehouse._create(new CreateWarehouseData(createWarehouseData), token);
    } catch (err) {
        throw err;
    }
};

/**
 *
 * @param {string} orderCode
 * @returns
 */
module.exports._getOrder = async (orderCode, token) => {
    try {
        return order._get(orderCode, token);
    } catch (err) {
        throw err;
    }
};

/**
 *
 * @param {CreateOrderData} createOrderData
 * @param {string} shopId
 * @returns
 */
module.exports._createOrder = async (createOrderData, shopId, token) => {
    try {
        let result = await order._create(new CreateOrderData(createOrderData), shopId, token);
        return result;
    } catch (err) {
        throw err;
    }
};
