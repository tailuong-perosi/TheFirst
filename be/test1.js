const uploadFile = (buffer, fileName) => {
    const s3 = new S3({
        endpoint: wasabiEndpoint,
        region: 'ap-northeast-1',
        accessKeyId: vertifyAWS.accessKeyId,
        secretAccessKey: vertifyAWS.secretAccessKey,
    });
    let prefix = new Date().getTime().toString(16);
    prefix += '-' + Number(String(Math.random()).substring(2, 10)).toString(16);
    prefix += '-' + Number(String(Math.random()).substring(2, 10)).toString(16);
    fileName = prefix + '-' + fileName;
    return new Promise(async (resolve, reject) => {
        s3.putObject(
            {
                Body: buffer,
                Bucket: bucketName,
                Key: fileName,
                ACL: 'public-read',
            },
            (err, data) => {
                if (err) {
                    console.log(err);
                }
                resolve('https://s3.ap-northeast-1.wasabisys.com/' + bucketName + '/' + fileName);
            }
        );
    });
};
