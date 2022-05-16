import React, { useState, useEffect } from 'react'

//antd
import { Modal, Form, Row, Col, Input, Button, Upload, notification } from 'antd'

//icons
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'

//apis
import { updateuserEKT } from 'apis/userEKT'
import { uploadFile } from 'apis/upload'

export default function ModalUpdateUser({ user, children, reload }) {
  const [form] = Form.useForm()
  // const [user, setUser] = useState([])
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)

  const _updateUser = async () => {
    try {
      await form.validateFields()
      const dataForm = form.getFieldsValue()
      const body = {
        ...dataForm,
        avatar: avatar,
      }
      setLoading(true)
      const res = await updateuserEKT(body, user && user.user_id)
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          toggle()
          notification.success({ message: 'Cập nhật thông tin cá nhân thành công' })
          reload({ user_id: res.data.data.user_id })
        } else
          notification.error({
            message: res.data.message || 'Cập nhật thông tin cá nhân thành công',
          })
      } else
        notification.error({ message: res.data.message || 'Cập nhật thông tin cá nhân thành công' })
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      notification.warning({ message: 'Bạn chỉ có thể tải lên tệp JPG / PNG / JPEG!' });
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      notification.warning({ message: 'Hình ảnh phải có kích thước nhỏ hơn 2MB!' });
    }
    return isJpgOrPng && isLt2M;
  }

  const _upload = async (file) => {
    try {
      setLoading(true)
      const url = await uploadFile(file)
      console.log(url)
      setAvatar(url || '')
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }


  useEffect(() => {
    if (visible)
      if (user) {
        form.setFieldsValue({ ...user })
        setAvatar(user.avatar || '')
      }
  }, [visible])

  return (
    <>
      <div onClick={toggle}>{children}</div>
      <Modal
        width="60%"
        title="Chỉnh sửa thông tin cá nhân"
        centered
        footer={null}
        visible={visible}
        okText="Lưu"
        cancelText="Đóng"
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                data={_upload}
                beforeUpload={beforeUpload}
              >
                {avatar ? (
                  <img src={avatar} alt="avatar" style={{ width: '100%' }} />
                ) : (
                  <div>
                    {loading ? <LoadingOutlined /> : <PlusOutlined />}
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                )}
              </Upload>
            </Col>

            <Row>
              <col></col>
              <col></col>

            </Row>

            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Form.Item 
                label="Nhập tên " 
                name="fullname"
                rules={[{ message: 'Vui lòng nhập tên', required: true }]}
                >
                <Input placeholder="Nhập tên của bạn... " />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Form.Item
                name="job"
                label="Công việc"
                rules={[{ message: 'Vui lòng nhập công việc ', required: true }]}
              >
                <Input placeholder="Nhập công việc của bạn..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Form.Item name="email" label="Email">
                {/* <Input placeholder="Nhập email"  /> */}
                <Input placeholder="" disabled />
                
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Form.Item name="phone" label="Số điện thoại">
                {/* <Input placeholder="Nhập email"  /> */}
                <Input placeholder="" disabled />

              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Form.Item name="address" label="Địa chỉ">
                <Input placeholder="Nhập địa chỉ của bạn..." />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Form.Item>
              <Button loading={loading} type="primary" onClick={_updateUser} >
                Cập nhật
              </Button>
            </Form.Item>
          </Row>
        </Form>
      </Modal>
    </>
  )
}
