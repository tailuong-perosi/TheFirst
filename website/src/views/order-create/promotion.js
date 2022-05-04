import React, { useState, useEffect } from 'react'

import { Modal, Row, Col, Button, Checkbox, Space, Input, notification } from 'antd'

import gift from 'assets/icons/gift.png'
import { formatCash } from 'utils'
//apis
import { getPromotions, checkVoucher } from 'apis/promotion'

export default function PromotionAvailable({ order, editOrder }) {
  const [loading, setLoading] = useState(false)
  const [voucherCheck, setVoucherCheck] = useState('')

  const [promotions, setPromotions] = useState([])
  const [promotionCheck, setPromotionCheck] = useState(null)
  const [promotionFind, setPromotionFind] = useState(null)

  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)

  const PromotionItem = ({ promotion }) => (
    <Row>
      <Col xs={8} sm={8}>
        <Checkbox
          checked={promotionCheck && promotionCheck._id === promotion._id ? true : false}
          onClick={(e) => {
            const checked = e.target.checked
            if (checked) {
              if (order.moneyToBePaidByCustomer >= promotion.max_discount) {
                if (order.order_details.length !== 0) setPromotionCheck(promotion)
                else
                  notification.warning({
                    message: 'Đơn hàng của bạn chưa có sản phẩm, vui lòng chọn sản phẩm trước',
                  })
              } else
                notification.warning({
                  message:
                    'Giá trị đơn hàng của bạn đủ chưa đủ điều kiện để áp dụng chương trình khuyến mãi này !',
                })
            } else setPromotionCheck(null)
          }}
        >
          {promotion.name}
        </Checkbox>
      </Col>
      <Col xs={8} sm={8}>
        <p style={{ textAlign: 'center' }}>
          {formatCash(promotion.value)} {promotion.type === 'VALUE' ? '' : '%'}
        </p>
      </Col>
      <Col xs={8} sm={8}>
        <p style={{ textAlign: 'center' }}>{formatCash(promotion.max_discount)}</p>
      </Col>
    </Row>
  )

  const _getPromotions = async () => {
    try {
      const res = await getPromotions()
      console.log(res)
      if (res.status === 200) setPromotions(res.data.data.filter((e) => !e.has_voucher))
    } catch (error) {
      console.log(error)
    }
  }

  const _applyVoucher = () => {
    editOrder('discount', promotionCheck)
    toggle()
  }

  const _checkVoucher = async () => {
    try {
      setLoading(true)
      const res = await checkVoucher(voucherCheck)
      if (res.status === 200) {
        if (res.data.data) setPromotionFind(res.data.data)
        else
          notification.warning({
            message: res.data.message || 'Kiểm tra voucher thất bại, vui lòng thử lại!',
          })
      } else
        notification.warning({
          message: res.data.message || 'Kiểm tra voucher thất bại, vui lòng thử lại!',
        })

      setLoading(false)
    } catch (error) {
      setLoading(false)

      console.log(error)
    }
  }
  useEffect(() => {
    _getPromotions()
  }, [])

  useEffect(() => {
    if (visible) {
      console.log(order)
      if (order.discount) {
        if (order.moneyToBePaidByCustomer >= order.discount.max_discount)
          setPromotionCheck(order.discount)
        else {
          setPromotionCheck(null)
          editOrder('discount', null)
        }
      } else setPromotionCheck(null)

      setVoucherCheck('')
    }
  }, [visible])

  return (
    <>
      {promotions && promotions.length !== 0 ? (
        <Row wrap={false} align="middle" onClick={toggle}>
          <img
            src={gift}
            alt=""
            style={{ width: 16, height: 16, marginLeft: 8, cursor: 'pointer', marginRight: 6 }}
          />
          <a>Áp dụng khuyến mãi</a>
        </Row>
      ) : (
        ''
      )}

      <Modal
        width={700}
        visible={visible}
        title="Khuyến mãi khả dụng"
        onCancel={toggle}
        footer={
          <Row justify="end">
            <Button
              onClick={_applyVoucher}
              type="primary"
              style={{
                backgroundColor: '#0877DE',
                borderRadius: 5,
                borderColor: '#0877DE',
              }}
            >
              Áp dụng
            </Button>
          </Row>
        }
      >
        <Row>
          <Col xs={8} sm={8}>
            <h3 style={{ textAlign: 'center' }}>Chương trình khuyến mãi</h3>
          </Col>
          <Col xs={8} sm={8}>
            <h3 style={{ textAlign: 'center' }}>Giá trị</h3>
          </Col>
          <Col xs={8} sm={8}>
            <h3 style={{ textAlign: 'center' }}>Hạn mức áp dụng</h3>
          </Col>
        </Row>
        {promotions.map((promotion) => (
          <PromotionItem promotion={promotion} />
        ))}
        <div style={{ marginTop: 15 }}>
          <h3 style={{ marginBottom: 0, fontSize: 17 }}>Tìm kiếm mã khuyên mãi</h3>
          <Space wrap={false}>
            <Input
              value={voucherCheck}
              onChange={(e) => setVoucherCheck(e.target.value)}
              placeholder="Nhập mã khuyên mãi"
              style={{ width: 300 }}
            />
            <Button
              onClick={_checkVoucher}
              loading={loading}
              type="primary"
              style={{
                backgroundColor: '#0877DE',
                borderRadius: 5,
                borderColor: '#0877DE',
              }}
            >
              Kiểm tra
            </Button>
          </Space>
          {promotionFind && (
            <div style={{ marginTop: 20 }}>
              <PromotionItem promotion={promotionFind} />
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
