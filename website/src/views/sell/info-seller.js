import React, { useState } from 'react'
import styles from './sell.module.scss'

import { useSelector } from 'react-redux'

import { Row, Modal, Space, Tooltip } from 'antd'
import { UserOutlined } from '@ant-design/icons'

export default function InfoSeller() {
  const dataUser = useSelector((state) => state.login.dataUser)

  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)
  return (
    <>
      <Tooltip
        title={
          ((dataUser.data && dataUser.data.first_name) || '') +
          ' ' +
          ((dataUser.data && dataUser.data.last_name) || '')
        }
      >
        <Row wrap={false} align="middle" onClick={toggle} style={{ cursor: 'pointer' }}>
          <UserOutlined style={{ marginRight: 10, width: 10, color: 'white' }} />
          <p className={styles['name-user']}>
            {((dataUser.data && dataUser.data.first_name) || '') +
              ' ' +
              ((dataUser.data && dataUser.data.last_name) || '')}
          </p>
        </Row>
      </Tooltip>
      <Modal
        width={450}
        visible={visible}
        footer={null}
        onCancel={toggle}
        title="Thông tin nhân viên"
      >
        <Space direction="vertical" style={{ fontSize: 15 }}>
          <Row align="middle" wrap={false}>
            <span style={{ fontWeight: 600, marginRight: 6 }}>Họ tên:</span>
            <span>
              {((dataUser.data && dataUser.data.first_name) || '') +
                ' ' +
                ((dataUser.data && dataUser.data.last_name) || '')}
            </span>
          </Row>
          <Row align="middle" wrap={false}>
            <span style={{ fontWeight: 600, marginRight: 6 }}>Số điện thoại:</span>
            <span>{dataUser.data && (dataUser.data.phone || '')}</span>
          </Row>
          <Row align="middle" wrap={false}>
            <span style={{ fontWeight: 600, marginRight: 6 }}>Email:</span>
            <span>{dataUser.data && (dataUser.data.email || '')}</span>
          </Row>
          <Row align="middle" wrap={false}>
            <span style={{ fontWeight: 600, marginRight: 6 }}>Địa chỉ:</span>
            <span>{dataUser.data && (dataUser.data.address || '')}</span>
          </Row>
          <Row align="middle" wrap={false}>
            <span style={{ fontWeight: 600, marginRight: 6 }}>Ngày sinh:</span>
            <span>{dataUser.data && (dataUser.data.birthday || '')}</span>
          </Row>
          <Row align="middle" wrap={false}>
            <span style={{ fontWeight: 600, marginRight: 6 }}>Chức vụ:</span>
            <span>
              {dataUser.data && (dataUser.data._role ? dataUser.data._role.sub_name : '')}
            </span>
          </Row>
        </Space>
      </Modal>
    </>
  )
}
