const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
var S3 = require('aws-sdk/clients/s3');
const bucketName = 'admin-order';
require('dotenv').config();
const wasabiEndpoint = new AWS.Endpoint('s3.ap-northeast-1.wasabisys.com');

let removeUnicode = (str) => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]|\s/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

let uploadWSB = async (file) => {
    try {
        var d = new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
        file.originalname = new String(file.originalname).toLowerCase().replace('/', '');

        file.originalname = removeUnicode(file.originalname);

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        var today = year + '/' + month + '/' + day + '/' + uuidv4();
        file.originalname = today + '_' + file.originalname;

        const s3 = new S3({
            endpoint: wasabiEndpoint,
            region: 'ap-northeast-1',
            accessKeyId: process.env.access_key_wasabi,
            secretAccessKey: process.env.secret_key_wasabi,
        });

        file.originalname = new String(file.originalname).replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '_');

        return new Promise(async (resolve, reject) => {
            s3.putObject(
                {
                    Body: file.buffer,
                    Bucket: bucketName,
                    Key: file.originalname,
                    ACL: 'public-read',
                },
                (err, data) => {
                    if (err) {
                        console.log(err);
                    }
                    resolve('https://s3.ap-northeast-1.wasabisys.com/admin-order/' + file.originalname);
                }
            );
        });
    } catch (err) {
        next(err);
    }
};

let singleC = async (req, res, next) => {
    try {
        if (req.file == undefined) {
            res.send({ success: false, mess: 'Vui Lòng Truyền File' });
        }
        var _urlFile = await uploadWSB(req.file);
        if (_urlFile != undefined) {
            res.send({ success: true, data: _urlFile });
        } else {
            throw new Error('500: Lỗi upload!');
        }
    } catch (err) {
        next(err);
    }
};

let multipleC = async (req, res, next) => {
    try {
        if (req.files == undefined) {
            res.send({ success: false, mess: 'Vui Lòng Truyền File' });
        }
        await new Promise(async (resolve, reject) => {
            var response = [];
            for (let i = 0; i < req.files.length; i++) {
                var _urlFile = await uploadWSB(req.files[i]);
                response.push(new String(_urlFile));
            }
            resolve(response);
        })
            .then((response) => {
                if (response.length != 0) {
                    res.send({ success: true, data: response });
                } else {
                    throw new Error('500: Lỗi upload!');
                }
            })
            .catch((err) => {
                throw new Error('500: Lỗi upload!');
            });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    singleC,
    multipleC,
};
