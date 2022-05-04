import styles from './report-import.module.scss'
import React, { useState } from 'react'
import { Popconfirm, Input, Button, Row, Col, DatePicker, Popover, Table, Typography } from 'antd'

import { FileExcelOutlined } from '@ant-design/icons'
import moment from 'moment'
import { compare } from 'utils'
const { Text } = Typography
const { RangePicker } = DatePicker

export default function ReportImport() {
  const { Search } = Input
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const onSelectChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys)
  }
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      width: 150,
    },
    {
      title: 'Mã sản phẩm',
      dataIndex: 'productCode',
      width: 150,
      sorter: (a, b) => compare(a, b, 'productCode'),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      width: 150,
      sorter: (a, b) => compare(a, b, 'productName'),
    },
    {
      title: 'Số lượng',
      dataIndex: 'productQuantity',
      width: 150,
      sorter: (a, b) => compare(a, b, 'productQuantity'),
    },
    {
      title: 'Mã lô hàng',
      dataIndex: 'goodsCode',
      width: 150,
      sorter: (a, b) => compare(a, b, 'goodsCode'),
    },
    {
      title: 'Mã hàng',
      dataIndex: 'code',
      width: 150,
      sorter: (a, b) => compare(a, b, 'code'),
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      width: 150,
      sorter: (a, b) => compare(a, b, 'suppier'),
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'importDate',
      width: 150,
      sorter: (a, b) => moment(a.importDate).unix() - moment(b.importDate).unix(),
    },
  ]
  const data = []
  for (let i = 0; i < 46; i++) {
    data.push({
      key: i,
      stt: i,
      productCode: <div>{i}</div>,
      productName: `tên sản phẩm ${i}`,
      productQuantity: i,
      goodsCode: `BS5426${i}`,
      code: `8546${i}`,
      supplier: `Hưng Thịnh`,
      importDate: '2021-07-02',
    })
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
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div className={styles['promotion_manager_title']}>Báo cáo nhập hàng</div>
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
            <div style={{ width: '100%' }}>
              <DatePicker style={{ width: '100%' }} size="large" className="br-15__date-picker" />
            </div>
          </Col>
        </Row>
        <Row
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Col
            className={styles['hover_item']}
            style={{ width: '100%', marginTop: '1rem', marginRight: '1rem' }}
            xs={24}
            sm={24}
            md={11}
            lg={7}
            xl={7}
          >
            <div
              style={{
                display: 'flex',
                backgroundColor: '#5363E0',
                padding: '1.5rem 1rem',
                border: '1px solid #2F9BFF',
                borderRadius: '0.25rem',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                }}
              >
                500
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  color: 'white',
                  fontSize: '1rem',
                  marginTop: '0.5rem',
                }}
              >
                Tổng số lượng nhập
              </div>
            </div>
          </Col>
          <Col
            className={styles['hover_item']}
            style={{ width: '100%', marginTop: '1rem' }}
            xs={24}
            sm={24}
            md={11}
            lg={7}
            xl={7}
          >
            <div
              style={{
                display: 'flex',
                backgroundColor: '#5363E0',
                padding: '1.5rem 1rem',
                border: '1px solid #2F9BFF',
                borderRadius: '0.25rem',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                }}
              >
                8.000.000 VNĐ
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  color: 'white',
                  fontSize: '1rem',
                  marginTop: '0.5rem',
                }}
              >
                Tổng chi phí nhập
              </div>
            </div>
          </Col>
        </Row>
      </div>
      <div className={`${styles['promotion_manager']} ${styles['card']}`}>
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgb(236, 226, 226)',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div className={styles['promotion_manager_title']}>Danh sách đơn hàng nhập</div>
        </div>
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
                  marginLeft: '1rem',
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
            border: '1px solid rgb(235, 222, 222)',
            marginTop: '1rem',
          }}
        >
          <Table
            size="small"
            rowSelection={rowSelection}
            columns={columns}
            summary={(pageData) => {
              let totalPrice = 0
              pageData.forEach((values, index) => {
                totalPrice += parseInt(values.productQuantity)
              })

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell>
                      <Text></Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text>Tổng cộng:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text></Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text></Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text>{`${totalPrice}`}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text></Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text></Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text></Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )
            }}
            dataSource={data}
          />
        </div>
        {selectedRowKeys && selectedRowKeys.length > 0 ? (
          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Popconfirm title="Bạn chắc chắn muốn xóa?" okText="Yes" cancelText="No">
              <Button type="primary" danger size="large">
                Xóa báo cáo
              </Button>
            </Popconfirm>
          </div>
        ) : (
          ''
        )}
      </div>
    </>
  )
}
