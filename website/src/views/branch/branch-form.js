import React, { useState, useEffect } from 'react'
import { ACTION, regexPhone } from 'consts/index'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { Input, Button, Row, Col, notification, Select, Form, Upload, Drawer } from 'antd'

//icons
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons'

//apis
import { getProvinces, getDistricts } from 'apis/address'
import { addBranch, updateBranch } from 'apis/branch'
import { uploadFile } from 'apis/upload'

const { Option } = Select
export default function BranchAdd({ reloadData, children, record }) {
  const dispatch = useDispatch()
  const location = useLocation()
  const [form] = Form.useForm()
  const branchIdApp = useSelector((state) => state.branch.branchId)

  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  const [provinces, setProvinces] = useState([])
  const [districtMain, setDistrictMain] = useState([])
  const [districtsDefault, setDistrictsDefault] = useState([])
  const [image, setImage] = useState('')

  const _uploadImage = async (file) => {
    try {
      setLoading(true)
      const url = await uploadFile(file)
      setImage(url || '')
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const _addOrEditBranch = async () => {
    try {
      await form.validateFields()

      const dataForm = form.getFieldsValue()

      if (dataForm.phone && !regexPhone.test(dataForm.phone)) {
        notification.warning({ message: 'Số điện thoại liên hệ không hợp lệ' })
        return
      }

      dispatch({ type: ACTION.LOADING, data: true })

      const body = {
        ...dataForm,
        logo: image || '',
        address: dataForm.address || '',
        latitude: '',
        longtitude: '',
        website: '',
        fax: '',
        email: '',
        accumulate_point: false,
        use_point: false,
      }

      let res
      if (record) res = await updateBranch(body, record.branch_id)
      else res = await addBranch(body)
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          reloadData()
          notification.success({ message: `${record ? 'Cập nhật' : 'Thêm'} chi nhánh thành công` })
          setVisible(false)
          dispatch({ type: 'TRIGGER_RELOAD_BRANCH' })
        } else
          notification.error({
            message:
              res.data.message ||
              `${record ? 'Cập nhật' : 'Thêm'} chi nhánh thất bại, vui lòng thử lại!`,
          })
      } else
        notification.error({
          message:
            res.data.message ||
            `${record ? 'Cập nhật' : 'Thêm'} chi nhánh thất bại, vui lòng thử lại!`,
        })
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
      console.log(error)
    }
  }

  const _getProvinces = async () => {
    try {
      const res = await getProvinces()
      if (res.status === 200) setProvinces(res.data.data)

      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  const _getDistricts = async () => {
    try {
      const res = await getDistricts()
      if (res.status === 200) {
        setDistrictMain(res.data.data)
        setDistrictsDefault(res.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    _getProvinces()
    _getDistricts()

    if (location.state && location.state === 'show-modal-create-branch') setVisible(true)
  }, [])

  useEffect(() => {
    if (visible) {
      if (!record) {
        form.resetFields()
        setImage('')
      } else {
        form.setFieldsValue({ ...record })
        setImage(record.logo || '')
      }
    }
  }, [visible])

  return (
    <>
      <div onClick={() => setVisible(true)}>{children}</div>
      <Drawer
        footer={
          <Row justify="end">
            <Button
              loading={loading}
              onClick={_addOrEditBranch}
              size="large"
              type="primary"
              style={{ minWidth: 120 }}
            >
              {record ? 'Cập nhật' : 'Thêm'}
            </Button>
          </Row>
        }
        title={record ? 'Cập nhật chi nhánh' : 'Thêm chi nhánh'}
        centered
        width="70%"
        visible={visible}
        onClose={() => setVisible(false)}
      >
        Hình ảnh
        <Upload
          className="upload-shipping"
          name="avatar"
          listType="picture-card"
          showUploadList={false}
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          data={_uploadImage}
        >
          {image ? (
            <img src={image} alt="avatar" style={{ width: '100%' }} />
          ) : (
            <div>
              {loading ? <LoadingOutlined /> : <PlusOutlined />}
              <div style={{ marginTop: 8 }}>Tải lên</div>
            </div>
          )}
        </Upload>
        <Form form={form} layout="vertical">
          <Row justify="space-between" align="middle">
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                label={<div style={{ color: 'black', fontWeight: '600' }}>Tên chi nhánh</div>}
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên chi nhánh' }]}
              >
                <Input size="large" placeholder="Nhập tên chi nhánh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                name="address"
                label={<div style={{ color: 'black', fontWeight: '600' }}>Địa chỉ</div>}
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
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
                  onChange={(value) => {
                    if (value) {
                      const districtsNew = districtsDefault.filter((e) => e.province_name === value)
                      setDistrictMain([...districtsNew])
                    } else setDistrictMain([...districtsDefault])
                  }}
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn tỉnh/thành phố"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {provinces.map((values, index) => {
                    return (
                      <Option value={values.province_name} key={index}>
                        {values.province_name}
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
                  size="large"
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Chọn quận huyện"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {districtMain.map((values, index) => {
                    return (
                      <Option value={values.district_name} key={index}>
                        {values.district_name}
                      </Option>
                    )
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row justify="space-between" align="middle">
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                rules={[{ message: 'Vui lòng chọn loại chi nhánh', required: true }]}
                name="type"
                label={<div style={{ color: 'black', fontWeight: '600' }}>Loại chi nhánh</div>}
              >
                <Select
                  size="large"
                  showSearch
                  placeholder="Chọn loại chi nhánh"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  <Option value="Warehouse">Kho</Option>
                  <Option value="Store">Cửa hàng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                label={<div style={{ color: 'black', fontWeight: '600' }}>Liên hệ</div>}
                name="phone"
              >
                <Input placeholder="Nhập liên hệ" size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  )
}
