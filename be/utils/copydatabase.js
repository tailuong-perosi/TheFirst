const { MongoClient } = require('mongodb');

let copyDatabase = (sourceURI, sourceDatabaseName, destinationURI, destinationDatabaseName, copyCollections) => {
    /*
        copy database qua 1 database mới
    */
    // URI database gốc
    let sourceUri = sourceURI;
    let sourceClient = new MongoClient(sourceUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    // URI database cần copy đến
    let destinationUri = destinationURI;
    let destinationClient = new MongoClient(destinationUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    let _connect = new Promise(async (resolve, reject) => {
        await sourceClient.connect().catch((err) => {
            reject(err);
        });
        await destinationClient.connect().catch((err) => {
            reject(err);
        });
        resolve(`Successfull database connect!`);
    });
    _connect.then(async (message) => {
        console.log(message);
        // Các collection cần copy để mảng rỗng nếu muốn copy toàn bộ
        let collections = copyCollections || [];
        let errors = [];
        if (collections.length == 0) {
            let _collections = await sourceClient.db(sourceDatabaseName).collections();
            for (let i in _collections) {
                collections.push(_collections[i].namespace.split(`.`)[1]);
            }
        }
        collections.map(async (collection) => {
            let data1 = await sourceClient.db(sourceDatabaseName).collection(collection).find({}).toArray();
            console.log(`Get data in source collection: ${collection}`);
            if (data1.length == 0) {
                let data2 = await destinationClient
                    .db(destinationDatabaseName)
                    .collection(collection)
                    .insertOne({ tmp: `tmp` });
                console.log(`Insert data to destination collection: ${collection}`);
                if (data2.insertedId) {
                    await destinationClient
                        .db(destinationDatabaseName)
                        .collection(collection)
                        .deleteMany({ tmp: `tmp` });
                    console.log(`done collection: ${collection}`);
                } else {
                    errors.push(collection);
                }
            } else {
                let data2 = await destinationClient
                    .db(destinationDatabaseName)
                    .collection(collection)
                    .insertMany(data1);
                console.log(`Insert data to destination collection: ${collection}`);
                if (data2.insertedIds) {
                    console.log(`done collection: ${collection}`);
                } else {
                    errors.push(collection);
                }
            }
        });
        errors.map((error) => {
            console.log(`error at collection: ${error}`);
        });
    });
    _connect.catch((err) => {
        console.log(`Failed database connect: ${err.message}!`);
    });
};

copyDatabase('mongodb://viesoftware:viesoftware@api.wadyn.com.vn:27017/', 'Wadi','mongodb://viesoftware:viesoftware@103.173.155.48:27017/','hihihi');

module.exports = { copyDatabase };
