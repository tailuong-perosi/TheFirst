import styles from './product-check.module.scss'
import React, { useState } from 'react'
import { Input, Button, Row, Col, DatePicker, Select, Table, Drawer } from 'antd'
import { PlusCircleOutlined, FileExcelOutlined } from '@ant-design/icons'
import moment from 'moment'
import { PERMISSIONS } from 'consts'
import ProductCheckAdd from './product-check-form'
import Permission from 'components/permission'
const { Option } = Select
const { RangePicker } = DatePicker
export default function ProductCheck() {
  const [showCreate, setShowCreate] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const columnsPromotion = [
    {
      title: 'STT',
      width: 150,
      render: (data, record, index) => index,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'ticketCode',
      width: 150,
    },
    {
      title: 'Tổng SL thực tế',
      width: 150,
    },
    {
      title: 'Tổng SL hệ thống',
      width: 150,
    },
    {
      title: 'Đơn vị',
      width: 150,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
    },
    {
      title: 'Ngày kiểm',
      dataIndex: 'checkDate',
      width: 150,
    },
    {
      title: 'Nhân viên kiểm',
      dataIndex: 'createdEmployee',
      width: 150,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      width: 150,
    },
  ]

  const dataPromotion = []
  for (let i = 0; i < 46; i++) {
    dataPromotion.push({
      key: i,
      stt: i,
      ticketCode: 'GH',
      warehouseCheck: `Chi nhánh mặc định ${i}`,
      status: `Đang kiểm kho ${i}`,
      createdDate: `07:30, 2021/07/01 ${i}`,
      checkDate: `07:30, 2021/07/01 ${i}`,
      createdEmployee: `Nguyễn Văn Tỷ`,
      note: `không có ${i}`,
    })
  }

  const onSelectChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys)
  }
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }
  const content = (
    <div>
      <div>Gợi ý 1</div>
      <div>Gợi ý 2</div>
    </div>
  )
  return (
    <>
      <div className={`${styles['promotion_manager']} ${styles['card']}`}>
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgb(236, 226, 226)',
            paddingBottom: '0.75rem',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div className={styles['promotion_manager_title']}>Danh sách phiếu kiểm hàng</div>
          <div className={styles['promotion_manager_button']}>
            <Permission permissions={[PERMISSIONS.them_phieu_kiem_hang]}>
              <Button
                icon={<PlusCircleOutlined style={{ fontSize: '1rem' }} />}
                type="primary"
                onClick={() => setShowCreate(true)}
                size="large"
              >
                Tạo phiếu kiểm
              </Button>
            </Permission>
          </div>
        </div>
        <Row
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Col style={{ width: '100%', marginTop: '1rem' }} xs={24} sm={24} md={11} lg={11} xl={7}>
            <div style={{ width: '100%' }}>
              <Input size="large" placeholder="Tìm kiếm theo mã, theo tên" enterButton />
            </div>
          </Col>
          <Col style={{ width: '100%', marginTop: '1rem' }} xs={24} sm={24} md={11} lg={11} xl={7}>
            <div style={{ width: '100%' }}>
              <RangePicker
                size="large"
                className="br-15__date-picker"
                style={{ width: '100%' }}
                ranges={{
                  Today: [moment(), moment()],
                  'This Month': [moment().startOf('month'), moment().endOf('month')],
                }}
              />
            </div>
          </Col>
          <Col style={{ width: '100%', marginTop: '1rem' }} xs={24} sm={24} md={11} lg={11} xl={7}>
            <DatePicker size="large" className="br-15__date-picker" style={{ width: '100%' }} />
          </Col>
          <Col style={{ width: '100%', marginTop: '1rem' }} xs={24} sm={24} md={11} lg={11} xl={7}>
            <div style={{ width: '100%' }}>
              <Select size="large" style={{ width: '100%' }} placeholder="Lọc theo người dùng">
                <Option value="user1">Người dùng 1</Option>
                <Option value="user2">Người dùng 2</Option>
                <Option value="user3">Người dùng 3</Option>
              </Select>
            </div>
          </Col>
        </Row>
        <Row
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Col style={{ width: '100%' }} xs={24} sm={24} md={12} lg={12} xl={12}>
            <Row
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Col
                style={{
                  width: '100%',
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
                xs={24}
                sm={24}
                md={24}
                lg={24}
                xl={6}
              >
                <Button
                  size="large"
                  icon={<FileExcelOutlined />}
                  style={{
                    backgroundColor: '#004F88',
                    color: 'white',
                  }}
                >
                  Nhập excel
                </Button>
              </Col>
              <Col
                style={{
                  width: '100%',
                  marginTop: '1rem',
                  marginLeft: '1rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
                xs={24}
                sm={24}
                md={24}
                lg={24}
                xl={6}
              >
                <Button
                  size="large"
                  icon={<FileExcelOutlined />}
                  style={{
                    backgroundColor: '#008816',
                    color: 'white',
                  }}
                >
                  Xuất excel
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <div
          style={{
            width: '100%',
            marginTop: '1rem',
            border: '1px solid rgb(243, 234, 234)',
          }}
        >
          <Table
            size="small"
            rowSelection={rowSelection}
            columns={columnsPromotion}
            dataSource={dataPromotion}
            style={{
              width: '100%',
            }}
          />
        </div>
      </div>
      <Drawer
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        width="75%"
        title="Tạo phiếu kiểm hàng"
        bodyStyle={{
          padding: 0,
        }}
      >
        <ProductCheckAdd close={() => setShowCreate(false)} />
      </Drawer>
    </>
  )
}
