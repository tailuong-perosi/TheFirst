import React, { useEffect, useState } from 'react'
import styles from './payment.module.scss'
import { Link, useHistory } from 'react-router-dom'
import { ROUTES } from 'consts'

//antd
import {
  Row,
  Switch,
  Button,
  Modal,
  Input,
  Form,
  Table,
  notification,
  Space,
  Checkbox,
  Popconfirm,
} from 'antd'

//icons
import { CreditCardOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons'

//components
import Permission from 'components/permission'
import TitlePage from 'components/title-page'

//apis
import { getPayments, addPayment, editPayment, deletePayment } from 'apis/payment'
import moment from 'moment'

export default function Payment() {
  const [form] = Form.useForm()
  const history = useHistory()

  const [id, setId] = useState('')
  const [isEditPayment, setIsEditPayment] = useState(false)
  const [visible, setVisible] = useState(false)
  const toggle = () => {
    setVisible(!visible)
    form.resetFields()
    setIsEditPayment(false)
    setId('')
  }

  const [paramsFilter, setParamsFilter] = useState({ page: 1, page_size: 20 })
  const [loading, setLoading] = useState(false)

  const [payments, setPayments] = useState([])
  const [countPayment, setCountPayment] = useState(0)

  const columns = [
    {
      title: 'STT',
      render: (text, record, index) => index + 1,
      width: 70,
    },
    {
      title: 'Tên hình thức thanh toán',
      render: (text, record) => (
        <a
          onClick={() => {
            setId(record.payment_method_id)
            setIsEditPayment(true)
            form.setFieldsValue({ ...record })
            setVisible(true)
          }}
        >
          {record.name} {record.default && `(Mặc định)`}
        </a>
      ),
    },
    {
      title: 'Người tạo',
      render: (text, record) =>
        record._creator && `${record._creator.first_name} ${record._creator.last_name}`,
    },
    {
      title: 'Ngày tạo',
      render: (text, record) =>
        record.create_date && moment(record.create_date).format('DD-MM-YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      render: (text, record) => (
        <Space size="middle">
          <Switch
            checked={record.active}
            onChange={(value) => _updatePayment({ active: value }, record.payment_method_id)}
          />
          <Popconfirm
            onConfirm={() => _deletePayment(record.payment_method_id)}
            title="Bạn có muốn xóa hình thức thanh toán này không?"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const _deletePayment = async (id) => {
    try {
      setLoading(true)
      const res = await deletePayment([id])
      setLoading(false)
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          notification.success({ message: 'Xóa hình thức thanh toán thành công!' })
          _getPayments()
        } else
          notification.error({
            message: res.data.message || 'Xóa hình thức thanh toán thất bại, vui lòng thử lại!',
          })
      } else
        notification.error({
          message: res.data.message || 'Xóa hình thức thanh toán thất bại, vui lòng thử lại!',
        })
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const _updatePayment = async (body, id) => {
    try {
      setLoading(true)
      const res = await editPayment(body, id)
      setLoading(false)
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          notification.success({ message: 'Cập nhật hình thức thanh toán thành công!' })
          _getPayments()
          // toggle()
        } else
          notification.error({
            message:
              res.data.message || 'Cập nhật hình thức thanh toán thất bại, vui lòng thử lại!',
          })
      } else
        notification.error({
          message: res.data.message || 'Cập nhật hình thức thanh toán thất bại, vui lòng thử lại!',
        })
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const _getPayments = async () => {
    try {
      setLoading(true)
      const res = await getPayments({ ...paramsFilter, _creator: true })
      console.log(res)
      if (res.status === 200) {
        setPayments(res.data.data)
        setCountPayment(res.data.count)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const _addPayment = async () => {
    try {
      setLoading(true)
      await form.validateFields()
      const dataForm = form.getFieldsValue()
      const res = await addPayment({ ...dataForm })
      console.log(res)
      if (res.status === 200) {
        if (res.data.success) {
          notification.success({ message: 'Thêm hình thức thanh toán thành công' })
          toggle()
          _getPayments()
        } else
          notification.error({ message: res.data.message || 'Thêm hình thức thanh toán thất bại!' })
      } else
        notification.error({ message: res.data.message || 'Thêm hình thức thanh toán thất bại!' })

      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  useEffect(() => {
    _getPayments()
  }, [paramsFilter])

  return (
    <>
      <div className="card">
        <TitlePage
          title={
            <Row
              align="middle"
              onClick={() => history.push(ROUTES.CONFIGURATION_STORE)}
              style={{ cursor: 'pointer' }}
            >
              <ArrowLeftOutlined style={{ marginRight: 8 }} />
              Hình thức thanh toán
            </Row>
          }
        >
          {/* <Permission permissions={[PERMISSIONS.them_hinh_thuc_thanh_toan]}> */}
          <Button size="large" type="primary" onClick={toggle} icon={<CreditCardOutlined />}>
            Thêm hình thức thanh toán
          </Button>
          {/* </Permission> */}
        </TitlePage>

        <Table
          loading={loading}
          columns={columns}
          dataSource={payments}
          size="small"
          style={{ width: '100%', marginTop: 20 }}
          pagination={{
            position: ['bottomLeft'],
            current: paramsFilter.page,
            pageSize: paramsFilter.page_size,
            pageSizeOptions: [20, 30, 40, 50, 60, 70, 80, 90, 100],
            showQuickJumper: true,
            onChange: (page, pageSize) => {
              paramsFilter.page = page
              paramsFilter.page_size = pageSize
              setParamsFilter({ ...paramsFilter })
            },
            total: countPayment,
          }}
        />
      </div>

      <Modal
        title={`${isEditPayment ? 'Cập nhật' : 'Thêm'} hình thức thanh toán`}
        visible={visible}
        onCancel={toggle}
        footer={
          <Row justify="end">
            <Space>
              <Button onClick={toggle}>Đóng</Button>
              <Button
                loading={loading}
                type="primary"
                onClick={async () => {
                  await form.validateFields()
                  const dataForm = form.getFieldsValue()
                  if (isEditPayment) _updatePayment({ ...dataForm }, id)
                  else _addPayment()
                }}
              >
                {isEditPayment ? 'Cập nhật' : 'Thêm'}
              </Button>
            </Space>
          </Row>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên hình thức thanh toán' }]}
            label="Hình thức thanh toán"
          >
            <Input placeholder="Nhập tên hình thức thanh toán" />
          </Form.Item>
          <Form.Item name="default" valuePropName="checked">
            <Checkbox>Chọn làm hình thức thanh toán mặc định</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
