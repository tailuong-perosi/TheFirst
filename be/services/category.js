const moment = require(`moment-timezone`)
const TIMEZONE = process.env.TIMEZONE
const client = require(`../config/mongodb`)
const DB = process.env.DATABASE

function convertToSlug(text) {
  return new String(text)
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
}

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
    aggregateQuery.push({ $match: { parent_id: -1 } })
    if (req.query.detach) {
      aggregateQuery.shift()
    }
    if (req.query.category_id) {
      aggregateQuery.push({
        $match: { category_id: Number(req.query.category_id) },
      })
    }
    if (req.query.code) {
      aggregateQuery.push({ $match: { code: String(req.query.code) } })
    }
    if (req.query.creator_id) {
      aggregateQuery.push({
        $match: { creator_id: Number(req.query.creator_id) },
      })
    }
    if (req.query['today']) {
      req.query[`from_date`] = moment().tz(TIMEZONE).startOf('days').format()
      req.query[`to_date`] = moment().tz(TIMEZONE).endOf('days').format()
      delete req.query.today
    }
    if (req.query['yesterday']) {
      req.query[`from_date`] = moment()
        .tz(TIMEZONE)
        .add(-1, `days`)
        .startOf('days')
        .format()
      req.query[`to_date`] = moment()
        .tz(TIMEZONE)
        .add(-1, `days`)
        .endOf('days')
        .format()
      delete req.query.yesterday
    }
    if (req.query['this_week']) {
      req.query[`from_date`] = moment().tz(TIMEZONE).startOf('weeks').format()
      req.query[`to_date`] = moment().tz(TIMEZONE).endOf('weeks').format()
      delete req.query.this_week
    }
    if (req.query['last_week']) {
      req.query[`from_date`] = moment()
        .tz(TIMEZONE)
        .add(-1, 'weeks')
        .startOf('weeks')
        .format()
      req.query[`to_date`] = moment()
        .tz(TIMEZONE)
        .add(-1, 'weeks')
        .endOf('weeks')
        .format()
      delete req.query.last_week
    }
    if (req.query['this_month']) {
      req.query[`from_date`] = moment().tz(TIMEZONE).startOf('months').format()
      req.query[`to_date`] = moment().tz(TIMEZONE).endOf('months').format()
      delete req.query.this_month
    }
    if (req.query['last_month']) {
      req.query[`from_date`] = moment()
        .tz(TIMEZONE)
        .add(-1, 'months')
        .startOf('months')
        .format()
      req.query[`to_date`] = moment()
        .tz(TIMEZONE)
        .add(-1, 'months')
        .endOf('months')
        .format()
      delete req.query.last_month
    }
    if (req.query['this_year']) {
      req.query[`from_date`] = moment().tz(TIMEZONE).startOf('years').format()
      req.query[`to_date`] = moment().tz(TIMEZONE).endOf('years').format()
      delete req.query.this_year
    }
    if (req.query['last_year']) {
      req.query[`from_date`] = moment()
        .tz(TIMEZONE)
        .add(-1, 'years')
        .startOf('years')
        .format()
      req.query[`to_date`] = moment()
        .tz(TIMEZONE)
        .add(-1, 'years')
        .endOf('years')
        .format()
      delete req.query.last_year
    }
    if (req.query['from_date']) {
      req.query[`from_date`] = moment(req.query[`from_date`])
        .tz(TIMEZONE)
        .startOf('days')
        .format()
    }
    if (req.query['to_date']) {
      req.query[`to_date`] = moment(req.query[`to_date`])
        .tz(TIMEZONE)
        .endOf('days')
        .format()
    }
    if (req.query.from_date) {
      aggregateQuery.push({
        $match: { create_date: { $gte: req.query.from_date } },
      })
    }
    if (req.query.to_date) {
      aggregateQuery.push({
        $match: { create_date: { $lte: req.query.to_date } },
      })
    }
    // lấy các thuộc tính tìm kiếm với độ chính xác tương đối ('1' == '1', '1' == '12',...)
    if (req.query.name) {
      aggregateQuery.push({
        $match: {
          slug_name: new RegExp(
            `${removeUnicode(req.query.name, false).replace(
              /(\s){1,}/g,
              '(.*?)'
            )}`,
            'ig'
          ),
        },
      })
    }
    if (req.query.search) {
      aggregateQuery.push({
        $match: {
          $or: [
            {
              code: new RegExp(
                `${removeUnicode(req.query.search, false).replace(
                  /(\s){1,}/g,
                  '(.*?)'
                )}`,
                'ig'
              ),
            },
            {
              slug_name: new RegExp(
                `${removeUnicode(req.query.search, false).replace(
                  /(\s){1,}/g,
                  '(.*?)'
                )}`,
                'ig'
              ),
            },
          ],
        },
      })
    }
    if (req.query._deals) {
      aggregateQuery.push({
        $lookup: {
          from: 'Deals',
          let: { categoryId: '$category_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$$categoryId', '$category_list'] },
                    { $eq: ['$type', 'category'] },
                  ],
                },
              },
            },
          ],
          as: '_deals',
        },
      })
    }
    if (req.query._business) {
      aggregateQuery.push(
        {
          $lookup: {
            from: 'Users',
            localField: 'business_id',
            foreignField: 'user_id',
            as: '_business',
          },
        },
        { $unwind: { path: '$_business', preserveNullAndEmptyArrays: true } }
      )
    }
    if (req.query._creator) {
      aggregateQuery.push(
        {
          $lookup: {
            from: 'Users',
            localField: 'creator_id',
            foreignField: 'user_id',
            as: '_creator',
          },
        },
        { $unwind: { path: '$_creator', preserveNullAndEmptyArrays: true } }
      )
    }
    aggregateQuery.push(
      {
        $lookup: {
          from: 'Products',
          localField: 'category_id',
          foreignField: 'category_id',
          as: 'products',
        },
      },
      { $addFields: { totalProducts: { $size: '$products' } } }
    )
    aggregateQuery.push({
      $project: {
        slug_name: 0,
        _products: 0,
        'children_category.slug_name': 0,
        'children_category._products': 0,
        'children_category._creator.password': 0,
        'children_category._creator.otp_code': 0,
        'children_category._creator.otp_timelife': 0,
        'children_category._creator.sub_name': 0,
        'children_category._creator.sub_address': 0,
        'children_category._creator.sub_district': 0,
        'children_category._creator.sub_province': 0,
        '_business.password': 0,
        '_business.otp_code': 0,
        '_business.otp_timelife': 0,
        '_business.sub_name': 0,
        '_business.sub_address': 0,
        '_business.sub_district': 0,
        '_business.sub_province': 0,
        '_creator.password': 0,
        '_creator.otp_code': 0,
        '_creator.otp_timelife': 0,
        '_creator.sub_name': 0,
        '_creator.sub_address': 0,
        '_creator.sub_district': 0,
        '_creator.sub_province': 0,
      },
    })
    let countQuery = [...aggregateQuery]
    aggregateQuery.push({ $sort: { priority: 1 } })
    let page = Number(req.query.page) || 1
    let page_size = Number(req.query.page_size) || 50
    aggregateQuery.push(
      { $skip: (page - 1) * page_size },
      { $limit: page_size }
    )
    aggregateQuery.push(
      {
        $lookup: {
          from: 'Products',
          localField: 'category_id',
          foreignField: 'category_id',
          as: '_products',
        },
      },
      { $addFields: { product_quantity: { $size: '$_products' } } }
    )
    aggregateQuery.push({
      $lookup: {
        from: 'Categories',
        let: { categoryId: '$category_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$parent_id', '$$categoryId'] } } },
          ...(() => {
            if (req.query._creator) {
              return [
                {
                  $lookup: {
                    from: 'Users',
                    localField: 'creator_id',
                    foreignField: 'user_id',
                    as: '_creator',
                  },
                },
                {
                  $unwind: {
                    path: '$_creator',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ]
            }
            return []
          })(),
          {
            $lookup: {
              from: 'Products',
              localField: 'category_id',
              foreignField: 'category_id',
              as: '_products',
            },
          },
          { $addFields: { product_quantity: { $size: '$_products' } } },
          {
            $lookup: {
              from: 'Categories',
              let: { categoryId: '$category_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$parent_id', '$$categoryId'] } } },
                ...(() => {
                  if (req.query._creator) {
                    return [
                      {
                        $lookup: {
                          from: 'Users',
                          localField: 'creator_id',
                          foreignField: 'user_id',
                          as: '_creator',
                        },
                      },
                      {
                        $unwind: {
                          path: '$_creator',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                    ]
                  }
                  return []
                })(),
                {
                  $lookup: {
                    from: 'Products',
                    localField: 'category_id',
                    foreignField: 'category_id',
                    as: '_products',
                  },
                },
                { $addFields: { product_quantity: { $size: '$_products' } } },
              ],
              as: 'children_category',
            },
          },
        ],
        as: 'children_category',
      },
    })
    // lấy data từ database
    var [categories, counts] = await Promise.all([
      client
        .db(req.user.database)
        .collection(`Categories`)
        .aggregate(aggregateQuery)
        .toArray(),
      client
        .db(req.user.database)
        .collection(`Categories`)
        .aggregate([...countQuery, { $count: 'counts' }])
        .toArray(),
    ])
    res.send({
      success: true,
      count: counts[0] ? counts[0].counts : 0,
      data: categories,
    })
  } catch (err) {
    next(err)
  }
}

