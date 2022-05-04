import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { ROUTES } from 'consts'

//antd
import { Row, Button, Input, Table, Modal, Checkbox } from 'antd'

//icons
import { ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons'

export default function PaymentType() {
  const history = useHistory()

  const columns = [
    { title: 'Mã', dataIndex: 'id' },
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Mô tả', dataIndex: 'description' },
  ]

  const dataSource = [
    { id: 1, name: 'name', description: 'abc' },
    { id: 1, name: 'name', description: 'abc' },
    { id: 1, name: 'name', description: 'abc' },
    { id: 1, name: 'name', description: 'abc' },
    { id: 1, name: 'name', description: 'abc' },
  ]

  const ModalCreatePaymentType = () => {
    const [visible, setVisible] = useState(false)
    const toggle = () => setVisible(!visible)

    return (
      <>
        <Button
          onClick={toggle}
          style={{
            backgroundColor: '#0877DE',
            borderColor: '#0877DE',
            borderRadius: 5,
            color: 'white',
            fontWeight: 600,
          }}
        >
          Tạo loại phiếu chi
        </Button>
        <Modal
          width={650}
          visible={visible}
          onCancel={toggle}
          title="Thêm loại phiếu chi"
          footer={
            <Row justify="end">
              <Button
                style={{
                  width: 100,
                  backgroundColor: '#0877DE',
                  borderColor: '#0877DE',
                  borderRadius: 5,
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                Thêm
              </Button>
            </Row>
          }
        >
          <Row justify="space-between" wrap={false}>
            <div>
              <Row wrap={false} align="middle">
                <span style={{ marginBottom: 0 }}>Tên</span>
                <span style={{ marginBottom: 0, color: 'red' }}>*</span>
              </Row>
              <Input placeholder="Nhập tên" style={{ width: 280 }} />
            </div>
            <div>
              <Row wrap={false} align="middle">
                <span style={{ marginBottom: 0 }}>Mã</span>
                <span style={{ marginBottom: 0, color: 'red' }}>*</span>
              </Row>
              <Input placeholder="Nhập mã" style={{ width: 280 }} />
              <div style={{ width: 280, marginTop: 4 }}>
                <Checkbox>Tự động tạo mã</Checkbox>
              </div>
            </div>
          </Row>
          <div style={{ marginTop: 10 }}>
            <span style={{ marginBottom: 0 }}>Mô tả</span>
            <Input.TextArea rows={5} placeholder="Nhập mô tả" />
          </div>
        </Modal>
      </>
    )
  }

  return (
    <div style={{ padding: 20 }}>
      <Row
        align="middle"
        justify="space-between"
        style={{ paddingBottom: 17, borderBottom: '1px solid #b4b4b4' }}
      >
        <Row
          wrap={false}
          align="middle"
          onClick={() => history.push(ROUTES.RECEIPTS_PAYMENT)}
          style={{ cursor: 'pointer', fontSize: 18 }}
        >
          <ArrowLeftOutlined />
          <p style={{ marginBottom: 0, marginLeft: 8, fontWeight: 700 }}>
            Loại phiếu chi
          </p>
        </Row>
        <ModalCreatePaymentType />
      </Row>
      <Row>
        <Input
          prefix={<SearchOutlined />}
          style={{ width: 380, marginBottom: 20, marginTop: 20 }}
          placeholder="Tìm kiếm theo tên, theo mã"
        />
      </Row>
      <Table
        style={{ width: '100%' }}
        columns={columns}
        dataSource={dataSource}
      />
    </div>
  )
}
