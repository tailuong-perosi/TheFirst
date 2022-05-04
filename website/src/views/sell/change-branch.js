import React, { useState, useEffect } from 'react'
import styles from './sell.module.scss'

import { useSelector, useDispatch } from 'react-redux'

//antd
import { Row, Modal, Select, Button, Tooltip, Input } from 'antd'

//icons antd
import { ExclamationCircleOutlined } from '@ant-design/icons'

//images
import location from 'assets/icons/location.png'
import delay from 'delay'

export default function ChangeBranch({
  branches = [],
  loading = false,
  branch = {},
  resetInvoice,
}) {
  const dispatch = useDispatch()
  const dataUser = useSelector((state) => state.login.dataUser)
  const branchIdApp = useSelector((state) => state.branch.branchId)

  const [visible, setVisible] = useState(false)
  const toggle = () => setVisible(!visible)

  const [branchId, setBranchId] = useState(branchIdApp)

  const _changeBranch = () => {
    dispatch({ type: 'SET_BRANCH_ID', data: branchId }) //save branch_id in reducer
    resetInvoice()
    toggle()
  }

  function confirm() {
    Modal.confirm({
      onOk: () => _changeBranch(),
      title: 'Bạn có muốn chuyển đổi chi nhánh này không ?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hệ thống sẽ không lưu lại thông tin của các đơn hàng này',
      okText: 'Đồng ý',
      cancelText: 'Từ chối',
    })
  }

  useEffect(() => {
    if (visible) setBranchId(branchIdApp)
  }, [visible])

  return (
    <>
      <Tooltip title={branch.name || ''}>
        <Row wrap={false} align="middle" style={{ cursor: 'pointer' }} onClick={toggle}>
          <img src={location} alt="" style={{ marginRight: 10, width: 10 }} />
          <p className={styles['name-branch']}>{branch.name || ''}</p>
        </Row>
      </Tooltip>
      <Modal
        width={400}
        onCancel={toggle}
        visible={visible}
        footer={null}
        title="Chuyển đổi chi nhánh"
      >
        <div>
          <p style={{ marginBottom: 0 }}>Doanh nghiệp</p>
          <Input
            style={{ color: 'black' }}
            value={
              dataUser &&
              dataUser.data &&
              dataUser.data._business &&
              dataUser.data._business.business_name
            }
            disabled
          />
        </div>
        <div style={{ marginBottom: 25, marginTop: 20 }}>
          <p style={{ marginBottom: 0 }}>Điểm bán</p>
          <Select
            loading={loading}
            placeholder="Chọn điểm bán"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            style={{ width: '100%' }}
            value={branchId}
            onChange={(value) => setBranchId(value)}
          >
            {branches.map((branch, index) => (
              <Select.Option key={index} value={branch.branch_id}>
                {branch.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <Row justify="end">
          <Button
            onClick={confirm}
            type="primary"
            style={{ backgroundColor: '#0877DE', borderColor: '#0877DE' }}
          >
            Chuyển đổi
          </Button>
        </Row>
      </Modal>
    </>
  )
}
