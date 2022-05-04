import React, { useState, useEffect } from 'react'
import { ACTION, regexPhone } from 'consts/index'
import { useDispatch, useSelector } from 'react-redux'

//antd
import { Input, Button, Row, notification, Select, Modal, Form, Upload, Divider } from 'antd'

//icons
import { PlusOutlined } from '@ant-design/icons'

//apis
import { getProvinces, getDistricts } from 'apis/address'
import { getAllBranch } from 'apis/branch'
import { addStore, updateStore } from 'apis/store'
import { uploadFile } from 'apis/upload'
import { getAllLabel, addLabel } from 'apis/label'

export default function StoreForm({ reloadData, children, infoStoreUpdate }) {
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const branchId = useSelector((state) => state.branch.branchId)

  const [branchList, setBranchList] = useState([])
  const [image, setImage] = useState('')
  const [inputLabel, setInputLabel] = useState('')
  const [labels, setLabels] = useState([])

  const [districtMain, setDistrictMain] = useState([])
  const [districtsDefault, setDistrictsDefault] = useState([])
  const [provinces, setProvinces] = useState([])

  const [visible, setVisible] = useState(false)

  const _addOrUpdateStore = async () => {
    try {
      await form.validateFields()

      const formData = form.getFieldsValue()
      dispatch({ type: ACTION.LOADING, data: true })

      //check validated phone
      if (!regexPhone.test(formData.phone)) {
        notification.error({ message: 'Số điện thoại không đúng định dạng' })
        return
      }

      const body = {
        ...formData,
        logo: image,
        latitude: '',
        longtitude: '',
        address: formData.address || '',
        label_id: formData.label || '',
      }

      let res
      if (infoStoreUpdate) res = await updateStore(body, infoStoreUpdate.store_id)
      else res = await addStore(body)
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          reloadData()
          notification.success({
            message: `${infoStoreUpdate ? 'Cập nhật' : 'Tạo'} cửa hàng thành công`,
          })
          setVisible(false)
        } else
          notification.error({
            message:
              res.data.message ||
              `${infoStoreUpdate ? 'Cập nhật' : 'Tạo'} cửa hàng thất bại, vui lòng thử lại!`,
          })
      } else
        notification.error({
          message:
            res.data.message ||
            `${infoStoreUpdate ? 'Cập nhật' : 'Tạo'} cửa hàng thất bại, vui lòng thử lại!`,
        })
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      console.log(error)
      dispatch({ type: ACTION.LOADING, data: false })
    }
  }

  const _onUploadFile = async (file) => {
    try {
      dispatch({ type: ACTION.LOADING, data: true })
      const url = await uploadFile(file)
      setImage(url)
      dispatch({ type: ACTION.LOADING, data: false })
    } catch (error) {
      console.log(error)
      dispatch({ type: ACTION.LOADING, data: false })
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
        if (res.data.data && res.data.data.length) {
          setProvinces(res.data.data)

          //default value
          if (!infoStoreUpdate) form.setFieldsValue({ province: res.data.data[0].province_name })
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const _getDistricts = async () => {
    try {
      const res = await getDistricts()
      if (res.status === 200) {
        if (res.data.data && res.data.data.length) {
          setDistrictMain(res.data.data)
          setDistrictsDefault(res.data.data)

          //default value
          if (!infoStoreUpdate) form.setFieldsValue({ district: res.data.data[0].district_name })
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getLabel = async () => {
    try {
      const res = await getAllLabel()
      if (res.data.success) {
        setLabels(res.data.data.filter((e) => e.active))
      }
    } catch (e) {
      console.log(e)
    }
  }

  const _getAllBranch = async () => {
    try {
      const res = await getAllBranch()
      if (res.data.success) {
        setBranchList(res.data.data.filter((e) => e.active))
      }
    } catch (e) {
      console.log(e)
    }
  }

  //reset
  useEffect(() => {
    if (!visible) {
      form.resetFields()
    } else {
      console.log(infoStoreUpdate)
      if (infoStoreUpdate) {
        form.setFieldsValue({ ...infoStoreUpdate })
        setImage(infoStoreUpdate.logo || '')
      }

      form.setFieldsValue({ branch_id: branchId })
    }
  }, [visible])

  useEffect(() => {
    _getProvinces()
    _getDistricts()
    _getAllBranch()
    getLabel()
  }, [])

  return (
    <>
      <div onClick={() => setVisible(true)}>{children}</div>
      <Modal
        title={infoStoreUpdate ? 'Cập nhật cửa hàng' : 'Thêm cửa hàng'}
        centered
        width={850}
        footer={null}
        visible={visible}
        onCancel={() => setVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Upload
            name="avatar"
            listType="picture-card"
            showUploadList={false}
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            onChange={(info) => {
              if (info.file.status === 'done') info.file.status = 'done'
            }}
            data={_onUploadFile}
          >
            {image ? (
              <img src={image} alt="avatar" style={{ width: '100%' }} />
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
              label="Tên cửa hàng"
              rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng!' }]}
            >
              <Input size="large" style={{ width: 350 }} placeholder="Nhập tên cửa hàng" />
            </Form.Item>
            <Form.Item
              name="province"
              label="Tỉnh/Thành phố"
              rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}
            >
              <Select
                style={{ width: 350 }}
                size="large"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder="Chọn tỉnh/thành phố"
                onChange={(value) => {
                  if (value) {
                    const districtsNew = districtsDefault.filter((e) => e.province_name === value)
                    setDistrictMain([...districtsNew])
                  } else setDistrictMain([...districtsDefault])
                }}
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
              <Input size="large" style={{ width: 350 }} placeholder="Nhập liên hệ" />
            </Form.Item>
            <Form.Item
              name="district"
              label="Quận/huyện"
              rules={[{ required: true, message: 'Vui lòng chon quận/huyện!' }]}
            >
              <Select
                style={{ width: 350 }}
                size="large"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder="Chọn quận/huyện"
              >
                {districtMain.map((value, index) => (
                  <Select.Option value={value.district_name} key={index}>
                    {value.district_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Row>
          <Row justify="space-between">
            <Form.Item
              name="branch_id"
              label="Chi nhánh"
              rules={[{ required: true, message: 'Vui chọn chon chi nhánh!' }]}
            >
              <Select
                style={{ width: 350 }}
                size="large"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder="Chọn chi nhánh"
              >
                {branchList.map((value, index) => (
                  <Select.Option value={value.branch_id} key={index}>
                    {value.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="label_id" label="Label">
              <Select
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: 350 }}
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
          <Row>
            <Form.Item name="address" label="Địa chỉ">
              <Input size="large" style={{ width: 350 }} placeholder="Nhập địa chỉ" />
            </Form.Item>
          </Row>
        </Form>
        <Row justify="end">
          <Button size="large" type="primary" onClick={_addOrUpdateStore}>
            {infoStoreUpdate ? 'Cập nhật' : 'Thêm'}
          </Button>
        </Row>
      </Modal>
    </>
  )
}
