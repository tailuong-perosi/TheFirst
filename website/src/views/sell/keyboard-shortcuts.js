import React, { useState } from 'react'

import { Modal, Button, Row } from 'antd'

import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

export default function KeyboardShortCuts() {
  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)

  const shortcuts = [
    {
      text: 'Thanh toán',
      icon: '(F1)',
    },
    {
      text: 'Nhập khách hàng mới',
      icon: '(F4)',
    },
    {
      text: 'Điều chỉnh phương thức thanh toán (F8)',
      icon: '',
    },
    {
      text: 'Tạo đơn khác',
      icon: '(F9)',
    },
    {
      text: 'Thay đổi số lượng sản phẩm đầu tiên (Home)',
      icon: '',
    },
    {
      text: 'Tăng số lượng lên 1 đơn vị',
      icon: <ArrowUpOutlined />,
    },
    {
      text: 'Giảm số lượng xuống 1 đơn vị',
      icon: <ArrowDownOutlined />,
    },
    {
      text: 'Di chuyển xuống số lượng sản phẩm tiếp theo (Enter)',
      icon: '',
    },
    {
      text: 'Di chuyển lên số lượng sản phẩm tiếp theo (Shift)',
      icon: '',
    },
  ]

  return (
    <>
      <Button
        onClick={toggle}
        type="primary"
        style={{
          backgroundColor: '#192DA0',
          borderColor: '#192DA0',
          borderRadius: 5,
          color: 'white',
        }}
      >
        Phím tắt
      </Button>
      <Modal
        width={800}
        footer={null}
        title="Danh sách tất cả các phím tắt"
        visible={visible}
        onCancel={toggle}
      >
        <Row justify="space-between" align="middle">
          {shortcuts.map((shortcut) => (
            <div
              style={{
                backgroundColor: '#B5CEFE',
                borderRadius: '5px',
                width: '230px',
                height: '55px',
                fontWeight: 600,
                marginBottom: 30,
                paddingLeft: 10,
                paddingRight: 10,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <p style={{ textAlign: 'center', marginBottom: 0 }}>{shortcut.text}</p>
              <p style={{ textAlign: 'center', marginBottom: 0 }}>{shortcut.icon}</p>
            </div>
          ))}
        </Row>
      </Modal>
    </>
  )
}
