import React, { useEffect, useState } from 'react'

//antd
import { Button, Modal, Row, Form, Input, Select, Divider, Upload, notification } from 'antd'

import { useSelector, useDispatch } from 'react-redux'
import { ACTION, regexPhone } from 'consts'

//apis
import { getProvinces, getDistricts } from 'apis/address'
import { addStore } from 'apis/store'
import { addBranch } from 'apis/branch'
import { uploadFile } from 'apis/upload'
import { updateEmployee } from 'apis/employee'
import { addLabel, getAllLabel } from 'apis/label'

//icons
import { PlusOutlined } from '@ant-design/icons'

function ModalIntro() {
  const [formBranch] = Form.useForm()
  const [formStore] = Form.useForm()
  const dispatch = useDispatch()

  const [visible, setVisible] = useState(false)
  const [visibleCreate, setVisibleCreate] = useState(false)
  const [provinces, setProvinces] = useState([])
  const [districtsStore, setDistrictsStore] = useState([])
  const [districtsBranch, setDistrictsBranch] = useState([])
  const [labels, setLabels] = useState([])
  const [inputLabel, setInputLabel] = useState('')

  const [imageBranch, setImageBranch] = useState('')
  const [fileImageBranch, setFileImageBranch] = useState(null)

  const [imageStore, setImageStore] = useState('')
  const [fileImageStore, setFileImageStore] = useState(null)

  const dataUser = useSelector((state) => state.login.dataUser)

  function getBase64(img, callback) {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
  }

  const getLabelData = async () => {
    try {
      const res = await getAllLabel()
      console.log(res)
      if (res.status === 200) {
        setLabels(res.data.data.filter((e) => e.active))
      }
    } catch (error) {
      console.log(error)
    }
  }

  const _addLabel = async () => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const body = {
        name: inputLabel,
        description: '',
      }
      const res = await addLabel(body)
      console.log(res)
      if (res.status === 200) {
        let arrayLabelNew = [...labels]
        arrayLabelNew.push(res.data.data)
        setLabels([...arrayLabelNew])
        setInputLabel('')
        notification.success({ message: 'Tạo thành công label!' })
      }

      if (res.status === 400) {
        setInputLabel('')
        notification.error({ message: 'Label đã tồn tại!' })
      }
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  const _getProvinces = async () => {
    try {
      const res = await getProvinces()
      if (res.status === 200) {
        setProvinces(res.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const _getDistrictsStore = async (query) => {
    try {
      const res = await getDistricts(query)
      if (res.status === 200) {
        setDistrictsStore(res.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const _getDistrictsBranch = async (query) => {
    try {
      const res = await getDistricts(query)
      console.log(res)
      if (res.status === 200) {
        setDistrictsBranch(res.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const onCreate = async () => {
    try {
      let validated = true
      try {
        await formBranch.validateFields()
        await formStore.validateFields()
        validated = true
      } catch (error) {
        validated = false
      }

      if (!validated) return

      const dataStore = formStore.getFieldValue()
      const dataBranch = formBranch.getFieldValue()

      //validated phone
      if (!regexPhone.test(dataBranch.phone) || !regexPhone.test(dataStore.phone)) {
        notification.error({ message: 'Số điện thoại liên hệ không hợp lệ!' })
        return
      }

      dispatch({ type: ACTION.LOADING, data: true })

      /* upload image */
      let urlImageBranch
      let urlImageStore
      if (fileImageBranch) urlImageBranch = await uploadFile(fileImageBranch)
      if (fileImageStore) urlImageStore = await uploadFile(fileImageStore)
      /* upload image */

      const bodyBranch = {
        ...dataBranch,
        logo: urlImageBranch || '',
        latitude: '',
        longtitude: '',
        address: '',
        email: '',
        fax: '',
        website: '',
      }

      const resBranch = await addBranch(bodyBranch)
      if (resBranch.status === 200) {
        const bodyStore = {
          ...dataStore,
          logo: urlImageStore || '',
          email: '',
          fax: '',
          website: '',
          latitude: '',
          longtitude: '',
          address: '',
          branch_id: resBranch.data.data.branch_id,
          label_id: dataStore.label_id || '',
        }

        const resStore = await addStore(bodyStore)
        console.log(resStore)
        if (resStore.status === 200) {
          notification.success({
            message: 'Chúc mừng bạn đã tạo chi nhánh và cửa hàng thành công',
          })
          const resUser = await updateEmployee(
            {
              is_new: false,
              branch_id: resBranch.data.data.branch_id,
              store_id: resStore.data.data.store_id,
            },
            dataUser.data && dataUser.data.user_id
          )
          console.log(resUser)
          if (resUser.status === 200) {
            if (resUser.data.accessToken && resUser.data.refreshToken) {
              localStorage.setItem('accessToken', resUser.data.accessToken)
              localStorage.setItem('refreshToken', resUser.data.refreshToken)
            }
          }
          setTimeout(() => window.location.reload(), 300)
        } else {
          formStore.setFieldsValue({ name: undefined })
          formBranch.setFieldsValue({ name: undefined })
          notification.error({
            message: resStore.data.message || 'Tạo cửa hàng thất bại!',
          })
        }
      } else {
        formStore.setFieldsValue({ name: undefined })
        formBranch.setFieldsValue({ name: undefined })
        notification.error({
          message: resBranch.data.message || 'Tạo chi nhánh thất bại!',
        })
      }

      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      dispatch({ type: ACTION.LOADING, data: false })
      console.log(error)
    }
  }

  useEffect(() => {
    if (Object.keys(dataUser).length) {
      if (dataUser.data.is_new) setVisible(true)
      else setVisible(false)
    }
  }, [dataUser])

  useEffect(() => {
    _getProvinces()
    _getDistrictsStore({ search: 'Hồ Chí Minh' })
    _getDistrictsBranch({ search: 'Hồ Chí Minh' })
    getLabelData()
  }, [])

  useEffect(() => {
    formBranch.setFieldsValue({ district: 'Quận Gò Vấp' })
    formStore.setFieldsValue({ district: 'Quận Gò Vấp' })
    formBranch.setFieldsValue({ province: 'Hồ Chí Minh' })
    formStore.setFieldsValue({ province: 'Hồ Chí Minh' })
  }, [])

  return (
    <>
      <Modal
        width={650}
        footer={null}
        title="Thêm chi nhánh và cửa hàng"
        visible={visibleCreate}
        closable={false}
      >
        <Form form={formBranch} layout="vertical">
          <Upload
            name="avatar"
            listType="picture-card"
            showUploadList={false}
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            onChange={(info) => {
              if (info.file.status === 'done') info.file.status = 'done'
              setFileImageBranch(info.file.originFileObj)
              getBase64(info.file.originFileObj, (imageUrl) => setImageBranch(imageUrl))
            }}
          >
            {imageBranch ? (
              <img src={imageBranch} alt="avatar" style={{ width: '100%' }} />
            ) : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
          <Row justify="space-between" align="middle">
            <Form.Item
              name="name"
              label="Tên chi nhánh"
              rules={[{ required: true, message: 'Vui lòng nhập tên chi nhánh!' }]}
            >
              <Input size="large" style={{ width: 250 }} placeholder="Nhập tên chi nhánh" />
            </Form.Item>
            <Form.Item
              name="province"
              label="Tỉnh/Thành phố"
              rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố!' }]}
            >
              <Select
                style={{ width: 250 }}
                size="large"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder="Chọn tỉnh/thành phố"
                onChange={(value) => _getDistrictsBranch({ search: value })}
              >
                {provinces.map((value, index) => (
                  <Select.Option value={value.province_name} key={index}>
                    {value.province_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Row>
          <Row justify="space-between" align="middle">
            <Form.Item
              name="phone"
              label="Liên hệ"
              rules={[{ required: true, message: 'Vui lòng nhập liên hệ!' }]}
            >
              <Input size="large" style={{ width: 250 }} placeholder="Nhập liên hệ" />
            </Form.Item>
            <Form.Item
              name="district"
              label="Quận/huyện"
              rules={[{ required: true, message: 'Vui lòng nhập quận/huyện!' }]}
            >
              <Select
                style={{ width: 250 }}
                size="large"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder="Chọn quận/huyện"
              >
                {districtsBranch.map((value, index) => (
                  <Select.Option value={value.district_name} key={index}>
                    {value.district_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Row>
        </Form>
        <Divider />
        <Form form={formStore} layout="vertical">
          <Upload
            name="avatar"
            listType="picture-card"
            showUploadList={false}
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            onChange={(info) => {
              if (info.file.status === 'done') info.file.status = 'done'
              setFileImageStore(info.file.originFileObj)
              getBase64(info.file.originFileObj, (imageUrl) => setImageStore(imageUrl))
            }}
          >
            {imageStore ? (
              <img src={imageStore} alt="avatar" style={{ width: '100%' }} />
            ) : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            )}
          </Upload>
          <Row justify="space-between" align="middle">
            <Form.Item
              name="name"
              label="Tên cửa hàng"
              rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng!' }]}
            >
              <Input size="large" style={{ width: 250 }} placeholder="Nhập tên cửa hàng" />
            </Form.Item>
            <Form.Item
              name="province"
              label="Tỉnh/Thành phố"
              rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố!' }]}
            >
              <Select
                style={{ width: 250 }}
                size="large"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder="Chọn tỉnh/thành phố"
                onChange={(value) => _getDistrictsStore({ search: value })}
              >
                {provinces.map((value, index) => (
                  <Select.Option value={value.province_name} key={index}>
                    {value.province_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Row>
          <Row justify="space-between" align="middle">
            <Form.Item
              name="phone"
              label="Liên hệ"
              rules={[{ required: true, message: 'Vui lòng nhập liên hệ!' }]}
            >
              <Input size="large" style={{ width: 250 }} placeholder="Nhập liên hệ" />
            </Form.Item>
            <Form.Item
              name="district"
              label="Quận/huyện"
              rules={[{ required: true, message: 'Vui lòng nhập quận/huyện!' }]}
            >
              <Select
                style={{ width: 250 }}
                size="large"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder="Chọn quận/huyện"
              >
                {districtsStore.map((value, index) => (
                  <Select.Option value={value.district_name} key={index}>
                    {value.district_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Row>
          <Row justify="end">
            <Form.Item name="label_id" label="Label">
              <Select
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: 250 }}
                size="large"
                placeholder="Chọn label"
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <Divider style={{ margin: '4px 0' }} />
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        padding: 8,
                      }}
                    >
                      <Input
                        style={{ flex: 'auto' }}
                        onChange={(e) => setInputLabel(e.target.value)}
                        value={inputLabel}
                      />
                      <a
                        style={{
                          flex: 'none',
                          padding: '8px',
                          display: 'block',
                          cursor: 'pointer',
                        }}
                        onClick={_addLabel}
                      >
                        <PlusOutlined /> Add label
                      </a>
                    </div>
                  </div>
                )}
              >
                {labels.map((l, index) => (
                  <Select.Option
                    value={l.label_id}
                    key={index}
                    style={{ display: !l.active && 'none' }}
                  >
                    {l.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Row>
        </Form>
        <Divider />
        <Row justify="end">
          <Button type="primary" size="large" onClick={onCreate}>
            Thêm
          </Button>
        </Row>
      </Modal>
      <Modal
        title={<div style={{ fontWeight: 600, fontSize: 19 }}>Chào mừng đến với Admin Order</div>}
        centered
        width={580}
        footer={
          <Row justify="end">
            <Button
              type="primary"
              style={{ width: '7.5rem' }}
              onClick={() => {
                setVisible(false)
                setVisibleCreate(true)
              }}
            >
              Tiếp tục
            </Button>
          </Row>
        }
        visible={visible}
        closable={false}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 300,
              marginRight: 20,
            }}
          >
            <img
              style={{ width: '100%' }}
              src="https://ecomfullfillment.s3.ap-southeast-1.amazonaws.com/1629652136039_ecomfullfillment_0.png"
              alt=""
            />
          </div>
          <div style={{ color: 'black', fontSize: '1.1rem', fontWeight: 400 }}>
            Chào mừng bạn đến với tính năng bán tại cửa hàng. Hãy tạo một chi nhánh và một cửa hàng
            để bắt đầu việc kinh doanh cùng <span style={{ fontWeight: 700 }}>Admin Order</span>{' '}
            nhé!!!
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ModalIntro
