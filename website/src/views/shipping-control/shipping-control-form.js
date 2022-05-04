import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useHistory, useLocation } from 'react-router-dom'

//andtd
import {
  Drawer,
  Row,
  Col,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  notification,
  Space,
} from 'antd'

//apis
import { getShippings } from 'apis/shipping'

//components
import TitlePage from 'components/title-page'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { ROUTES } from 'consts'

export default function ShippingControlForm() {
  const location = useLocation()
  const history = useHistory()
  const [form] = Form.useForm()

  const [shippings, setShippings] = useState([])

  const onFinish = async () => {}

  const getTransport = async () => {
    try {
      const res = await getShippings()
      console.log(res)
      if (res.status === 200) {
        setShippings(res.data.data)
        res.data.data.map((shipping) => {
          if (shipping.default)
            form.setFieldsValue({ shipping_company_id: shipping.shipping_company_id })
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getTransport()
  }, [])

  return (
    <div className="card">
      <TitlePage
        isAffix={true}
        title={
          <Row
            wrap={false}
            align="middle"
            style={{ cursor: 'pointer' }}
            onClick={() => history.push(ROUTES.SHIPPING_CONTROL)}
          >
            <ArrowLeftOutlined style={{ marginRight: 8 }} />
            {location.state ? 'Cập nhật' : 'Tạo'} phiếu đối soát vận chuyển
          </Row>
        }
      >
        <Space>
          <Button size="large" type="primary">
            Lưu nháp
          </Button>
          <Button size="large" type="primary">
            Đối soát file
          </Button>
        </Space>
      </TitlePage>
      <div style={{ marginTop: 25 }}>
        <Form form={form} onFinish={onFinish}>
          <Row justify="space-between">
            <Col span={11}>
              <Row>
                <Col span={8}>Đơn vị vận chuyển</Col>
                <Col span={16}>
                  <Form.Item name="shipping_company_id">
                    <Select placeholder="Chọn đơn vị vận chuyển">
                      {shippings.map((shipping, index) => (
                        <Select.Option key={index} value={shipping.shipping_company_id}>
                          {shipping.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={11}>
              <Row>
                <Col span={8}>Mã vận đơn</Col>
                <Col span={16}>
                  <Form.Item name="shipping_code">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={11}>
              <Row>
                <Col span={8}>Mã đơn hàng</Col>
                <Col span={16}>
                  <Form.Item name="order_id">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={11}>
              <Row>
                <Col span={8}>Phí vận chuyển</Col>
                <Col span={16}>
                  <Form.Item name="transfer_cost">
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={11}>
              <Row>
                <Col span={8}>Tiền COD</Col>
                <Col span={16}>
                  <Form.Item name="real_cod_cost">
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={11}>
              <Row>
                <Col span={8}>Tiền chuyển khoản</Col>
                <Col span={16}>
                  <Form.Item name="card_cost">
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={11}>
              <Row>
                <Col span={8}>Ngày nhận đơn</Col>
                <Col span={16}>
                  <Form.Item name="revice_date">
                    <DatePicker placeholder="Chọn ngày nhận đơn" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={11}>
              <Row>
                <Col span={8}>Trạng thái vận chuyển</Col>
                <Col span={16}>
                  <Form.Item name="status" initialValue="PROCESSING">
                    <Select>
                      <Select.Option value="PROCESSING">Processing</Select.Option>
                      <Select.Option value="REFUN">Refun</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={11}>
              <Row>
                <Col span={8}>Ngày hoàn thành</Col>
                <Col span={16}>
                  <Form.Item name="complete_date">
                    <DatePicker placeholder="Chọn ngày hoàn thành" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={11}>
              <Row>
                <Col span={8}>Phí bảo hiểm</Col>
                <Col span={16}>
                  <Form.Item name="insurance_cost">
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={11}>
              <Row>
                <Col span={8}>Khối lượng (kg)</Col>
                <Col span={16}>
                  <Form.Item name="weight">
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={11}>
              <Row>
                <Col span={8}>Phí lưu kho</Col>
                <Col span={16}>
                  <Form.Item name="warehouse_cost">
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  )
}
