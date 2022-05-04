let { networkInterfaces } = require('os');

let checkIpAddress = (ip) => {
    try {
        if (typeof ip != 'string') {
            throw new Error('Địa chỉ IP đầu vào phải là chuỗi!');
        }
        let ipElm = ip.split('.');
        if (ipElm.length != 4) {
            throw new Error('Địa chỉ IP đầu vào không đúng định dạng!');
        }
        for (let i in ipElm) {
            if (Number(ipElm[i]) != ipElm[i] || Number(ipElm[i]) > 255) {
                throw new Error('Các lớp IP đầu vào không đúng định dạng!');
            }
        }
        return true;
    } catch (err) {
        return false;
    }
};

let getMyIP = () => {
    let nets = networkInterfaces();
    let IPs = Object.create({});
    for (let name of Object.keys(nets)) {
        for (let net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                if (!IPs[name]) {
                    IPs[name] = [];
                }
                IPs[name].push(net.address);
            }
        }
    }
    let result = [];
    for (let i in IPs) {
        if (Array.isArray(IPs[i])) {
            for (let j in IPs[i]) {
                if (checkIpAddress(IPs[i][j])) {
                    result.push(IPs[i][j]);
                }
            }
        } else {
            if (checkIpAddress(IPs[i])) {
                result.push(IPs[i]);
            }
        }
    }
    return result;
};

module.exports = {
    getMyIP,
};
