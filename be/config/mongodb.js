require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_DATABASE_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let _connect = new Promise(async (resolve, reject) => {
    await client.connect().catch((err) => {
        reject(err);
    });
    resolve(`Successful database connect!`);
});

_connect.then(async (message) => {
    console.log(message);
    console.log('Database URI: ' + process.env.MONGO_DATABASE_URI);
    console.log('Database Name: ' + process.env.DATABASE);
    let business = await client.db('RootAO').collection('Business').find({}).toArray();
    // for (let i in business) {
    //     try {
    //         const DB = business[i].database_name;
    //         console.log(DB);
    //         await client.db(DB).collection('Orders').dropIndexes({ import_order_id: 1 });
    //         await client.db(DB).collection('Orders').dropIndexes({ import_order_code: 1 });
    //     } catch (err) {
    //         console.log('err');
    //     }
    // }
    // console.log(`done`);
});

_connect.catch((err) => {
    console.log(`Failed database connect: ${err.message}!`);
});

module.exports = client;
