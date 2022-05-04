const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const vertifyAWS = require('../service/key.json');
var S3 = require('aws-sdk/clients/s3');
const bucketName = 'ecom-fulfill';
const wasabiEndpoint = new AWS.Endpoint('s3.ap-northeast-1.wasabisys.com');

var singleFile = async (req, res) => {
    try {
        if (req.file == undefined) {
            res.send({ success: false, mess: 'Vui Lòng Truyền File' });
        }
        var _urlFile = await uploadFile(req.file);

        if (_urlFile != undefined) {
            res.send({ success: true, data: _urlFile });
        }
    } catch (err) {
        res.send({ success: false, mess: err });
    }
};

var multiFile = async (req, res) => {
    try {
        if (req.files == undefined) {
            res.send({ success: false, mess: 'Vui Lòng Truyền File' });
        }

        var response = [];
        await new Promise(async (resolve, reject) => {
            for (let i = 0; i < req.files.length; i++) {
                var _urlFile = await uploadFile(req.files[i]);
                response.push(new String(_urlFile));
            }
            resolve(response);
        }).then((response) => {
            if (response.length != 0) {
                res.send({ success: true, data: response });
            }
        });
    } catch (err) {
        res.send({ success: false, mess: err });
    }
};

const uploadFile = (file) => {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    file.originalname = new String(file.originalname).toLowerCase().replace('/', '');

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    var today = year + '/' + month + '/' + day + '/' + uuidv4();
    file.originalname = today + '_' + file.originalname;

    const s3 = new S3({
        endpoint: wasabiEndpoint,
        region: 'ap-northeast-1',
        accessKeyId: vertifyAWS.accessKeyId,
        secretAccessKey: vertifyAWS.secretAccessKey,
    });

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
                resolve('https://s3.ap-northeast-1.wasabisys.com/ecom-fulfill/' + file.originalname);
            }
        );
    });
};

module.exports = {
    uploadSingleFileController: singleFile,
    uploadMultiFileController: multiFile,
    uploadFile,
};
