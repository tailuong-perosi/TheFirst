const moment = require(`moment-timezone`)
const TIMEZONE = process.env.TIMEZONE
const client = require(`../config/mongodb`)
const SDB = process.env.DATABASE

module.exports._getEnumUnitProduct = async (req, res, next) => {
  try {
    let enums = await client
      .db(SDB)
      .collection('EnumUnitProduct')
      .find({})
      .toArray()
    res.send({ success: true, data: enums })
  } catch (err) {
    next(err)
  }
}

module.exports._getEnumPlatform = async (req, res, next) => {
  try {
    let enums = await client
      .db(SDB)
      .collection('Enums')
      .find({ type: 'PLATFORM' })
      .toArray()
    res.send({ success: true, data: enums })
  } catch (err) {
    next(err)
  }
}

module.exports._getEnumOrderStatus = async (req, res, next) => {
  try {
    let enums = await client
      .db(SDB)
      .collection('Enums')
      .find({ type: 'ORDER' })
      .toArray()
    res.send({ success: true, data: enums })
  } catch (err) {
    next(err)
  }
}

module.exports._getEnumPaymentStatus = async (req, res, next) => {
  try {
    let enums = await client
      .db(SDB)
      .collection('Enums')
      .find({ type: 'PAYMENT' })
      .toArray()
    res.send({ success: true, data: enums })
  } catch (err) {
    next(err)
  }
}

module.exports._getEnumShippingStatus = async (req, res, next) => {
  try {
    let enums = await client
      .db(SDB)
      .collection('Enums')
      .find({ type: 'SHIPPING' })
      .toArray()
    res.send({ success: true, data: enums })
  } catch (err) {
    next(err)
  }
}

module.exports._getEnumImportOrderStatus = async (req, res, next) => {
  try {
    let enums = await client
      .db(SDB)
      .collection('Enums')
      .find({ type: 'IMPORT_ORDER' })
      .toArray()
    res.send({ success: true, data: enums })
  } catch (err) {
    next(err)
  }
}

module.exports._getEnumTransportOrderStatus = async (req, res, next) => {
  try {
    let enums = await client
      .db(SDB)
      .collection('Enums')
      .find({ type: 'TRANSPORT_ORDER' })
      .toArray()
    res.send({ success: true, data: enums })
  } catch (err) {
    next(err)
  }
}
