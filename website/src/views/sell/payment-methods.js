import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

//antd
import { Modal, Row, Button, InputNumber, Space, Popconfirm, Input, Select } from 'antd'

//icons
import { DeleteOutlined } from '@ant-design/icons'

import { formatCash } from 'utils'

//apis
import { getPayments } from 'apis/payment'
import { ROUTES } from 'consts'

export default function PaymentMethods({
  editInvoice,
  invoices,
  indexInvoice,
  moneyToBePaidByCustomer,
  setVisible,
  visible,
}) {
  const toggle = () => setVisible(!visible)

  const [paymentsMethod, setPaymentsMethod] = useState([])
  const [payments, setPayments] = useState([])
  const [paymentMethodDefault, setPaymentMethodDefault] = useState({}) //hình thức thanh toán mặc định

  const [costPaid, setCostPaid] = useState(0)
  const [excessCash, setExcessCash] = useState(0)

  const inputValue = (value, index) => {
    let paymentsNew = [...payments]
    paymentsNew[index].value = +value
    const sumCostPaid = paymentsNew.reduce((total, current) => total + current.value, 0)
    const excessCash = sumCostPaid - moneyToBePaidByCustomer

    setExcessCash(excessCash >= 0 ? excessCash : 0)
    setCostPaid(sumCostPaid)
    setPayments([...paymentsNew])
  }

  const _addPaymentMethod = (pMethod) => {
    setPayments([
      ...pMethod.map((payment) => {
        const findPaymentMethod = payments.find((e) => e.method === payment)
        if (findPaymentMethod) return { ...findPaymentMethod }
        else return { method: payment, value: 0 }
      }),
    ])
  }

  const _removePaymentMethod = (index) => {
    let paymentsNew = [...payments]
    paymentsNew.splice(index, 1)

    const sumCostPaid = paymentsNew.reduce((total, current) => total + current.value, 0)
    const excessCash = sumCostPaid - moneyToBePaidByCustomer

    setExcessCash(excessCash >= 0 ? excessCash : 0)
    setCostPaid(sumCostPaid)
    setPayments([...paymentsNew])
  }

  const _savePayments = () => {
    editInvoice('payments', payments)
    if (invoices[indexInvoice].isDelivery) editInvoice('prepay', costPaid)
    else editInvoice('moneyGivenByCustomer', costPaid)
    toggle()
  }

  const _exit = () => {
    toggle()
    setPayments(invoices[indexInvoice].payments && invoices[indexInvoice].payments)
  }

  const _getPayments = async () => {
    try {
      const res = await getPayments()
      if (res.status === 200) {
        let paymentMethodDefault = ''

        setPaymentsMethod(
          res.data.data
            .filter((e) => e.active)
            .map((e) => {
              if (e.default) paymentMethodDefault = e.name
              return e.name
            })
        )
        if (paymentMethodDefault)
          setPaymentMethodDefault({ method: paymentMethodDefault, value: 0 })
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    _getPayments()
  }, [])

  useEffect(() => {
    if (visible) {
      if (!invoices[indexInvoice].payments.length) setPayments([paymentMethodDefault])
      else setPayments([...invoices[indexInvoice].payments])

      if (invoices[indexInvoice].isDelivery) setCostPaid(invoices[indexInvoice].prepay)
      else setCostPaid(invoices[indexInvoice].moneyGivenByCustomer)

      setExcessCash(excessCash)
    }
  }, [visible])

  return (
    <>
      <p onClick={_exit} style={{ marginBottom: 0, color: '#1890ff', cursor: 'pointer' }}>
        Chọn hình thức thanh toán (F8)
      </p>
      <Modal
        width={540}
        footer={
          <Row justify="end">
            <Button style={{ width: 100, borderRadius: 5 }} onClick={_exit}>
              Đóng
            </Button>
            <Button
              onClick={_savePayments}
              style={{
                width: 100,
                backgroundColor: '#3579FE',
                borderColor: '#3579FE',
                borderRadius: 5,
                color: 'white',
              }}
            >
              Lưu
            </Button>
          </Row>
        }
        title="Phương thức thanh toán"
        onCancel={toggle}
        visible={visible}
      >
        <p style={{ fontSize: 14, marginBottom: 10, fontWeight: 600 }}>
          Có thể chọn nhiều phương thức thanh toán
        </p>
        <Space direction="vertical" size="middle" style={{ width: '100%', fontSize: 18 }}>
          <Row justify="space-between" style={{ fontWeight: 600 }}>
            <p>Khách phải trả</p>
            <p>{formatCash(moneyToBePaidByCustomer)}</p>
          </Row>

          <Row wrap={false} justify="space-between" align="middle">
            <Select
              value={payments.map((e) => e.method)}
              placeholder="Chọn hình thức thanh toán"
              style={{ width: '100%' }}
              mode="multiple"
              allowClear
              onChange={_addPaymentMethod}
            >
              {paymentsMethod.map((paymentMethod, index) => (
                <Select.Option value={paymentMethod} key={index}>
                  {paymentMethod}
                </Select.Option>
              ))}
            </Select>
          </Row>
          <Space direction="vertical" style={{ width: '100%' }}>
            {payments.map((payment, index) => {
              const SelectPayments = () => (
                <Input
                  value={payment.method}
                  style={{ width: 150, pointerEvents: 'none' }}
                  bordered={false}
                  placeholder="Chọn phương thức thanh toán"
                />
              )

              const InputValue = () => (
                <InputNumber
                  onBlur={(e) => {
                    const value = e.target.value.replaceAll(',', '')
                    inputValue(value, index)
                  }}
                  defaultValue={payment.value}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  style={{ width: 230, position: 'relative' }}
                  min={0}
                  placeholder="Tiền khách trả"
                  bordered={false}
                />
              )

              return (
                <Row justify="space-between" align="middle" wrap={false}>
                  <div style={{ borderBottom: '0.75px solid #C9C8C8' }}>
                    <SelectPayments />
                  </div>
                  <Row wrap={false} align="middle">
                    <div style={{ borderBottom: '0.75px solid #C9C8C8' }}>
                      <InputValue />
                    </div>
                    <Popconfirm
                      onConfirm={() => _removePaymentMethod(index)}
                      okText="Đồng ý"
                      cancelText="Từ chối"
                      title="Bạn có muốn xoá phương thức thanh toán này ?"
                    >
                      <DeleteOutlined
                        style={{ fontSize: 15, color: 'red', cursor: 'pointer', marginLeft: 10 }}
                      />
                    </Popconfirm>
                  </Row>
                </Row>
              )
            })}
          </Space>
          <Row justify="space-between" style={{ fontWeight: 600 }}>
            <p>Tổng tiền khách trả</p>
            <p>{formatCash(costPaid)}</p>
          </Row>
          <Row justify="space-between" style={{ fontWeight: 600 }}>
            <p>Tiền thừa</p>
            <p>{formatCash(excessCash)}</p>
          </Row>
          <Link to={ROUTES.PAYMENT} target="_blank" style={{ fontSize: 14 }}>
            Cài đặt phướng thức thanh toán mặc định ở Cấu hình
          </Link>
        </Space>
      </Modal>
    </>
  )
}