module.exports._create = async (req, res, next) => {
  try {
    let insert = await client
      .db(req.user.database)
      .collection(`Categories`)
      .insertOne(req.body)
    if (!insert.insertedId) {
      throw new Error('500: Tạo nhóm sản phẩm thất bại!')
    }
    var body = req.body

    if (body.condition != undefined) {
      var query = {}
      if (body.condition.must_match == 'all') {
        var filter_th2 = false
        // Filter Phase 1
        for (var i = 0; i < body.condition.function.length; i++) {
          switch (body.condition.function[i].operator) {
            case 'starts_with':
              filter_th2 = true
              break
            case 'ends_with':
              filter_th2 = true
              break
            case 'is_equal_to':
              query[`${body.condition.function[i].name}`] = convertToSlug(
                body.condition.function[i].value
              )
              break
            case 'is_not_equal_to':
              query[`${body.condition.function[i].name}`] = {
                $ne: convertToSlug(body.condition.function[i].value),
              }
              break
            case 'is_greater_than':
              query[`${body.condition.function[i].name}`] = {
                $gte: parseInt(body.condition.function[i].value),
              }
              break
            case 'is_less_than':
              query[`${body.condition.function[i].name}`] = {
                $lt: parseInt(body.condition.function[i].value),
              }
              break
            case 'contains':
              query[`${body.condition.function[i].name}`] = new RegExp(
                convertToSlug(body.condition.function[i].value)
              )
              break
            case 'does_not_contains':
              query[`${body.condition.function[i].name}`] = {
                $ne: convertToSlug(body.condition.function[i].value),
              }
              break
            case 'is_not_empty':
              query[`${body.condition.function[i].name}`] = {
                $ne: '',
              }
              break
            case 'is_empty':
              query[`${body.condition.function[i].name}`] = ''
              break
          }
        }

        // query.auto_match_category = true;

        console.log(query)
        var data = await client
          .db(process.env.DB)
          .collection('Products')
          .find(query)
          .toArray()

        // Filter Phase 2
        var result = []
        if (filter_th2) {
          for (var j = 0; j < data.length; j++) {
            for (var i = 0; i < body.condition.function.length; i++) {
              switch (body.condition.function[i].operator) {
                case 'starts_with':
                  if (
                    new String(
                      data[j][`${body.condition.function[i].name}`]
                    ).split('-')[0] == body.condition.function[i].value
                  )
                    result.push(data[j])
                  break
                case 'ends_with':
                  var length = new String(
                    data[j][`${body.condition.function[i].name}`]
                  ).split('-').length

                  if (
                    new String(
                      data[j][`${body.condition.function[i].name}`]
                    ).split('-')[length - 1] == body.condition.function[i].value
                  )
                    result.push(data[j])
                  break
              }
            }
          }
        } else {
          result = data
        }

        for (var _i = 0; _i < result.length; _i++) {
          result[_i].categories.push(body.category_id)
          await client
            .db(DB)
            .collection('Products')
            .updateOne(
              {
                product_id: parseInt(result[_i].product_id),
              },
              {
                $set: {
                  categories: result[_i].categories,
                  last_update: moment().tz(TIMEZONE).format(),
                },
              }
            )
        }
      } else {
        var query_any = []
        for (var i = 0; i < body.condition.function.length; i++) {
          switch (body.condition.function[i].operator) {
            case 'starts_with':
              var query = {}
              query[`${body.condition.function[i].name}`] = new RegExp(
                `^(${convertToSlug(body.condition.function[i].value)})`,
                'i'
              )
              query_any.push(query)
              break
            case 'ends_with':
              var query = {}
              query[`${body.condition.function[i].name}`] = new RegExp(
                `(${convertToSlug(body.condition.function[i].value)})$`,
                'i'
              )

              query_any.push(query)
              break
            case 'is_equal_to':
              var query = {}
              query[`${body.condition.function[i].name}`] = convertToSlug(
                body.condition.function[i].value
              )

              query_any.push(query)
              break
            case 'is_not_equal_to':
              var query = {}
              query[`${body.condition.function[i].name}`] = {
                $ne: convertToSlug(body.condition.function[i].value),
              }
              query_any.push(query)
              break
            case 'is_greater_than':
              var query = {}
              query[`${body.condition.function[i].name}`] = {
                $gte: parseInt(body.condition.function[i].value),
              }
              query_any.push(query)

              break
            case 'is_less_than':
              var query = {}
              query[`${body.condition.function[i].name}`] = {
                $lt: parseInt(body.condition.function[i].value),
              }
              query_any.push(query)
              break
            case 'contains':
              var query = {}
              query[`${body.condition.function[i].name}`] = new RegExp(
                convertToSlug(body.condition.function[i].value)
              )
              query_any.push(query)

              break
            case 'does_not_contains':
              var query = {}
              query[`${body.condition.function[i].name}`] = {
                $ne: convertToSlug(body.condition.function[i].value),
              }
              query_any.push(query)
              break
            case 'is_not_empty':
              var query = {}
              query[`${body.condition.function[i].name}`] = {
                $ne: '',
              }
              query_any.push(query)
              break
            case 'is_empty':
              var query = {}
              query[`${body.condition.function[i].name}`] = ''
              query_any.push(query)
              break
          }
        }

        console.log(query_any)

        var result = await client
          .db(DB)
          .collection('Products')
          .aggregate(query_any)
          .toArray()

        for (var _i = 0; _i < result.length; _i++) {
          result[_i].categories.push(body.category_id)
          await client
            .db(DB)
            .collection('Products')
            .updateOne(
              {
                product_id: parseInt(result[_i].product_id),
              },
              {
                $set: {
                  categories: result[_i].categories,
                  last_update: moment().tz(TIMEZONE).format(),
                },
              }
            )
        }
      }
    }

    res.send({ success: true, data: req.body })
  } catch (err) {
    next(err)
  }
}

