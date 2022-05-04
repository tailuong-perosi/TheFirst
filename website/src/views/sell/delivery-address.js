import React, { useEffect, useState } from 'react'

//antd
import { Form, Modal, Row, Input, Select, InputNumber, Spin } from 'antd'

//apis
import { getDistricts, getProvinces } from 'apis/address'

export default function DeliveryAddress({ editInvoice, address }) {
  const [form] = Form.useForm()

  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)

  const [districts, setDistricts] = useState([])
  const [districtsDefault, setDistrictsDefault] = useState([])
  const [provinces, setProvinces] = useState([])
  const [loadingDistrict, setLoadingDistrict] = useState(false)
  const [loadingProvince, setLoadingProvince] = useState(false)

  const [nameProvince, setNameProvince] = useState('')

  const _updateDeliveryAddress = async () => {
    await form.validateFields()

    const dataForm = form.getFieldsValue()
    editInvoice('deliveryAddress', { ...address, ...dataForm })
    toggle()
  }

  const _exit = () => {
    toggle()
    form.setFieldsValue({ ...address })
  }

  const _getProvinces = async () => {
    try {
      setLoadingProvince(true)
      const res = await getProvinces()
      if (res.status === 200) setProvinces(res.data.data)
      setLoadingProvince(false)
    } catch (error) {
      setLoadingProvince(false)
      console.log(error)
    }
  }

  const _getDistricts = async () => {
    try {
      setLoadingDistrict(true)
      const res = await getDistricts()
      if (res.status === 200) {
        setDistricts(res.data.data)
        setDistrictsDefault(res.data.data)
      }
      setLoadingDistrict(false)
    } catch (error) {
      setLoadingDistrict(false)
      console.log(error)
    }
  }

  useEffect(() => {
    if (nameProvince) {
      const districtsNew = districtsDefault.filter(
        (district) => district.province_name === nameProvince
      )
      setDistricts([...districtsNew])
    }
  }, [nameProvince])

  useEffect(() => {
    _getDistricts()
    _getProvinces()
  }, [])

  useEffect(() => {
    if (visible && address)
      form.setFieldsValue({ ...address, name: address.first_name + ' ' + address.last_name })
  }, [visible])

  return (
    <>
      <div
        style={{ color: '#1890ff', cursor: 'pointer', display: !address && 'none' }}
        onClick={toggle}
      >
        Thay đổi
      </div>
      <Modal
        onOk={_updateDeliveryAddress}
        width={600}
        okText="Cập nhật"
        cancelText="Thoát"
        title="Thay đổi địa chỉ giao hàng"
        visible={visible}
        onCancel={_exit}
      >
        <Form form={form} layout="vertical">
          <Row justify="space-between" wrap={false}>
            <Form.Item style={{ width: 250 }} name="first_name" label="Họ">
              <Input placeholder="Nhập họ khách hàng" />
            </Form.Item>

            <Form.Item
              style={{ width: 250 }}
              name="last_name"
              label="Tên khách hàng"
              rules={[{ message: ' Vui lòng nhập tên khách hàng', required: true }]}
            >
              <Input placeholder="Nhập tên khách hàng" />
            </Form.Item>
          </Row>

          <Row justify="space-between" wrap={false}>
            <Form.Item
              style={{ width: 250 }}
              name="address"
              label="Địa chỉ"
              rules={[{ message: ' Vui lòng nhập địa chỉ', required: true }]}
            >
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>

            <Form.Item
              style={{ width: 250 }}
              name="phone"
              label="Số điện thoại"
              rules={[{ message: ' Vui lòng nhập số điện thoại', required: true }]}
            >
              <Input style={{ width: '100%' }} placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Row>

          <Row justify="space-between" wrap={false}>
            <Form.Item
              style={{ width: 250 }}
              name="province"
              label="Tỉnh/thành phố"
              rules={[{ message: ' Vui lòng chọn tỉnh/thành phố', required: true }]}
            >
              <Select
                notFoundContent={loadingProvince ? <Spin /> : null}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                showSearch
                placeholder="Chọn tỉnh/thành phố"
                onChange={(value) => setNameProvince(value)}
              >
                {provinces.map((province, index) => (
                  <Select.Option key={index} value={province.province_name}>
                    {province.province_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              style={{ width: 250 }}
              name="district"
              label="Quận/huyện"
              rules={[{ message: ' Vui lòng chọn quận/huyện', required: true }]}
            >
              <Select
                notFoundContent={loadingDistrict ? <Spin /> : null}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                showSearch
                placeholder="Chọn quận/huyện"
              >
                {districts.map((district, index) => (
                  <Select.Option key={index} value={district.district_name}>
                    {district.district_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Row>
        </Form>
      </Modal>
    </>
  )
}
