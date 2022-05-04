const moment = require(`moment-timezone`)
const TIMEZONE = process.env.TIMEZONE
const client = require(`../config/mongodb`)
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
var S3 = require('aws-sdk/clients/s3')
const bucketName = 'admin-order'
require('dotenv').config()
const wasabiEndpoint = new AWS.Endpoint('s3.ap-northeast-1.wasabisys.com')
const DB = process.env.DATABASE
const XLSX = require('xlsx')

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
  text = new String(text).toLowerCase()
  return text
}

const validate = (current, fields) => {
  var object = {}
  Object.keys(current).map((cur) => {
    if (fields.includes(cur) == true && current[cur] != undefined) {
      object[cur] = current[cur]
    }
  })
  return Object.keys(object).length == fields.length ? object : false
}

let convertToSlug = (text) => {
  /*
        string là chuỗi cần remove unicode
        trả về chuỗi ko dấu tiếng việt ko khoảng trắng
    */
  if (typeof text != 'string') {
    return ''
  }

  text = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
  text = text.replace(/\s/g, '_')

  text = new String(text).toLowerCase()
  return text
}

module.exports._get = async (req, res, next) => {
  try {
    let aggregateQuery = []
    // lấy các thuộc tính tìm kiếm cần độ chính xác cao ('1' == '1', '1' != '12',...)
    if (req.query.shipping_company_id) {
      aggregateQuery.push({
        $match: { shipping_company_id: Number(req.query.shipping_company_id) },
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

    if (req.query['today'] != undefined) {
      req.query[`from_date`] = moment().tz(TIMEZONE).startOf('days').format()
      req.query[`to_date`] = moment().tz(TIMEZONE).endOf('days').format()
      delete req.query.today
    }
    if (req.query['yesterday'] != undefined) {
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
    if (req.query['this_week'] != undefined) {
      req.query[`from_date`] = moment().tz(TIMEZONE).startOf('weeks').format()
      req.query[`to_date`] = moment().tz(TIMEZONE).endOf('weeks').format()
      delete req.query.this_week
    }
    if (req.query['last_week'] != undefined) {
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
    if (req.query['this_month'] != undefined) {
      req.query[`from_date`] = moment().tz(TIMEZONE).startOf('months').format()
      req.query[`to_date`] = moment().tz(TIMEZONE).endOf('months').format()
      delete req.query.this_month
    }
    if (req.query['last_month'] != undefined) {
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
    if (req.query['this_year'] != undefined) {
      req.query[`from_date`] = moment().tz(TIMEZONE).startOf('years').format()
      req.query[`to_date`] = moment().tz(TIMEZONE).endOf('years').format()
      delete req.query.this_year
    }
    if (req.query['last_year'] != undefined) {
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
    if (req.query['from_date'] != undefined) {
      req.query[`from_date`] = moment(req.query[`from_date`])
        .tz(TIMEZONE)
        .startOf('days')
        .format()
    }
    if (req.query['to_date'] != undefined) {
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
    if (req.query.address) {
      aggregateQuery.push({
        $match: {
          slug_address: new RegExp(
            `${removeUnicode(req.query.address, false).replace(
              /(\s){1,}/g,
              '(.*?)'
            )}`,
            'ig'
          ),
        },
      })
    }
    if (req.query.district) {
      aggregateQuery.push({
        $match: {
          slug_district: new RegExp(
            `${removeUnicode(req.query.district, false).replace(
              /(\s){1,}/g,
              '(.*?)'
            )}`,
            'ig'
          ),
        },
      })
    }
    if (req.query.province) {
      aggregateQuery.push({
        $match: {
          slug_province: new RegExp(
            `${removeUnicode(req.query.province, false).replace(
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
    // lấy các thuộc tính tùy chọn khác
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
    aggregateQuery.push({
      $project: {
        slug_name: 0,
        slug_address: 0,
        slug_district: 0,
        slug_province: 0,
        '_business.password': 0,
        '_business.slug_name': 0,
        '_business.slug_address': 0,
        '_business.slug_district': 0,
        '_business.slug_province': 0,
        '_creator.password': 0,
        '_creator.slug_name': 0,
        '_creator.slug_address': 0,
        '_creator.slug_district': 0,
        '_creator.slug_province': 0,
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
    let [shippingCompanies, counts] = await Promise.all([
      client
        .db(req.user.database)
        .collection(`ShippingCompanies`)
        .aggregate(aggregateQuery)
        .toArray(),
      client
        .db(req.user.database)
        .collection(`ShippingCompanies`)
        .aggregate([...countQuery, { $count: 'counts' }])
        .toArray(),
    ])
    res.send({
      success: true,
      count: counts[0] ? counts[0].counts : 0,
      data: shippingCompanies,
    })
  } catch (err) {
    next(err)
  }
}

module.exports._create = async (req, res, next) => {
  try {
    let insert = await client
      .db(req.user.database)
      .collection(`ShippingCompanies`)
      .insertOne(req.body)
    if (!insert.insertedId) {
      throw new Error(`500: Tạo đối tác vận chuyển thất bại!`)
    }
    // try {
    //   let _action = {
    //     business_id: req.user.business_id,
    //     type: 'Tạo',
    //     properties: 'Đối tác vận chuyển',
    //     name: 'Tạo đối tác vận chuyển',
    //     data: req.body,
    //     performer_id: req.user.user_id,
    //     date: moment().tz(TIMEZONE).format(),
    //     slug_type: 'tao',
    //     slug_properties: 'doitacvanchuyen',
    //     name: 'taodoitacvanchuyen',
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
      .collection(`ShippingCompanies`)
      .updateOne(req.params, { $set: req.body })
    try {
      let _action = {
        business_id: req.user.business_id,
        type: 'Cập nhật',
        properties: 'Đối tác vận chuyển',
        name: 'Cập nhật đối tac vận chuyển',
        data: req.body,
        performer_id: req.user.user_id,
        date: moment().tz(TIMEZONE).format(),
        slug_type: 'capnhat',
        slug_properties: 'doitacvanchuyen',
        name: 'capnhatdoitacvanchuyen',
      }
      await client
        .db(req.user.database)
        .collection(`Actions`)
        .insertOne(_action)
    } catch (err) {}
    res.send({ success: true, data: req.body })
  } catch (err) {
    next(err)
  }
}

let uploadWSB = async (file) => {
  try {
    var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear()
    file.originalname = new String(file.originalname)
      .toLowerCase()
      .replace('/', '')

    file.originalname = removeUnicode(file.originalname)

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    var today = year + '/' + month + '/' + day + '/' + uuidv4()
    file.originalname = today + '_' + file.originalname

    const s3 = new S3({
      endpoint: wasabiEndpoint,
      region: 'ap-northeast-1',
      accessKeyId: process.env.access_key_wasabi,
      secretAccessKey: process.env.secret_key_wasabi,
    })

    file.originalname = new String(file.originalname).replace(
      /[&\/\\#,+()$~%'":*?<>{}]/g,
      '_'
    )

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
          }
          resolve(
            'https://s3.ap-northeast-1.wasabisys.com/admin-order/' +
              file.originalname
          )
        }
      )
    })
  } catch (err) {
    next(err)
  }
}

module.exports._importCompareCard = async (req, res, next) => {
  try {
    let excelData = XLSX.read(req.file.buffer, {
      type: 'buffer',
      cellDates: true,
    })
    let rows = XLSX.utils.sheet_to_json(
      excelData.Sheets[excelData.SheetNames[0]]
    )
    var _urlFile = await uploadWSB(req.file)

    var fields = [
      'ma_van_don_(*)',
      'ngay_nhan_don_(*)',
      'ngay_hoan_thanh_(*)',
      'khoi_luong',
      'tien_cod_(*)',
      'phi_bao_hiem',
      'phi_giao_hang_(*)',
      'phi_luu_kho',
    ]

    if (!req.body.shipping_company_id)
      throw new Error('400: Vui lòng truyền đơn vị vận chuyển')

    if (req.body.status != 'DRAFT' && req.body.status != 'COMPLETE')
      throw new Error('400: Trạng thái phiếu không hợp lệ')

    var card_confirm_shipping = {
      shipping_company_id: parseInt(req.body.shipping_company_id),
    }

    var appSetting = await client
      .db(req.user.database)
      .collection('AppSetting')
      .findOne({
        name: 'CardConfirmShipping',
      })

    if (appSetting == undefined) {
      appSetting = { value: 1 }
      await client.db(req.user.database).collection('AppSetting').insert({
        value: 1,
        name: 'CardConfirmShipping',
      })
    }

    card_confirm_shipping.card_id = parseInt(appSetting.value) + 1
    await client
      .db(DB)
      .collection('AppSetting')
      .updateOne(
        {
          name: 'CardConfirmShipping',
        },
        {
          $set: {
            value: card_confirm_shipping.card_id,
          },
        }
      )
    card_confirm_shipping.create_date = moment().tz(TIMEZONE).format()
    card_confirm_shipping.total_order = rows.length
    card_confirm_shipping.link_file = _urlFile
    card_confirm_shipping.employee_id = req.user.user_id
    await client
      .db(req.user.database)
      .collection('CardCompare')
      .insertOne(card_confirm_shipping)

    // valid date
    rows.map((item) => {
      Object.keys(item).map((i) => {
        item[`${convertToSlug(i)}`] = item[`${i}`]
        return item
      })
      var valid = validate(item, fields)
      if (!valid)
        throw new Error(
          '400: Tên cột không đúng quy định, vui lòng xem lại file excel'
        )

      //   if (date_min > moment(item['ngay_nhan_don']).tz(TIMEZONE).unix())
      //     date_min = moment(item['ngay_nhan_don']).tz(TIMEZONE).unix()
    })

    //  Lấy toàn bộ đơn của 60 ngày gần nhất
    var query = [
      {
        $match: {
          create_date: {
            $gte: moment(moment().tz(TIMEZONE).unix() * 1000)
              .subtract(60, 'days')
              .format(),
          },
        },
      },
      {
        $match: {
          is_delivery: true,
        },
      },
      {
        $project: {
          _id: 0,
          code: 1,
          final_cost: 1,
          shipping_info: 1,
        },
      },
    ]

    var orders = await client
      .db(req.user.database)
      .collection('Orders')
      .aggregate(query)
      .toArray()

    // Tien hanh doi soat

    for (var j = 0; j < rows.length; j++) {
      rows[j].card_id = card_confirm_shipping.card_id
      var is_find = false
      rows[j].tracking_number = rows[j]['ma_van_don_(*)']
      rows[j].date_receive_order = rows[j]['ngay_nhan_don_(*)']
      rows[j].date_complete_order = rows[j]['ngay_hoan_thanh_(*)']
      rows[j].cod = rows[j]['tien_cod_(*)']
      rows[j].fee_shipping = rows[j]['phi_giao_hang_(*)']
      rows[j].weight = rows[j].khoi_luong
      rows[j].fee_insurance = rows[j].phi_bao_hiem
      rows[j].fee_warehouse = rows[j].phi_luu_kho

      delete rows[j].ma_van_don
      delete rows[j].ngay_nhan_don
      delete rows[j].ngay_hoan_thanh
      delete rows[j].khoi_luong
      delete rows[j].phi_bao_hiem
      delete rows[j].phi_luu_kho
      delete rows[j].tien_cod
      for (var i = 0; i < orders.length; i++) {
        if (orders[i].tracking_number == rows[j].tracking_number) {
          is_find = true
          if (
            parseFloat(rows[j].cod).toFixed(0) !=
            parseFloat(orders[i].total_cod).toFixed(0)
          ) {
            rows[j].is_problem = true
            rows[j].status = 'Lỗi'
            rows[j].name_problem = 'Chênh Lệch Tiền Thu Hộ'
          }
        }
      }
      if (!is_find) {
        rows[j].is_problem = true
        rows[j].status = 'Lỗi'
        rows[j].name_problem = 'Không tìm thấy đơn trong hệ thống'
      } else {
        rows[j].is_problem = false
        rows[j].status = 'Hoàn tất'
        rows[j].name_problem = ''
      }

      rows[j].last_compare_card = moment()
        .tz(TIMEZONE)
        .format('yyyy/MM/DD HH:mm:ss')

      rows[j].is_status = 1
    }
    await client
      .db(req.user.database)
      .collection('CardCompareItem')
      .insertMany(rows)

    return res.send({ success: true, result: rows })
  } catch (err) {
    next(err)
  }
}

module.exports._createCompareCard = async (req, res, next) => {
  try {
    res.send({ success: true, data: req.body })
  } catch (err) {
    next(err)
  }
}

module.exports._getCompareCard = async (req, res, next) => {
  try {
    var aggregateQuery = []

    if (req.query.code) {
      aggregateQuery.push({
        $match: { code: new RegExp(req.query.code, 'ig') },
      })
    }

    if (req.query.shipping_company_id) {
      aggregateQuery.push({
        $match: { shipping_company_id: Number(req.query.shipping_company_id) },
      })
    }

    if (req.query.employee_id) {
      aggregateQuery.push({
        $match: { employee_id: Number(req.query.employee_id) },
      })
    }
    if (req.query.creator_id) {
      aggregateQuery.push({
        $match: { creator_id: Number(req.query.creator_id) },
      })
    }

    if (req.query.shipping_status) {
      aggregateQuery.push({
        $match: {
          bill_status: removeUnicode(
            String(req.query.shipping_status),
            true
          ).toUpperCase(),
        },
      })
    }

    aggregateQuery.push({
      $lookup: {
        from: 'CardCompareItem',
        localField: 'card_id',
        foreignField: 'card_id',
        as: 'list_order',
      },
    })

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

    if (req.query.status_card)
      aggregateQuery.push({ $match: { status_card: req.query.status_card } })

    aggregateQuery.push(
      {
        $lookup: {
          from: 'Branchs',
          localField: 'sale_location.branch_id',
          foreignField: 'branch_id',
          as: 'sale_location',
        },
      },
      { $unwind: { path: '$sale_location', preserveNullAndEmptyArrays: true } }
    )

    aggregateQuery.push(
      {
        $lookup: {
          from: 'Customers',
          localField: 'customer_id',
          foreignField: 'customer_id',
          as: 'customer',
        },
      },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } }
    )

    aggregateQuery.push(
      {
        $lookup: {
          from: 'ShippingCompanies',
          localField: 'shipping_company_id',
          foreignField: 'shipping_company_id',
          as: 'shipping_company',
        },
      },
      {
        $unwind: {
          path: '$shipping_company',
          preserveNullAndEmptyArrays: true,
        },
      }
    )

    aggregateQuery.push(
      {
        $lookup: {
          from: 'Users',
          localField: 'employee_id',
          foreignField: 'user_id',
          as: 'employee',
        },
      },
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } }
    )

    aggregateQuery.push({
      $project: {
        '_business.password': 0,
        '_business.slug_name': 0,
        '_business.slug_address': 0,
        '_business.slug_district': 0,
        '_business.slug_province': 0,
        '_creator.password': 0,
        '_creator.slug_name': 0,
        '_creator.slug_address': 0,
        '_creator.slug_district': 0,
        '_creator.slug_province': 0,
      },
    })

    let countQuery = [...aggregateQuery, { $count: 'counts' }]

    let page = Number(req.query.page) || 1
    let page_size = Number(req.query.page_size) || 50
    aggregateQuery.push(
      { $skip: (page - 1) * page_size },
      { $limit: page_size }
    )

    var cards = await client
      .db(req.user.database)
      .collection('CardCompare')
      .aggregate(aggregateQuery)
      .toArray()

    var count = await client
      .db(req.user.database)
      .collection('CardCompare')
      .aggregate(countQuery)
      .toArray()

    return res.send({
      success: true,
      count: count.length > 0 ? count[0].counts : 0,
      data: cards,
    })
  } catch (err) {
    next(err)
  }
}
