const { ObjectId } = require('mongodb')
const { removeUnicode } = require('../utils/string-handle')
const { softValidate } = require('../utils/validate')
const moment = require('moment-timezone')
const timezone = 'Asia/Ho_Chi_Minh'

class Branch {
  create(data) {
    this.branch_id = data.branch_id
    this.code = String(branch_id).padStart(6, '0')
    this.name = data.name
    this.logo = data.logo || ''
    this.phone = data.phone || ''
    this.email = data.email || ''
    this.fax = data.fax || ''
    this.website = data.website || ''
    this.latitude = data.latitude || ''
    this.longitude = data.longitude || ''
    this.type = data.type
    this.address = data.address || ''
    this.ward = data.ward || ''
    this.district = data.district || ''
    this.province = data.province || ''
    this.create_date = moment().tz(TIMEZONE).format()
    this.creator_id = req.user.user_id
    this.last_update = moment().tz(TIMEZONE).format()
    this.updater_id = req.user.user_id
    this.active = true
    this.slug_name = removeUnicode(String(data.name), true).toLowerCase()
    this.slug_type = removeUnicode(
      String(data.type || 'Cửa hàng'),
      true
    ).toLowerCase()
    this.slug_address = removeUnicode(String(data.address), true).toLowerCase()
    this.slug_ward = removeUnicode(String(data.ward), true).toLowerCase()
    this.slug_district = removeUnicode(
      String(data.district),
      true
    ).toLowerCase()
    this.slug_province = removeUnicode(
      String(data.province),
      true
    ).toLowerCase()
  }
  update(data) {
    data.last_update = moment().tz(timezone).format()
    delete data._id
    delete data.branch_id
    delete data.creator_id
    delete data.create_date
    data = { ...this, ...data }
    return this.create(data)
  }
}

module.exports = { Branch }
