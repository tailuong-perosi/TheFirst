import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { validatePhone } from 'utils'

//antd
import {
  Form,
  Drawer,
  Row,
  Col,
  Button,
  Input,
  notification,
  DatePicker,
  Select,
  Radio,
  Space,
} from 'antd'

//apis
import {  addadministrator } from 'apis/administrator'

export default function AdminForm({
  children,
  reloadData,
  record,
  roles = [],
  branches = [],
}) {
  const [form] = Form.useForm()
  const branchIdApp = useSelector((state) => state.branch.branchId)

  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)

  const _addadmin = async () => {
    try {
      await form.validateFields()
      const dataForm = form.getFieldsValue()

      if (!validatePhone(dataForm.phone)) {
        notification.error({ message: 'Số điện thoại không đúng định dạng!' })
        return
      }

      setLoading(true)
      const body = {
        ...dataForm,
        // avatar: '',
        name: dataForm.name || '',
        username: dataForm.username,
        email: dataForm.email || '',
        phone: dataForm.phone || '',
        birth_day: dataForm.birthday || '',
        address: dataForm.address || '',
        // role_id: +dataForm.role_id,
        // part_id: +dataForm.part_id,
      }
      // console.log(body)

      let res = await addadministrator({...body})
      
      console.log(res)

      if (res.status === 200) {
        if (res.data.success) {
          toggle()
          reloadData()
          notification.success({
            message: ` Thêm nhân viên thành công`,
          })
        } else
          notification.error({
            message:
              res.data.message ||
              `Thêm nhân viên thất bại, vui lòng thử lại`,
          })
      } else
        notification.error({
          message:
            res.data.message ||
            `Thêm nhân viên thất bại, vui lòng thử lại`,
        })
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }



  return (
    <>
      <div onClick={toggle}>{children}</div>
      <Drawer
        width="70%"
        footer={
          <Row justify="end">
            <Button
              onClick={_addadmin}
              loading={loading}
              size="large"
              type="primary"
              style={{ width: 120 }}
            >
               Thêm
            </Button>
          </Row>
        }
        title= 'Thêm quản trị viên'
        placement="right"
        onClose={toggle}
        visible={visible}
      >
        <Form layout="vertical" form={form}>
          <Row justify="space-between" align="middle">
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: record ? false : true, message: 'Vui lòng nhập số điện thoại!' },
                ]}
              >
                <Input disabled={record ? true : false} placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item label="Họ Tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập Họ tên!' }]}>
                <Input placeholder="Nhập họ Tên" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item
                label="Tên đăng nhập "
                name="username"
                rules={[{ required: true, message: 'Vui lòng nhập Tên đăng nhập!' }]}
              >
                <Input placeholder="Nhập Tên đăng nhập" />
              </Form.Item>
              </Col>
            <Col xs={24} sm={24} md={11} lg={11} xl={11} style={{ display: record && 'none' }}>
              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập Email !' }]}>
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item label="Ngày sinh" name="birthday" >
                <DatePicker placeholder="Chọn ngày sinh" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={11} lg={11} xl={11}>
              <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                <Input placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  )
}