module.exports._update = async (req, res, next) => {
  try {
    await client
      .db(req.user.database)
      .collection(`Categories`)
      .updateOne(req.params, { $set: req.body })
    // try {
    //     let _action = {
    //         business_id: req.user.business_id,
    //         type: 'Cập nhật',
    //         properties: 'Nhóm sản phẩm',
    //         name: 'Cập nhật nhóm sản phẩm',
    //         data: req.body,
    //         performer_id: req.user.user_id,
    //         date: moment().tz(TIMEZONE).format(),
    //         slug_type: 'capnhat',
    //         slug_properties: 'nhomsanpham',
    //         name: 'capnhatnhomsanpham',
    //     };
    //     await client.db(req.user.database).collection(`Actions`).insertOne(_action);
    // } catch (err) {
    //     console.log(err);
    // }

    var body = req.body

    if (body.condition != undefined) {
      var query = {}
      if (body.condition.must_match == 'all') {
        var filter_th2 = false
        // Filter Phase 1
        for (var i = 0; i < body.condition.function.length; i++) {
          switch (body.condition.function[i].operator) {
            case 'starts_with':
              filter_th2 = true
              break
            case 'ends_with':
              filter_th2 = true
              break
            case 'is_equal_to':
              query[`${body.condition.function[i].name}`] = convertToSlug(
                body.condition.function[i].value
              )
              break
            case 'is_not_equal_to':
              query[`${body.condition.function[i].name}`] = {
                $ne: convertToSlug(body.condition.function[i].value),
              }
              break
            case 'is_greater_than':
              query[`${body.condition.function[i].name}`] = {
                $gte: parseInt(body.condition.function[i].value),
              }
              break
            case 'is_less_than':
              query[`${body.condition.function[i].name}`] = {
                $lt: parseInt(body.condition.function[i].value),
              }
              break
            case 'contains':
              query[`${body.condition.function[i].name}`] = new RegExp(
                convertToSlug(body.condition.function[i].value)
              )
              break
            case 'does_not_contains':
              query[`${body.condition.function[i].name}`] = {
                $ne: convertToSlug(body.condition.function[i].value),
              }
              break
            case 'is_not_empty':
              query[`${body.condition.function[i].name}`] = {
                $ne: '',
              }
              break
            case 'is_empty':
              query[`${body.condition.function[i].name}`] = ''
              break
          }
        }

        // query.auto_match_category = true;

        console.log(query)
        var data = await client
          .db(process.env.DB)
          .collection('Products')
          .find(query)
          .toArray()

        // Filter Phase 2
        var result = []
        if (filter_th2) {
          for (var j = 0; j < data.length; j++) {
            for (var i = 0; i < body.condition.function.length; i++) {
              switch (body.condition.function[i].operator) {
                case 'starts_with':
                  if (
                    new String(
                      data[j][`${body.condition.function[i].name}`]
                    ).split('-')[0] == body.condition.function[i].value
                  )
                    result.push(data[j])
                  break
                case 'ends_with':
                  var length = new String(
                    data[j][`${body.condition.function[i].name}`]
                  ).split('-').length

                  if (
                    new String(
                      data[j][`${body.condition.function[i].name}`]
                    ).split('-')[length - 1] == body.condition.function[i].value
                  )
                    result.push(data[j])
                  break
              }
            }
          }
        } else {
          result = data
        }

        for (var _i = 0; _i < result.length; _i++) {
          result[_i].categories.push(body.category_id)
          await client
            .db(DB)
            .collection('Products')
            .updateOne(
              {
                product_id: parseInt(result[_i].product_id),
              },
              {
                $set: {
                  categories: result[_i].categories,
                  last_update: moment().tz(TIMEZONE).format(),
                },
              }
            )
        }
      } else {
        var query_any = []
        for (var i = 0; i < body.condition.function.length; i++) {
          switch (body.condition.function[i].operator) {
            case 'starts_with':
              var query = {}
              query[`${body.condition.function[i].name}`] = new RegExp(
                `^(${convertToSlug(body.condition.function[i].value)})`,
                'i'
              )
              query_any.push(query)
              break
            case 'ends_with':
              var query = {}
              query[`${body.condition.function[i].name}`] = new RegExp(
                `(${convertToSlug(body.condition.function[i].value)})$`,
                'i'
              )

              query_any.push(query)
              break
            case 'is_equal_to':
              var query = {}
              query[`${body.condition.function[i].name}`] = convertToSlug(
                body.condition.function[i].value
              )

              query_any.push(query)
              break
            case 'is_not_equal_to':
              var query = {}
              query[`${body.condition.function[i].name}`] = {
                $ne: convertToSlug(body.condition.function[i].value),
              }
              query_any.push(query)
              break
            case 'is_greater_than':
              var query = {}
              query[`${body.condition.function[i].name}`] = {
                $gte: parseInt(body.condition.function[i].value),
              }
              query_any.push(query)

              break
            case 'is_less_than':
              var query = {}
              query[`${body.condition.function[i].name}`] = {
                $lt: parseInt(body.condition.function[i].value),
              }
              query_any.push(query)
              break
            case 'contains':
              var query = {}
              query[`${body.condition.function[i].name}`] = new RegExp(
                convertToSlug(body.condition.function[i].value)
              )
              query_any.push(query)

              break
            case 'does_not_contains':
              var query = {}
              query[`${body.condition.function[i].name}`] = {
                $ne: convertToSlug(body.condition.function[i].value),
              }
              query_any.push(query)
              break
            case 'is_not_empty':
              var query = {}
              query[`${body.condition.function[i].name}`] = {
                $ne: '',
              }
              query_any.push(query)
              break
            case 'is_empty':
              var query = {}
              query[`${body.condition.function[i].name}`] = ''
              query_any.push(query)
              break
          }
        }

        console.log(query_any)

        var result = await client
          .db(DB)
          .collection('Products')
          .aggregate(query_any)
          .toArray()

        for (var _i = 0; _i < result.length; _i++) {
          result[_i].categories.push(body.category_id)
          await client
            .db(DB)
            .collection('Products')
            .updateOne(
              {
                product_id: parseInt(result[_i].product_id),
              },
              {
                $set: {
                  categories: result[_i].categories,
                  last_update: moment().tz(TIMEZONE).format(),
                },
              }
            )
        }
      }
    }
    res.send({ success: true, data: req.body })
  } catch (err) {
    next(err)
  }
}
