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
    if (req.query.point_setting_id) {
      aggregateQuery.push({
        $match: { point_setting_id: Number(req.query.point_setting_id) },
      })
    }
    if (req.query.branch_id) {
      let branchIds = req.query.branch_id.split('---').map((id) => {
        return Number(id)
      })
      aggregateQuery.push({ $match: { branch_id: { $in: branchIds } } })
    }
    aggregateQuery.push({
      $lookup: {
        from: 'Branchs',
        localField: 'branch_id',
        foreignField: 'branch_id',
        as: 'branch_info',
      },
    })
    aggregateQuery.push({
      $lookup: {
        from: 'CustomerTypes',
        localField: 'customer_type_id',
        foreignField: 'type_id',
        as: 'customer_type_info',
      },
    })
    aggregateQuery.push({
      $lookup: {
        from: 'Categories',
        localField: 'category_id',
        foreignField: 'category_id',
        as: 'category_info',
      },
    })
    aggregateQuery.push({
      $lookup: {
        from: 'Products',
        let: { productIds: '$product_id' },
        pipeline: [
          { $match: { $expr: { $in: ['$product_id', '$$productIds'] } } },
          {
            $lookup: {
              from: 'Attributes',
              let: { productId: '$product_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$product_id', '$$productId'] } } },
                {
                  $lookup: {
                    from: 'Variants',
                    let: { productId: '$product_id' },
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ['$product_id', '$$productId'] },
                        },
                      },
                    ],
                    as: 'variants',
                  },
                },
              ],
              as: 'attributes',
            },
          },
        ],
        as: 'product_info',
      },
    })
    let countQuery = [...aggregateQuery]
    aggregateQuery.push({ $sort: { create_date: -1 } })
    if (req.query.page && req.query.page_size) {
      let page = Number(req.query.page) || 1
      let page_size = Number(req.query.page_size) || 50
      aggregateQuery.push(
        { $skip: (page - 1) * page_size },
        { $limit: page_size }
      )
    }
    // lấy data từ database
    let [settings, counts] = await Promise.all([
      client
        .db(req.user.database)
        .collection(`PointSettings`)
        .aggregate(aggregateQuery)
        .toArray(),
      client
        .db(req.user.database)
        .collection(`PointSettings`)
        .aggregate([...countQuery, { $count: 'counts' }])
        .toArray(),
    ])
    res.send({
      success: true,
      count: counts[0] ? counts[0].counts : 0,
      data: settings,
    })
  } catch (err) {
    next(err)
  }
}

module.exports._create = async (req, res, next) => {
  try {
    let insert = await client
      .db(req.user.database)
      .collection('PointSettings')
      .insertOne(req.body)
    if (!insert.insertedId) {
      throw new Error(`500: Tạo cấu hình tích điểm thất bại!`)
    }
    // try {
    //   let _action = {
    //     type: 'Tạo',
    //     properties: 'Cấu hình tích điểm',
    //     name: 'Tạo cáu hình tích điểm',
    //     data: req.body,
    //     performer_id: req.user.user_id,
    //     date: moment().tz(TIMEZONE).format(),
    //     slug_type: 'tao',
    //     slug_properties: 'cauhinhtichdiem',
    //     name: 'taocauhinhtichdiem',
    //   }
    //   await Promise.all([
    //     client.db(req.user.database).collection(`Actions`).insertOne(_action),
    //   ])
    // } catch (err) {
    //   console.log(err)
    // }
    res.send({ success: true, data: req.body })
  } catch (err) {
    next(err)
  }
}

module.exports._update = async (req, res, next) => {
  try {
    await client
      .db(req.user.database)
      .collection(`PointSettings`)
      .updateOne({}, { $set: req.body }, { upsert: true })
    // try {
    //     let _action = {
    //         type: 'Cập nhật',
    //         properties: 'Cấu hình tích điểm',
    //         name: 'Cập nhật cấu hình tích điểm',
    //         data: req.body,
    //         performer_id: req.user.user_id,
    //         date: moment().tz(TIMEZONE).format(),
    //         slug_type: 'capnhat',
    //         slug_properties: 'cauhinhtichdiem',
    //         name: 'capnhatcauhinhtichdiem',
    //     };
    //     await client.db(req.user.database).collection(`Actions`).insertOne(_action);
    // } catch (err) {
    //     console.log(err);
    // }
    res.send({ success: true, data: req.body })
  } catch (err) {
    next(err)
  }
}
