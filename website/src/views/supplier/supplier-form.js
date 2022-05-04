import React, { useEffect, useState } from 'react'

//antd
import { Form, Drawer, Row, Col, Button, Input, Select, notification, Checkbox } from 'antd'

//apis
import { getDistricts, getProvinces } from 'apis/address'
import { addSupplier, updateSupplier } from 'apis/supplier'

const { Option } = Select
export default function SupplierForm({ children, reloadData, record }) {
  const [form] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const toggle = () => {
    setVisible(!visible)
    setDistrictsMain([])
  }

  const [districtsDefault, setDistrictsDefault] = useState([])
  const [districtsMain, setDistrictsMain] = useState([])
  const [provinces, setProvinces] = useState([])

  const _addOrEditSupplier = async () => {
    try {
      await form.validateFields()
      const dataForm = form.getFieldsValue()

      setLoading(true)
      const body = { ...dataForm }

      let res
      if (record) res = await updateSupplier(body, record.supplier_id)
      else res = await addSupplier(body)
      console.log(res)

      if (res.status === 200) {
        if (res.data.success) {
          toggle()
          reloadData()
          notification.success({
            message: `${record ? 'Cập nhật' : 'Thêm'} nhà cung cấp thành công`,
          })
        } else
          notification.error({
            message:
              res.data.message ||
              `${record ? 'Cập nhật' : 'Thêm'} nhà cung cấp thất bại, vui lòng thử lại`,
          })
      } else
        notification.error({
          message:
            res.data.message ||
            `${record ? 'Cập nhật' : 'Thêm'} nhà cung cấp thất bại, vui lòng thử lại`,
        })
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const _getDistricts = async (value) => {
    try {
      const res = await getDistricts({ search: value })
      if (res.status === 200) {
        setDistrictsDefault(res.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const _getProvinces = async () => {
    try {
      const res = await getProvinces()
      if (res.status === 200) setProvinces(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    _getProvinces()
    _getDistricts()
  }, [])

  useEffect(() => {
    if (visible) {
      if (!record) form.resetFields()
      else form.setFieldsValue({ ...record })
    }
  }, [visible])

  return (
    <>
      <div onClick={toggle}>{children}</div>
      <Drawer
        width="70%"
        footer={
          <Row justify="end">
            <Button
              onClick={_addOrEditSupplier}
              loading={loading}
              size="large"
              type="primary"
              style={{ width: 120 }}
            >
              {record ? 'Cập nhật' : 'Thêm'}
            </Button>
          </Row>
        }
        title={`${record ? 'Cập nhật' : 'Thêm'} nhà cung cấp`}
        placement="right"
        onClose={toggle}
        visible={visible}
      >
        <Form form={form} layout="vertical">
          <Row justify="space-between" align="middle">
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                label={<div style={{ color: 'black', fontWeight: '600' }}>Tên nhà cung cấp</div>}
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp!' }]}
              >
                <Input size="large" placeholder="Nhập tên nhà cung cấp" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                label={<div style={{ color: 'black', fontWeight: '600' }}>Địa chỉ</div>}
                name="address"
              >
                <Input placeholder="Nhập địa chỉ" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="space-between" align="middle">
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                name="province"
                label={<div style={{ color: 'black', fontWeight: '600' }}>Tỉnh/thành phố</div>}
              >
                <Select
                  size="large"
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn tỉnh/thành phố"
                  onChange={(value) => {
                    if (value) {
                      const districtsNew = districtsDefault.filter((e) => e.province_name === value)
                      setDistrictsMain([...districtsNew])
                    }
                  }}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {provinces.map((province, index) => {
                    return (
                      <Option value={province.province_name} key={index}>
                        {province.province_name}
                      </Option>
                    )
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                name="district"
                label={<div style={{ color: 'black', fontWeight: '600' }}>Quận/huyện</div>}
              >
                <Select
                  allowClear
                  size="large"
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn quận/huyện"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {
                    districtsMain && districtsMain.length ?
                      districtsMain.map((district, index) => {
                        return (
                          <Option value={district.district_name} key={index}>
                            {district.district_name}
                          </Option>
                        )
                      })
                      :
                      districtsDefault.map((district, index) => {
                        return (
                          <Option value={district.district_name} key={index}>
                            {district.district_name}
                          </Option>
                        )
                      })
                  }
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row justify="space-between" align="middle">
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                label={<div style={{ color: 'black', fontWeight: '600' }}>Liên hệ</div>}
                name="phone"
              >
                <Input placeholder="Nhập liên hệ" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                label={<div style={{ color: 'black', fontWeight: '600' }}>Email</div>}
                name="email"
              >
                <Input placeholder="Nhập email" size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  )
}
