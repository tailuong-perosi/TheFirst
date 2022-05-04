const jwt = require(`jsonwebtoken`);
const key = require('./key');

let createToken = (data, timeLife) => {
    const payload = {
        ...data,
    };
    if (!timeLife) {
        timeLife = 24 * 60 * 60;
    }
    return new Promise((resolve, reject) => {
        jwt.sign(
            {
                data: payload,
                exp: Math.floor(Date.now() / 1000) + timeLife,
            },
            key.PRIVATEKEY,
            { algorithm: 'RS256' },
            (error, encoded) => {
                if (error) return reject(error);
                return resolve(encoded);
            }
        );
    });
};

let verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, key.PRIVATEKEY, { algorithms: 'RS256' }, (error, decoded) => {
            if (error) {
                return reject(error);
            }
            return resolve(decoded);
        });
    });
};

module.exports = { createToken, verifyToken };
