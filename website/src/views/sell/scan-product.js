import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { formatCash } from 'utils'

//antd
import { Modal, Row, Button, Col, notification, Input, Form, message, InputNumber } from 'antd'

//icons
import { CloseOutlined } from '@ant-design/icons'

//apis
import { getProducts } from 'apis/product'
import { ACTION, IMAGE_DEFAULT } from 'consts'
import delay from 'delay'

export default function ScanProduct({ addProductToCartInvoice, productsCurrent }) {
  const branchIdApp = useSelector((state) => state.branch.branchId)
  const dispatch = useDispatch()
  const inputRef = useRef()
  const scanRef = useRef()
  const quantityRef = useRef()
  const [form] = Form.useForm()

  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)

  const reScan = () => {
    form.resetFields()
    inputRef.current.focus()
  }

  const _addToCart = async () => {
    addProductToCartInvoice({ ...product, quantity })
    await delay(200)
    toggle()
    reScan()
  }

  const _getProduct = async (dataForm) => {
    try {
      if (!dataForm.variant_code) _addToCart()
      dispatch({ type: ACTION.LOADING, data: true })
      const res = await getProducts({
        branch_id: branchIdApp || '',
        merge: true,
        detach: true,
        ...dataForm,
      })
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          if (res.data.data && res.data.data.length) {
            //check sp đã có trong giỏ hàng
            const product = productsCurrent.find((p) => p._id === res.data.data[0].variants._id)
            if (product)
              notification.warning({ message: 'Bạn đang có sản phẩm này trong giỏ hàng' })
            setProduct(res.data.data[0].variants)
            setVisible(true)
          }
        } else notification.error({ message: 'Không tìm thấy sản phẩm này' })
      } else notification.error({ message: 'Không tìm thấy sản phẩm này' })
      dispatch({ type: ACTION.LOADING, data: false })
      reScan()
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
      console.log(error)
      reScan()
    }
  }
  useEffect(() => {
    if (!visible) reScan()
    else {
      setQuantity(1)
      setTimeout(() => quantityRef.current.focus(), 100)
    }
  }, [visible])

  return (
    <>
      <img
        onClick={() => {
          reScan()
          message.success('Bắt đầu quét sản phẩm')
        }}
        src="https://s3.ap-northeast-1.wasabisys.com/ecom-fulfill/2021/10/16/b2c0b183-9330-4582-8ff0-9050b411532c/barcode 3.png"
        alt=""
        style={{ width: 30, height: 30, marginLeft: 17, cursor: 'pointer' }}
      />
      <Form form={form} onFinish={_getProduct} style={{ width: 0, height: 0, opacity: 0 }}>
        <Form.Item name="variant_code">
          <Input autoFocus ref={inputRef} style={{ width: 0, height: 0, padding: 0 }} />
        </Form.Item>
      </Form>

      <Modal
        closeIcon={
          <Row wrap={false} align="middle">
            <div style={{ fontSize: 13, marginRight: 3 }}>(ESC)</div> <CloseOutlined />
          </Row>
        }
        width="60%"
        footer={
          <Row justify="center">
            <Button type="primary" onClick={_addToCart}>
              Cho vào giỏ hàng (Enter)
            </Button>
          </Row>
        }
        onCancel={() => {
          toggle()
          reScan()
        }}
        visible={visible}
        title="Nhập số lượng sản phẩm"
      >
        <div>
          <Row gutter={[20]}>
            <Col xs={24} sm={24} md={24} lg={9} xl={9}>
              <div>
                <div
                  style={{
                    width: 200,
                    height: 200,
                    border: '1px solid #d2cece',
                    borderRadius: 7,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    alt=""
                    src={(product && product.image.length && product.image[0]) || IMAGE_DEFAULT}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <p style={{ fontWeight: 600, fontSize: 16.5, width: 200, marginTop: 5 }}>
                  {product && product.title}
                </p>
              </div>
            </Col>
            <Col xs={24} sm={24} md={24} lg={15} xl={15}>
              <div style={{ fontSize: 16 }}>
                <p>
                  <b>Cửa hàng: </b>{' '}
                  {product &&
                    product.locations &&
                    product.locations.map((location) => location.name).join(', ')}
                </p>
                <p>
                  <b>Số lượng tồn: </b> {product && formatCash(product.total_quantity || 0)}
                </p>
                <p>
                  <b>Số lượng nhập: </b>{' '}
                  <InputNumber
                    onPressEnter={_addToCart}
                    min={1}
                    ref={quantityRef}
                    style={{ width: 250 }}
                    value={quantity}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    onChange={setQuantity}
                  />
                </p>
              </div>
            </Col>
          </Row>
          <Row justify="end">
            <a
              onClick={() => {
                scanRef.current.focus()
                message.success('Bắt đầu quét sản phẩm')
              }}
            >
              Nhấn vào đây quét sản phẩm khác
            </a>
          </Row>
          <Form form={form} onFinish={_getProduct} style={{ width: 0, height: 0, opacity: 0 }}>
            <Form.Item name="variant_code">
              <Input autoFocus ref={scanRef} style={{ width: 0, height: 0, padding: 0 }} />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  )
}
