const moment = require(`moment-timezone`)
const TIMEZONE = process.env.TIMEZONE
const client = require(`../config/mongodb`)
const DB = process.env.DATABASE

let removeUnicode = (text, removeSpace) => {
  /*
        string là chuỗi cần remove unicode
        trả về chuỗi ko dấu tiếng việt ko khoảng trắng
    */
  if (typeof text != 'string') {
    return ''
  }
  if (removeSpace && typeof removeSpace != 'boolean') {
    throw new Error('Type of removeSpace input must be boolean!')
  }
  text = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
  if (removeSpace) {
    text = text.replace(/\s/g, '')
  }
  return text
}

module.exports._get = async (req, res, next) => {
  try {
    let aggregateQuery = []
    // lấy các thuộc tính tìm kiếm cần độ chính xác cao ('1' == '1', '1' != '12',...)
    if (req.params.user_phone) {
      aggregateQuery.push({ $match: { user_phone: req.params.user_phone } })}
    
    

    /**
     * creatBy: tailuong
     * 
     */
    // lấy data từ database
    let orders = await 
      client
        .db(DB)
        .collection(`Shopping`)
        .aggregate(aggregateQuery).toArray();        
    res.send({
      success: true,
      data: orders,
    })
  } catch (err) {
    next(err)
  }
}

module.exports._update = async (req, res, next) => {
  try {
    await client
      .db(DB)
      .collection(`ShoppingDairy`)
      .updateOne(req.params, { $set: req.body })
    // try {
    //   let _action = {
    //     business_id: req.user.business_id,
    //     type: 'Cập nhật',
    //     properties: 'Đơn hàng',
    //     name: 'Cập nhật đơn hàng',
    //     data: req.body,
    //     performer_id: req.user.user_id,
    //     date: moment().tz(TIMEZONE).format(),
    //     slug_type: 'capnhat',
    //     slug_properties: 'donhang',
    //     name: 'capnhatdonhang',
    //   }
    //   await client
    //     .db(req.user.database)
    //     .collection(`Actions`)
    //     .insertOne(_action)
    // } catch (err) {
    //   console.log(err)
    // }
    res.send({ success: true, data: req.body })
  } catch (err) {
    next(err)
  }
}
module.exports._get = async (req, res, next) => {
  let db = db.getSiblingDB("admin");
  let dbs = db.runCommand({ "listDatabases": 1 }).databases;

  // Iterate through each database.
  dbs.forEach(function(database) {
      db = db.getSiblingDB(database.name);

      collection = db.getCollection('Shopping');

      var meldingIds = collection.distinct('meldingId');
      print(meldingIds);
  
  });
}