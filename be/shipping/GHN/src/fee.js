require('dotenv').config();
const axios = require('axios');

module.exports._getFee = async (option) => {
    try {
        let data = JSON.stringify(option);
        let config = {
            method: 'get',
            url: `${process.env.GHN_URL}/v2/shipping-order/fee`,
            headers: {
                'Content-Type': 'application/json',
                Token: process.env.GHN_TOKEN,
            },
            data: data,
        };
        let result = await axios(config);
        if (result && result.status == 200) {
            return result.data.data.total;
        }
        throw new Error('Get order fee fail!');
    } catch (err) {
        throw new Error(err.message);
    }
};
