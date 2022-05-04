require('dotenv').config();
const axios = require('axios');

module.exports._get = async (token) => {
    try {
        let config = {
            method: 'get',
            url: `${process.env.GHN_URL}/v2/shop/all`,
            headers: {
                'Content-Type': 'application/json',
                Token: token,
            },
            data: JSON.stringify({
                offset: 0,
                limit: 50,
                client_phone: '',
            }),
        };
        let result = await axios(config);
        if (result && result.status == 200) {
            return result.data.data.shops;
        }
        throw new Error('Get warehouse fail!');
    } catch (err) {
        throw new Error(err.message);
    }
};

module.exports._create = async (createWarehouseData, token) => {
    try {
        let config = {
            method: 'post',
            url: `${process.env.GHN_URL}/v2/shop/register`,
            headers: {
                'Content-Type': 'application/json',
                Token: token,
            },
            data: JSON.stringify(createWarehouseData),
        };
        try {
            let result = await axios(config);
            if (result && result.status == 200) {
                return result.data;
            }
        } catch (err) {
            throw new Error('Create warehouse fail!');
        }
    } catch (err) {
        if (err.response && err.response.data && err.response.data.code_message_value) {
            throw new Error(err.response.data.code_message_value);
        }
        throw new Error(err.message);
    }
};
